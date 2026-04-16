from pydantic import BaseModel

class BehaviorPattern(BaseModel):
    title: str
    description: str
    impact: str
    confidence: float
