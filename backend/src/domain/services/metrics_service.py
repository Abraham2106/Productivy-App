from datetime import date
from uuid import UUID

from ..entities.daily_metrics import DailyMetrics
from ..interfaces.daily_score_repository import IDailyScoreRepository
from ..interfaces.metrics_repository import IMetricsRepository
from ..interfaces.scoring_strategy import IScoringStrategy
from ..interfaces.task_repository import ITaskRepository


class MetricsService:
    def __init__(
        self,
        metrics_repo: IMetricsRepository,
        task_repo: ITaskRepository,
        scorer: IScoringStrategy,
        daily_score_repo: IDailyScoreRepository | None = None,
    ) -> None:
        self._metrics_repo = metrics_repo
        self._task_repo = task_repo
        self._scorer = scorer
        self._daily_score_repo = daily_score_repo

    async def register_metrics(self, metrics: DailyMetrics) -> DailyMetrics:
        saved_metrics = await self._metrics_repo.save(metrics)
        tasks = await self._task_repo.find_by_date(metrics.user_id, metrics.date)
        score = self._scorer.calculate(tasks, saved_metrics)

        if self._daily_score_repo is not None:
            await self._daily_score_repo.upsert_score(
                metrics.user_id, metrics.date, score.value
            )

        return saved_metrics

    async def get_today_metrics(self, user_id: UUID) -> DailyMetrics | None:
        return await self._metrics_repo.find_by_date(user_id, date.today())
