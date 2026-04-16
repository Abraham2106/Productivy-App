from abc import ABC, abstractmethod

from ..entities.daily_metrics import DailyMetrics
from ..entities.task import Task
from ..entities.score import Score
from ..entities.adaptive_score_context import AdaptiveScoreContext

class IScoringStrategy(ABC):
    """Strategy pattern for score calculation. Allows V1 → V3 swap without
    touching TaskService or any other domain/application code."""

    @abstractmethod
    async def calculate(
        self,
        tasks: list[Task],
        metrics: DailyMetrics | None = None,
        context: AdaptiveScoreContext | None = None,
    ) -> Score: ...
