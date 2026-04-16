# Architecture Prompt - Sprint 3: Inteligencia Adaptativa
## Productivity App - Personal Habit Tracker

---

## Prerequisito

Sprint 2 y Sprint 2.5 completados. Las siguientes piezas deben existir y estar funcionando antes de empezar:
- `IScoringStrategy` implementada y usada por el backend
- `RuleBasedStrategy` funcionando con tareas y metricas
- `TaskService`, `MetricsService` y `AnalyticsService`
- tablas `tasks`, `daily_scores`, `score_details` y `habit_patterns`
- frontend con `DailyView`, `WeeklyView` y `FocusView`
- `PomodoroTimer` ya existente como componente visual funcional
- autenticacion basica con Supabase Auth ya resuelta en frontend

Si alguno de estos puntos no existe, detente y completa primero S1, S2 y S2.5.

---

## Objetivo del Sprint

Pasar de un scoring basado en reglas fijas a un scoring adaptativo apoyado por IA. Al final del sprint el usuario puede:
1. obtener un score diario personalizado segun su historial reciente
2. recibir retroalimentacion tipo coach basada en sus datos reales
3. detectar patrones de comportamiento mas ricos que la frecuencia simple de S2
4. registrar sesiones reales de enfoque desde el modulo Pomodoro existente
5. comparar el dia actual contra su patron habitual, no solo contra reglas genericas

**Objetivo oficial del sprint:**
El motor de evaluacion evoluciona de reglas fijas a IA. El sistema personaliza el scoring segun el historial del usuario.

**Valor entregado:**
Responde a "que tan diferente fue mi comportamiento esta semana vs. mi patron habitual?"

Escala objetivo del sprint: `1 a 10 usuarios`, priorizando claridad arquitectonica, degradacion segura y trazabilidad de decisiones de IA.

---

## Decisiones Arquitectonicas del Sprint 3

- `AIStrategy` sera una nueva implementacion de `IScoringStrategy`.
- `RuleBasedStrategy` no se elimina; queda como fallback si la IA falla o no esta disponible.
- El scoring adaptativo usa como contexto: tareas del dia, metricas del dia, score reciente, habitos detectados y sesiones de enfoque.
- La IA no reemplaza los datos base del sistema; propone ajustes y explicaciones sobre datos ya existentes.
- El SDK del proveedor LLM solo puede vivir en `backend/src/infrastructure/ai/`.
- Las decisiones de IA deben ser auditables: el sistema debe guardar resumen, ajustes y patrones detectados.
- El modulo Pomodoro no se redisena desde cero: se reutiliza `PomodoroTimer` y `FocusView`, y se les agrega persistencia y analitica.
- Los habitos de S2 se conservan. Sprint 3 agrega una capa superior de interpretacion, no una reimplementacion del motor de frecuencia.

### Alcance incluido
- `AIStrategy` con LLM
- ajuste dinamico de puntuaciones segun historial
- feedback diario tipo coach
- deteccion de patrones de comportamiento
- persistencia de sesiones Pomodoro
- integracion de datos de enfoque dentro del contexto adaptativo

### Fuera de alcance
- rehacer login, logout o sesion persistente
- reimplementar metricas diarias o score semanal basico
- redisenar `DailyView`, `WeeklyView` o `FocusView`
- social login, MFA, reset de password
- roles, permisos o auth avanzada en backend
- multiusuario colaborativo, equipos o multi-tenant

---

## Regla de Continuidad

No volver a implementar en este sprint:
- CRUD base de tareas de S1
- metricas diarias, score semanal y habitos base de S2
- registro, login y sesion persistente de S2.5
- UI visual basica del Pomodoro ya existente

En otras palabras:
- S1 y S2 ya construyeron la base de datos y la analitica base
- S2.5 ya resolvio identidad en frontend
- Sprint 3 se concentra en personalizacion, IA y enfoque persistido

---

## Cambio Arquitectonico Necesario

Hoy `IScoringStrategy.calculate()` es sincrona, pero un `AIStrategy` con LLM requiere IO. Por eso, en este sprint se debe promover el contrato a asincrono.

### Cambio obligatorio

Antes:

```python
class IScoringStrategy(ABC):
    @abstractmethod
    def calculate(
        self,
        tasks: list[Task],
        metrics: DailyMetrics | None = None,
    ) -> Score: ...
```

Ahora:

```python
class IScoringStrategy(ABC):
    @abstractmethod
    async def calculate(
        self,
        tasks: list[Task],
        metrics: DailyMetrics | None = None,
        context: "AdaptiveScoreContext | None" = None,
    ) -> Score: ...
```

Consecuencias:
- `RuleBasedStrategy` se adapta al contrato async pero ignora `context`
- `AIStrategy` usa `context`
- `TaskService`, `MetricsService` y cualquier otro caller pasan a usar `await scorer.calculate(...)`

