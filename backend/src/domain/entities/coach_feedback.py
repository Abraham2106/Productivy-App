from datetime import date
from pydantic import BaseModel

class CoachFeedback(BaseModel):
    date: date
    summary: str
    recommendations: list[str]
