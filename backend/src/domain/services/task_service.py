from datetime import date
from uuid import UUID, uuid4

from ..entities.daily_metrics import DailyMetrics
from ..entities.score import Score
from ..entities.task import Task, TaskType
from ..interfaces.daily_score_repository import IDailyScoreRepository
from ..interfaces.metrics_repository import IMetricsRepository
from ..interfaces.scoring_strategy import IScoringStrategy
from ..interfaces.task_repository import ITaskRepository


class TaskService:
    """
    Domain service orchestrating task operations.

    RULES:
    - Never imports from /infra
    - Never contains scoring logic
    - All dependencies are injected via constructor
    """

    def __init__(
        self,
        repo: ITaskRepository,
        scorer: IScoringStrategy,
        metrics_repo: IMetricsRepository | None = None,
        daily_score_repo: IDailyScoreRepository | None = None,
    ) -> None:
        self._repo = repo
        self._scorer = scorer
        self._metrics_repo = metrics_repo
        self._daily_score_repo = daily_score_repo

    async def create_task(
        self, user_id: UUID, name: str, task_type: TaskType
    ) -> Task:
        task = Task(
            id=uuid4(),
            user_id=user_id,
            name=name,
            task_type=task_type,
            completed=False,
            date=date.today(),
        )
        saved_task = await self._repo.save(task)
        await self._sync_daily_score(saved_task.user_id, saved_task.date)
        return saved_task

    async def complete_task(self, task_id: UUID) -> Task:
        completed_task = await self._repo.mark_completed(task_id)
        await self._sync_daily_score(completed_task.user_id, completed_task.date)
        return completed_task

    async def get_today_tasks(self, user_id: UUID) -> list[Task]:
        return await self._repo.find_by_date(user_id, date.today())

    async def get_today_score(self, user_id: UUID) -> Score:
        """Fetches today's score and keeps the persisted snapshot in sync."""
        return await self.get_score_by_date(user_id, date.today())

    async def get_score_by_date(self, user_id: UUID, target_date: date) -> Score:
        tasks = await self._repo.find_by_date(user_id, target_date)
        metrics = await self._get_metrics_for_date(user_id, target_date)
        score = self._scorer.calculate(tasks, metrics)

        if self._daily_score_repo is not None:
            await self._daily_score_repo.upsert_score(user_id, target_date, score.value)

        return score

    async def _get_metrics_for_date(
        self, user_id: UUID, target_date: date
    ) -> DailyMetrics | None:
        if self._metrics_repo is None:
            return None
        return await self._metrics_repo.find_by_date(user_id, target_date)

    async def _sync_daily_score(self, user_id: UUID, target_date: date) -> None:
        if self._daily_score_repo is None:
            return
        await self.get_score_by_date(user_id, target_date)
