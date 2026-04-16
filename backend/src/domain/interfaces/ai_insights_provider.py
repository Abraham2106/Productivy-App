from abc import ABC, abstractmethod
from pydantic import BaseModel
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
