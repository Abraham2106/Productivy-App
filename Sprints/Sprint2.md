# Architecture Prompt — Sprint 2: Evaluación y Análisis
## Productivity App · Personal Habit Tracker

---

## Prerequisito

Sprint 1 completado. Las siguientes interfaces deben existir y estar funcionando:
- `IScoringStrategy` con `RuleBasedStrategy` implementada
- `ITaskRepository` con `SupabaseTaskRepository` implementada
- `TaskService` con inyección de dependencias via FastAPI `Depends`
- Tablas `users`, `tasks`, `daily_scores`, `score_details` en Supabase

Si alguno de estos no existe, detente y completa el Sprint 1 antes de continuar.

---

## Objetivo del Sprint

Pasar de un sistema de registro a un sistema de análisis. Al final del sprint el usuario puede:
1. Registrar métricas diarias (sueño, uso de celular, tiempo de estudio)
2. Ver su score semanal
3. Identificar sus hábitos positivos y negativos
4. Ver una tendencia de los últimos 7 días

---

## Nuevas Migraciones SQL (Supabase)

```sql
-- Las tablas de S1 ya existen. Solo agregar:

-- Métricas diarias ya están en daily_scores (sleep_hours, phone_minutes, study_minutes)
-- Solo necesitamos asegurarnos de que el endpoint de registro las actualice.

-- Tabla de hábitos detectados (nueva en S2)
CREATE TABLE habit_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  frequency_7d INTEGER NOT NULL DEFAULT 0,   -- veces completada en 7 días
  frequency_30d INTEGER NOT NULL DEFAULT 0,  -- veces completada en 30 días
  classification TEXT CHECK (classification IN ('positive', 'negative', 'neutral')),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Nuevas Entidades de Dominio

### `DailyMetrics`

```python
# src/domain/entities/daily_metrics.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date

class DailyMetrics(BaseModel):
    user_id: UUID
    date: date
    sleep_hours: float = Field(ge=0, le=24)
    phone_minutes: int = Field(ge=0)
    study_minutes: int = Field(ge=0)
```

### `WeeklyScore`

```python
# src/domain/entities/weekly_score.py
from pydantic import BaseModel
from datetime import date

class DailyScoreSummary(BaseModel):
    date: date
    score: int

class WeeklyScore(BaseModel):
    total: int
    average: float
    best_day: date
    worst_day: date
    daily_breakdown: list[DailyScoreSummary]
```

### `HabitPattern`

```python
# src/domain/entities/habit_pattern.py
from enum import Enum
from pydantic import BaseModel
from uuid import UUID

