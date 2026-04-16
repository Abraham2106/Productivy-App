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
