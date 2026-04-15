from enum import Enum

from pydantic import BaseModel


class HabitClassification(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class HabitPattern(BaseModel):
    task_name: str
    frequency_7d: int
    frequency_30d: int
    classification: HabitClassification
