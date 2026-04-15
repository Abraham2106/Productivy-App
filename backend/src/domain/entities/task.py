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