class HabitClassification(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class HabitPattern(BaseModel):
    task_name: str
    frequency_7d: int
    frequency_30d: int
    classification: HabitClassification
```

---

## Motor de Reglas — Métricas (nuevo en S2)

### `MetricsScoringRule`

Las métricas de sueño, celular y estudio ahora contribuyen al score diario. Agregar esta lógica dentro de `RuleBasedStrategy.calculate()` — no crear una clase nueva para S2.

```
Sueño:
  >= 7 horas  → +10 pts
  5–6.9 horas → +0 pts
  < 5 horas   → -10 pts

Uso de celular:
  <= 60 min   → +10 pts
  61–120 min  → +0 pts
  > 120 min   → -10 pts

Tiempo de estudio:
  >= 60 min   → +10 pts
  30–59 min   → +5 pts
  < 30 min    → +0 pts
```

Actualizar `Score.breakdown` para incluir estas métricas:
```python
breakdown = {
  "Ejercicio": 10,
  "Meditación": -5,
  "sleep": 10,       # clave fija, no el nombre de una tarea
  "phone": -10,
  "study": 5,
}
```

`RuleBasedStrategy.calculate()` debe aceptar métricas opcionales:

```python
def calculate(
    self,
    tasks: list[Task],
    metrics: DailyMetrics | None = None
) -> Score: ...
```

Actualizar `IScoringStrategy` con la misma firma.

---

## Nuevas Interfaces

### `IMetricsRepository`

```python
# src/domain/interfaces/metrics_repository.py
from abc import ABC, abstractmethod
from uuid import UUID
from datetime import date
from ..entities.daily_metrics import DailyMetrics

class IMetricsRepository(ABC):

    @abstractmethod
    async def save(self, metrics: DailyMetrics) -> DailyMetrics: ...

    @abstractmethod
    async def find_by_date(self, user_id: UUID, date: date) -> DailyMetrics | None: ...

    @abstractmethod
    async def find_range(
        self, user_id: UUID, start: date, end: date
    ) -> list[DailyMetrics]: ...
```

### `IHabitRepository`

```python
# src/domain/interfaces/habit_repository.py
from abc import ABC, abstractmethod
from uuid import UUID
from ..entities.habit_pattern import HabitPattern

class IHabitRepository(ABC):

    @abstractmethod
    async def upsert(self, user_id: UUID, pattern: HabitPattern) -> HabitPattern: ...

    @abstractmethod
    async def find_by_user(self, user_id: UUID) -> list[HabitPattern]: ...
```

---

## Nuevos Servicios

### `MetricsService`

```python
# src/domain/services/metrics_service.py
class MetricsService:
    def __init__(
        self,
        metrics_repo: IMetricsRepository,
        scorer: IScoringStrategy
    ): ...

    async def register_metrics(self, metrics: DailyMetrics) -> DailyMetrics: ...
    # Guarda las métricas y recalcula el score del día si ya existe.
```

### `AnalyticsService`

```python
# src/domain/services/analytics_service.py
class AnalyticsService:
    def __init__(
        self,
        task_repo: ITaskRepository,
        metrics_repo: IMetricsRepository,
        habit_repo: IHabitRepository,
        scorer: IScoringStrategy
    ): ...

    async def get_weekly_score(self, user_id: UUID) -> WeeklyScore: ...
    # Calcula score para cada día de los últimos 7 días.
    # Usa daily_scores guardados, no recalcula desde tareas.

    async def get_trend(self, user_id: UUID, days: int = 7) -> list[DailyScoreSummary]: ...
    # Retorna scores de los últimos N días para el gráfico de tendencia.

    async def compute_habit_patterns(self, user_id: UUID) -> list[HabitPattern]: ...
    # Regla de clasificación:
    #   completada >= 5 de 7 días → POSITIVE
    #   completada <= 1 de 7 días y es BASE → NEGATIVE
    #   resto → NEUTRAL
    # Persiste vía habit_repo.upsert()
```

---

## Nuevos Endpoints REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/metrics/today` | Registrar métricas del día |
| `GET` | `/metrics/today` | Obtener métricas del día actual |
| `GET` | `/score/week` | Score semanal con breakdown diario |
| `GET` | `/score/trend` | Lista de scores últimos 7 días |
| `GET` | `/habits` | Hábitos clasificados del usuario |

**Request body `POST /metrics/today`:**
```json
{
  "user_id": "uuid",
  "sleep_hours": 7.5,
  "phone_minutes": 45,
  "study_minutes": 90
}
```

**Response `GET /score/week`:**
```json
{
  "total": 185,
  "average": 26.4,
  "best_day": "2025-01-14",
  "worst_day": "2025-01-11",
  "daily_breakdown": [
    { "date": "2025-01-08", "score": 15 },
    { "date": "2025-01-09", "score": 35 }
  ]
}
```

**Response `GET /habits`:**
```json
[
  { "task_name": "Ejercicio", "frequency_7d": 6, "frequency_30d": 24, "classification": "positive" },
  { "task_name": "Meditación", "frequency_7d": 1, "frequency_30d": 5, "classification": "negative" }
]
```

---

## Cambios en Archivos Existentes

### `IScoringStrategy` — actualizar firma

```python
# ANTES (S1)
def calculate(self, tasks: list[Task]) -> Score: ...

# AHORA (S2)
def calculate(self, tasks: list[Task], metrics: DailyMetrics | None = None) -> Score: ...
```

Este cambio es retrocompatible: `metrics=None` preserva el comportamiento de S1.

### `TaskService.get_today_score` — pasar métricas

```python
async def get_today_score(self, user_id: UUID) -> Score:
    tasks = await self.repo.find_by_date(user_id, date.today())
    metrics = await self.metrics_repo.find_by_date(user_id, date.today())
    return self.scorer.calculate(tasks, metrics)
```

`TaskService` necesita recibir `IMetricsRepository` como nueva dependencia inyectada.

---

## Nuevas Implementaciones de Infraestructura

```
/src/infrastructure
  /repositories
    supabase_metrics_repository.py   # implements IMetricsRepository
    supabase_habit_repository.py     # implements IHabitRepository
```

Misma regla que S1: el SDK de Supabase solo se importa aquí.

---

## Estructura de Directorios Actualizada

```
/src
  /domain
    /entities
      task.py
      score.py
      daily_metrics.py        ← nuevo
      weekly_score.py         ← nuevo
      habit_pattern.py        ← nuevo
    /interfaces
      task_repository.py
      scoring_strategy.py     ← firma actualizada
      metrics_repository.py   ← nueva
      habit_repository.py     ← nueva
    /services
      task_service.py         ← actualizado
      scoring_service.py
      metrics_service.py      ← nuevo
      analytics_service.py    ← nuevo
  /infrastructure
    /repositories
      supabase_task_repository.py
      supabase_metrics_repository.py  ← nuevo
      supabase_habit_repository.py    ← nuevo
    /scoring
      rule_based_strategy.py   ← actualizado con métricas
  /presentation
    /api
      tasks_router.py
      score_router.py          ← actualizado con /week y /trend
      metrics_router.py        ← nuevo
      habits_router.py         ← nuevo
```

---

## Tests Requeridos (Sprint 2)

### `test_rule_based_strategy_metrics.py`
- Sueño >= 7h → +10 pts en breakdown con clave `"sleep"`
- Sueño < 5h → -10 pts
- Celular <= 60 min → +10 pts
- Celular > 120 min → -10 pts
- Estudio >= 60 min → +10 pts
- `metrics=None` → mismo resultado que S1 (sin cambio de score de tareas)

### `test_analytics_service.py`
- `get_weekly_score` retorna `best_day` correcto dado scores mock
- `compute_habit_patterns`: tarea completada 6/7 días → `POSITIVE`
- `compute_habit_patterns`: tarea BASE completada 1/7 días → `NEGATIVE`
- Mockear todos los repositorios — sin llamadas reales a Supabase

### `test_supabase_metrics_repository.py` (integración)
- `save` + `find_by_date` round-trip
- `find_range` retorna solo días dentro del rango

---

## Checklist de Validación antes de PR

- [ ] `IScoringStrategy.calculate` tiene firma con `metrics: DailyMetrics | None = None`
- [ ] `RuleBasedStrategy` pasa todos los tests de S1 sin modificación (retrocompatibilidad)
- [ ] `RuleBasedStrategy` pasa todos los tests de métricas de S2
- [ ] `AnalyticsService` no importa nada de `/infrastructure`
- [ ] `GET /score/week` retorna `WeeklyScore` completo
- [ ] `GET /habits` retorna clasificaciones correctas
- [ ] Tests unitarios de `AnalyticsService` usan mocks exclusivamente

---

## Lo que NO implementar en Sprint 2

- `AIStrategy` ni llamadas a LLM (S3)
- Clasificación automática de tareas por IA (S3)
- Retroalimentación tipo "coach" (S3)
- Módulo Pomodoro (S3)
- Empaquetado o versión móvil (S4)