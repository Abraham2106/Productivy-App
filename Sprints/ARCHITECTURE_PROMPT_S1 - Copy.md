# Architecture Prompt — Sprint 1 Implementation
## Productivity App · Personal Habit Tracker

---

## Tu Rol

Eres un desarrollador senior implementando el Sprint 1 de una aplicación personal de productividad. Tu trabajo es escribir código limpio, tipado y testeable. No generes código sin antes verificar que respeta las interfaces y contratos definidos en este documento. Ante cualquier ambigüedad, pregunta antes de implementar.

---

## Contexto del Sistema

Aplicación personal de seguimiento de hábitos diarios. 1–10 usuarios. No requiere alta disponibilidad. El objetivo del Sprint 1 es tener un sistema funcional end-to-end donde el usuario pueda registrar tareas del día, marcarlas como completadas y obtener un puntaje diario.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| API | FastAPI (Python 3.11+) |
| Base de datos | Supabase (PostgreSQL) |
| Validación | Pydantic v2 |
| Tests | pytest + pytest-asyncio |
| ORM / queries | Supabase Python SDK — solo en capa de infraestructura |

---

## Regla Arquitectónica Innegociable

**El SDK de Supabase nunca debe importarse fuera de `/src/infrastructure/`.** El dominio no conoce a Supabase. Si necesitas acceder a datos desde un servicio de dominio, hazlo a través de la interfaz `ITaskRepository`.

---

## Estructura de Directorios

```
/src
  /domain
    /entities
      task.py          # Entidad Task + enum TaskType
      score.py         # Value object Score
    /interfaces
      task_repository.py    # ITaskRepository (ABC)
      scoring_strategy.py   # IScoringStrategy (ABC)
    /services
      task_service.py       # TaskService
      scoring_service.py    # ScoringService
  /application
    /use_cases
      complete_task.py
      get_daily_score.py
  /infrastructure
    /repositories
      supabase_task_repository.py   # implements ITaskRepository
    /scoring
      rule_based_strategy.py        # implements IScoringStrategy (V1)
  /presentation
    /api
      tasks_router.py
      score_router.py
      main.py
/tests
  /unit
    test_rule_based_strategy.py
    test_task_service.py
  /integration
    test_supabase_repository.py
/config
  settings.py    # Pydantic BaseSettings, lee .env
```

---

## Modelo de Datos (Supabase / PostgreSQL)

```sql
-- Ejecutar en Supabase SQL Editor

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE task_type AS ENUM ('BASE', 'ADDITIONAL');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  task_type task_type NOT NULL DEFAULT 'BASE',
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  sleep_hours FLOAT,
  phone_minutes INTEGER,
  study_minutes INTEGER,
  UNIQUE(user_id, date)
);

CREATE TABLE score_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_score_id UUID REFERENCES daily_scores(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  points INTEGER NOT NULL
);
```

---

## Contratos de Dominio

### Entidad `Task`

```python
# src/domain/entities/task.py
from enum import Enum
from uuid import UUID
from datetime import date
from pydantic import BaseModel

class TaskType(str, Enum):
    BASE = "BASE"
    ADDITIONAL = "ADDITIONAL"

class Task(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    task_type: TaskType
    completed: bool
    date: date
```

### Value Object `Score`

```python
# src/domain/entities/score.py
from pydantic import BaseModel

class Score(BaseModel):
    value: int
    breakdown: dict[str, int]  # {"task_name": points}
```

### Interfaz `ITaskRepository`

```python
# src/domain/interfaces/task_repository.py
from abc import ABC, abstractmethod
from uuid import UUID
from datetime import date
from ..entities.task import Task, TaskType

class ITaskRepository(ABC):

    @abstractmethod
    async def save(self, task: Task) -> Task: ...

    @abstractmethod
    async def find_by_id(self, task_id: UUID) -> Task | None: ...

    @abstractmethod
    async def find_by_date(self, user_id: UUID, date: date) -> list[Task]: ...

    @abstractmethod
    async def mark_completed(self, task_id: UUID) -> Task: ...
```

### Interfaz `IScoringStrategy`

```python
# src/domain/interfaces/scoring_strategy.py
from abc import ABC, abstractmethod
from ..entities.task import Task
from ..entities.score import Score

class IScoringStrategy(ABC):

    @abstractmethod
    def calculate(self, tasks: list[Task]) -> Score: ...
```

---