### Prerequisito critico

ADR-01 debe estar bien implementado. Si `IScoringStrategy` no existe o no esta desacoplada del servicio, `T-018` se convierte en refactor masivo.

---

## Nuevas Migraciones SQL

Sprint 3 no debe rehacer tablas base. Solo agrega lo estrictamente necesario para IA y enfoque.

### 1. Sesiones de enfoque

```sql
create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  session_type text not null check (session_type in ('work', 'break')),
  planned_minutes integer not null check (planned_minutes > 0),
  actual_minutes integer not null check (actual_minutes >= 0),
  completed boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists idx_focus_sessions_user_started_at
  on public.focus_sessions(user_id, started_at desc);
```

### 2. Feedback y trazabilidad de IA

```sql
create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  summary text not null,
  recommendations jsonb not null default '[]'::jsonb,
  detected_patterns jsonb not null default '[]'::jsonb,
  scoring_breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  unique(user_id, date)
);
```

### 3. RLS

Si ya existe RLS en las tablas anteriores, extenderla tambien a:
- `focus_sessions`
- `ai_feedback`

No crear tablas nuevas para auth ni duplicar informacion de `auth.users`.

---

## Nuevas Entidades de Dominio

### `AdaptiveScoreContext`

```python
# backend/src/domain/entities/adaptive_score_context.py
from datetime import date
from pydantic import BaseModel
from .daily_metrics import DailyMetrics
from .habit_pattern import HabitPattern
from .score import Score
from .task import Task

class FocusSessionSummary(BaseModel):
    completed_work_sessions: int
    completed_break_sessions: int
    total_focus_minutes: int

class AdaptiveScoreContext(BaseModel):
    date: date
    today_tasks: list[Task]
    today_metrics: DailyMetrics | None = None
    recent_scores: list[int]
    recent_habits: list[HabitPattern]
    focus_summary: FocusSessionSummary | None = None
```

### `CoachFeedback`

```python
# backend/src/domain/entities/coach_feedback.py
from datetime import date
from pydantic import BaseModel

class CoachFeedback(BaseModel):
    date: date
    summary: str
    recommendations: list[str]
```

### `BehaviorPattern`

```python
# backend/src/domain/entities/behavior_pattern.py
from pydantic import BaseModel

class BehaviorPattern(BaseModel):
    title: str
    description: str
    impact: str
    confidence: float
```

### `FocusSession`

```python
# backend/src/domain/entities/focus_session.py
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID

class FocusSession(BaseModel):
    id: UUID
    user_id: UUID
    started_at: datetime
    ended_at: datetime
    session_type: str
    planned_minutes: int = Field(gt=0)
    actual_minutes: int = Field(ge=0)
    completed: bool = True
```

---

## Nuevas Interfaces

### `IFocusSessionRepository`

```python
# backend/src/domain/interfaces/focus_session_repository.py
from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID
from ..entities.focus_session import FocusSession

class IFocusSessionRepository(ABC):
    @abstractmethod
    async def save(self, session: FocusSession) -> FocusSession: ...

    @abstractmethod
    async def find_by_date(self, user_id: UUID, target_date: date) -> list[FocusSession]: ...
```

### `IAIInsightsProvider`

```python
# backend/src/domain/interfaces/ai_insights_provider.py
from abc import ABC, abstractmethod
from ..entities.adaptive_score_context import AdaptiveScoreContext
from ..entities.behavior_pattern import BehaviorPattern
from ..entities.coach_feedback import CoachFeedback

class AIInsightResult(BaseModel):
    score_adjustments: dict[str, int]
    feedback_summary: str
    recommendations: list[str]
    patterns: list[BehaviorPattern]

class IAIInsightsProvider(ABC):
    @abstractmethod
    async def analyze_day(self, context: AdaptiveScoreContext) -> AIInsightResult: ...
```

Nota:
- el proveedor LLM es una interfaz de borde
- el dominio no conoce SDKs concretos
- si el proveedor falla, el sistema cae a `RuleBasedStrategy`

---

## Implementacion de `AIStrategy`

### Ubicacion sugerida

```text
backend/src
  /infrastructure
    /ai
      llm_insights_provider.py
    /scoring
      ai_strategy.py
```

### Regla funcional

`AIStrategy` no inventa tareas ni metricas. Parte del score base y aplica ajustes limitados y explicables.

Flujo sugerido:
1. calcular score base usando la misma logica de `RuleBasedStrategy`
2. construir `AdaptiveScoreContext`
3. pedir al proveedor IA un ajuste acotado
4. mezclar ajustes con el breakdown existente
5. retornar `Score`
6. persistir feedback y patrones detectados

### Limites del ajuste

