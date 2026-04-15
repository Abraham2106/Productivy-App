from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field


class DailyMetrics(BaseModel):
    user_id: UUID
    date: date
    sleep_hours: float = Field(ge=0, le=24)
    phone_minutes: int = Field(ge=0)
    study_minutes: int = Field(ge=0)