## Lógica de Scoring V1 (RuleBasedStrategy)

Implementa `IScoringStrategy`. Reglas:

| Condición | Puntos |
|-----------|--------|
| Tarea `BASE` completada | +10 pts |
| Tarea `BASE` no completada | -5 pts |
| Tarea `ADDITIONAL` completada | +5 pts |
| Tarea `ADDITIONAL` no completada | 0 pts (sin penalización) |

El `Score.value` es la suma total. El `Score.breakdown` es `{task.name: points}` para cada tarea.

---

## TaskService

```python
# Contrato esperado — implementa tú el cuerpo
class TaskService:
    def __init__(
        self,
        repo: ITaskRepository,        # inyectado, nunca instanciado aquí
        scorer: IScoringStrategy      # inyectado, nunca instanciado aquí
    ): ...

    async def create_task(self, user_id: UUID, name: str, task_type: TaskType) -> Task: ...
    async def complete_task(self, task_id: UUID) -> Task: ...
    async def get_today_tasks(self, user_id: UUID) -> list[Task]: ...
    async def get_today_score(self, user_id: UUID) -> Score: ...
```

`get_today_score` debe: obtener tareas del día vía `repo`, calcular score vía `scorer.calculate(tasks)`. No contiene lógica de puntuación.

---

## Endpoints REST (Sprint 1)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/tasks` | Crear tarea |
| `PATCH` | `/tasks/{id}/complete` | Marcar como completada |
| `GET` | `/tasks/today` | Listar tareas del día actual |
| `GET` | `/score/today` | Score del día actual |

**Request body de `POST /tasks`:**
```json
{
  "user_id": "uuid",
  "name": "string",
  "task_type": "BASE | ADDITIONAL"
}
```

**Response de `GET /score/today`:**
```json
{
  "score": 35,
  "breakdown": {
    "Ejercicio": 10,
    "Leer": 10,
    "Meditación": -5,
    "Proyecto personal": 5,
    "Llamar al médico": 5
  }
}
```

---

## Inyección de Dependencias

Usa el sistema de `Depends` de FastAPI. El grafo de dependencias se construye en `main.py`. Ejemplo:

```python
# presentation/api/main.py
def get_task_service() -> TaskService:
    repo = SupabaseTaskRepository(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    scorer = RuleBasedStrategy()
    return TaskService(repo=repo, scorer=scorer)

@router.get("/score/today")
async def get_score(service: TaskService = Depends(get_task_service)):
    ...
```

Nunca instancies `SupabaseTaskRepository` ni `RuleBasedStrategy` dentro de un servicio de dominio.

---

## Tests Requeridos (Sprint 1)

### `test_rule_based_strategy.py`
- Tarea BASE completada → +10 pts
- Tarea BASE no completada → -5 pts
- Tarea ADDITIONAL completada → +5 pts
- Tarea ADDITIONAL no completada → 0 pts
- Mix de tareas → score correcto y breakdown correcto

### `test_task_service.py`
- Mockear `ITaskRepository` e `IScoringStrategy`
- `get_today_score` llama a `scorer.calculate` con las tareas del día
- `complete_task` delega a `repo.mark_completed`
- `TaskService` nunca importa una implementación concreta

---

## Variables de Entorno

```env
# .env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your-anon-key
APP_ENV=development
```

```python
# config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Checklist de Validación antes de hacer PR

- [ ] `IScoringStrategy` y `ITaskRepository` son ABCs, sin lógica concreta
- [ ] `TaskService` no importa nada de `/infrastructure`
- [ ] `SupabaseTaskRepository` es la única clase que importa el SDK de Supabase
- [ ] Todos los tests de `test_rule_based_strategy.py` pasan
- [ ] Todos los tests de `test_task_service.py` usan mocks, no implementaciones reales
- [ ] `GET /score/today` retorna `Score` con `value` y `breakdown`
- [ ] No hay lógica de scoring en ningún router ni en `TaskService`

---

## Lo que NO debes implementar en Sprint 1

- Autenticación (Supabase Auth va en S2+)
- Métricas de sueño, celular, estudio (S2)
- `AIStrategy` ni ninguna llamada a LLM (S3)
- Dashboard con gráficos (S2)
- Módulo Pomodoro (S3)

Si algo no está en el checklist del Sprint 1, no lo implementes. Abre una issue y referencia el ID de tarea del backlog (T-0XX).