Para mantener control:
- no permitir que la IA cambie el score total mas de `+-20` puntos por dia
- no permitir puntos sin razon textual
- toda clave generada por IA debe ir con prefijo `ai_`

Ejemplo de breakdown final:

```python
{
  "Ejercicio": 10,
  "sleep": 12,
  "phone": -4,
  "ai_consistency_bonus": 6,
  "ai_focus_penalty": -2,
}
```

### Contrato esperado del proveedor IA

El LLM debe responder JSON estructurado, no texto libre.

Ejemplo:

```json
{
  "score_adjustments": {
    "ai_consistency_bonus": 6,
    "ai_late_phone_penalty": -2
  },
  "feedback_summary": "Hoy rendiste mejor que tu promedio por constancia y enfoque.",
  "recommendations": [
    "Repite el bloque de estudio de la manana",
    "Reduce el uso del celular despues de las 9 pm"
  ],
  "patterns": [
    {
      "title": "Buenas mananas, noches inestables",
      "description": "Duermes bien y estudias mejor al inicio del dia, pero el celular sube de noche.",
      "impact": "mixed",
      "confidence": 0.81
    }
  ]
}
```

Si el JSON es invalido:
- loggear
- ignorar el resultado IA
- usar fallback deterministicamente

---

## Nuevos Servicios

### `AdaptiveScoringService`

```python
# backend/src/domain/services/adaptive_scoring_service.py
class AdaptiveScoringService:
    def __init__(
        self,
        task_repo: ITaskRepository,
        metrics_repo: IMetricsRepository,
        habit_repo: IHabitRepository,
        daily_score_repo: IDailyScoreRepository,
        focus_repo: IFocusSessionRepository,
        scorer: IScoringStrategy,
    ): ...

    async def get_today_score(self, user_id: UUID) -> Score: ...
    async def build_context(self, user_id: UUID, target_date: date) -> AdaptiveScoreContext: ...
```

Responsabilidad:
- construir el contexto adaptativo
- pedir score al strategy activo
- persistir el score final del dia

### `CoachService`

```python
# backend/src/domain/services/coach_service.py
class CoachService:
    def __init__(
        self,
        feedback_repo: IAIFeedbackRepository,
        ai_provider: IAIInsightsProvider,
    ): ...

    async def get_or_generate_today_feedback(
        self,
        user_id: UUID,
        context: AdaptiveScoreContext,
    ) -> CoachFeedback: ...
```

### `FocusService`

```python
# backend/src/domain/services/focus_service.py
class FocusService:
    def __init__(self, repo: IFocusSessionRepository): ...

    async def register_session(self, session: FocusSession) -> FocusSession: ...
    async def get_today_summary(self, user_id: UUID) -> FocusSessionSummary: ...
```

---

## Deteccion de Patrones

Sprint 2 ya clasifica habitos por frecuencia. Sprint 3 agrega patrones mas interpretables.

Ejemplos validos de patrones:
- mejor score en dias con al menos `2` sesiones de enfoque
- caida de score cuando `phone_minutes > 120`
- mejor cumplimiento de tareas base tras `sleep_hours >= 7`
- dias con muchas tareas adicionales pero baja finalizacion de tareas base

Regla:
- un patron debe combinar al menos dos fuentes de senal
- no basta con repetir "completaste X veces una tarea"

Fuentes permitidas:
- tareas
- metricas
- `daily_scores`
- `habit_patterns`
- `focus_sessions`

---

## Nuevos Endpoints REST

Los endpoints existentes se conservan, pero `GET /score/today` pasa a usar el scoring adaptativo.

### Endpoints nuevos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/coach/today` | Retorna feedback del dia generado por IA |
| `GET` | `/patterns` | Retorna patrones de comportamiento detectados |
| `POST` | `/focus/sessions` | Registra una sesion Pomodoro completada |
| `GET` | `/focus/today` | Retorna resumen de sesiones del dia |

### `POST /focus/sessions`

Request body:

```json
{
  "started_at": "2026-04-15T09:00:00Z",
  "ended_at": "2026-04-15T09:25:00Z",
  "session_type": "work",
  "planned_minutes": 25,
  "actual_minutes": 25,
  "completed": true
}
```

### `GET /coach/today`

Debe responder:

```json
{
  "date": "2026-04-15",
  "summary": "Hoy rendiste por encima de tu promedio semanal.",
  "recommendations": [
    "Empieza por una tarea base en la manana",
    "Evita picos de celular despues del estudio"
  ]
}
```

---

## Cambios en Frontend

### Pomodoro

No rehacer:
- `frontend/src/components/PomodoroTimer.tsx`
- `frontend/src/views/FocusView.tsx`

Extender:
- persistir sesiones completadas
- mostrar sesiones del dia y minutos acumulados
- al completar una sesion `work`, enviar datos a `/focus/sessions`

