import math

from src.domain.entities.daily_metrics import DailyMetrics
from src.domain.entities.score import Score
from src.domain.entities.adaptive_score_context import AdaptiveScoreContext
from src.domain.entities.task import Task, TaskType
from src.domain.interfaces.scoring_strategy import IScoringStrategy


class RuleBasedStrategy(IScoringStrategy):
    """
    Scoring V1/V2 with dynamic conditioning formulas for daily metrics.

    Task rules remain unchanged:
      BASE completed -> +10 pts
      BASE not completed -> -5 pts
      ADDITIONAL completed -> +5 pts
      ADDITIONAL not completed -> 0 pts
    """

    async def calculate(
        self,
        tasks: list[Task],
        metrics: DailyMetrics | None = None,
        context: AdaptiveScoreContext | None = None,
    ) -> Score:
        breakdown: dict[str, int] = {}
        total = 0

        for task in tasks:
            if task.task_type == TaskType.BASE:
                points = 10 if task.completed else -5
            else:
                points = 5 if task.completed else 0

            breakdown[task.name] = points
            total += points

        if metrics is not None:
            metrics_points = {
                "sleep": self._sleep_points(metrics.sleep_hours),
                "phone": self._phone_points(metrics.phone_minutes),
                "study": self._study_points(metrics.study_minutes),
            }
            breakdown.update(metrics_points)
            total += sum(metrics_points.values())

        return Score(value=total, breakdown=breakdown)

    def _sleep_points(self, sleep_hours: float) -> int:
        if 7 <= sleep_hours <= 9:
            return 18
        if 5 <= sleep_hours < 7:
            return round(4 + ((sleep_hours - 5) / 2) * 14)
        if 9 < sleep_hours <= 10:
            return round(18 - (sleep_hours - 9) * 2)
        if sleep_hours > 10:
            return round(max(6, 16 - (sleep_hours - 10) * 2))

        inverse_drop = math.log1p((5 - sleep_hours) * 2) / math.log1p(10)
        return -round(8 + inverse_drop * 20)

    def _phone_points(self, phone_minutes: int) -> int:
        if phone_minutes < 30:
            return 18
        if phone_minutes <= 120:
            return round(18 - ((phone_minutes - 30) / 90) * 18)

        exceeded_minutes = phone_minutes - 120
        penalty = 4 * (2 ** (exceeded_minutes / 30) - 1)
        return -round(penalty)

    def _study_points(self, study_minutes: int) -> int:
        if study_minutes == 0:
            return -30

        study_hours = study_minutes / 60
        return round(9 * math.log1p(study_hours * 2))