### Daily View

Agregar una card breve de coach:
- resumen del dia
- 1 a 2 recomendaciones maximo

### Weekly View

Agregar una seccion de patrones detectados:
- no repetir `HabitPatternsCard` tal cual
- mostrar patrones interpretables y su impacto

### Reglas de UX

- no redisenar la app entera
- reutilizar el sistema visual actual
- si no hay feedback IA, mostrar fallback neutral

---

## Cambios en Archivos Existentes

### Backend

- `backend/src/domain/interfaces/scoring_strategy.py`
- `backend/src/domain/services/task_service.py`
- `backend/src/domain/services/metrics_service.py`
- `backend/src/presentation/api/score_router.py`
- `backend/src/presentation/api/main.py`
- `backend/src/presentation/api/dependencies.py`

### Nuevos archivos backend sugeridos

- `backend/src/domain/entities/adaptive_score_context.py`
- `backend/src/domain/entities/coach_feedback.py`
- `backend/src/domain/entities/behavior_pattern.py`
- `backend/src/domain/entities/focus_session.py`
- `backend/src/domain/interfaces/focus_session_repository.py`
- `backend/src/domain/interfaces/ai_insights_provider.py`
- `backend/src/domain/services/adaptive_scoring_service.py`
- `backend/src/domain/services/coach_service.py`
- `backend/src/domain/services/focus_service.py`
- `backend/src/infrastructure/ai/llm_insights_provider.py`
- `backend/src/infrastructure/scoring/ai_strategy.py`
- `backend/src/infrastructure/repositories/supabase_focus_session_repository.py`
- `backend/src/presentation/api/coach_router.py`
- `backend/src/presentation/api/focus_router.py`
- `backend/src/presentation/api/patterns_router.py`

### Frontend

- `frontend/src/components/PomodoroTimer.tsx`
- `frontend/src/views/FocusView.tsx`
- `frontend/src/views/DailyView.tsx`
- `frontend/src/views/WeeklyView.tsx`
- `frontend/src/hooks/useTasks.ts`
- `frontend/src/types/index.ts`

---

## Tests Requeridos

### Backend

- `RuleBasedStrategy` sigue funcionando igual cuando `context=None`
- `AIStrategy` aplica ajustes validos dentro del limite permitido
- si el proveedor IA falla, el score vuelve a fallback sin romper el endpoint
- `AdaptiveScoringService` construye contexto correcto con datos de 7 y 30 dias
- `CoachService` persiste y retorna feedback diario
- `FocusService` registra sesiones y resume minutos correctamente

### Frontend

- completar una sesion Pomodoro registra una llamada correcta a `/focus/sessions`
- `FocusView` muestra conteo del dia
- `DailyView` muestra feedback de coach si existe
- `WeeklyView` muestra patrones sin romper la vista actual
- si la IA no responde, la UI muestra fallback sin crashear

### Seguridad y arquitectura

- ningun SDK LLM aparece fuera de `backend/src/infrastructure/ai/`
- los servicios de dominio no contienen prompts hardcodeados
- la app sigue operando con `RuleBasedStrategy` si se desactiva IA

---

## Checklist de Validacion antes de PR

- [ ] `IScoringStrategy` fue promovida a async sin romper contratos principales
- [ ] existe `AIStrategy` conectada via dependency injection
- [ ] `RuleBasedStrategy` sigue disponible como fallback
- [ ] el score adaptativo usa historial, no solo tareas del dia
- [ ] existe persistencia de sesiones Pomodoro
- [ ] `GET /coach/today` funciona
- [ ] `GET /patterns` funciona
- [ ] la UI del Pomodoro existente fue extendida, no rehecha
- [ ] la app tolera errores del proveedor IA
- [ ] no se reimplemento auth ni analitica base ya resuelta en sprints anteriores

---

## Lo que NO implementar en Sprint 3

- login y registro otra vez
- JWT validation en backend como foco principal del sprint
- un chat general con IA
- recomendaciones inventadas sin usar datos del usuario
- un modelo que escriba directo en tablas de negocio
- rediseno total del dashboard
- nueva logica de frecuencia que duplique `habit_patterns`

---

## Resultado Esperado del Sprint

Al cerrar Sprint 3, la aplicacion deja de ofrecer un score puramente fijo y pasa a entregar evaluaciones personalizadas segun el comportamiento reciente del usuario. El sistema mantiene la base construida en S1 y S2, aprovecha la identidad ya resuelta en S2.5 y agrega una capa de IA util, acotada y auditable.

El usuario no solo ve cuanto hizo, sino como ese resultado se compara con su propio patron, que recomendaciones concretas surgen de sus datos y como sus sesiones reales de enfoque influyen en el rendimiento del dia.
