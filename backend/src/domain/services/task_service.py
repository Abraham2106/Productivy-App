from uuid import UUID, uuid4
from datetime import date

from ..entities.task import Task, TaskType
from ..entities.score import Score
from ..interfaces.task_repository import ITaskRepository
from ..interfaces.scoring_strategy import IScoringStrategy


class TaskService:
    """
    Domain service orchestrating task operations.

    RULES:
    - Never imports from /infra
    - Never contains scoring logic
    - All dependencies are injected via constructor
    """

    def __init__(self, repo: ITaskRepository, scorer: IScoringStrategy) -> None:
        self._repo = repo
        self._scorer = scorer

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
        return await self._repo.save(task)

    async def complete_task(self, task_id: UUID) -> Task:
        return await self._repo.mark_completed(task_id)

    async def get_today_tasks(self, user_id: UUID) -> list[Task]:
        return await self._repo.find_by_date(user_id, date.today())

    async def get_today_score(self, user_id: UUID) -> Score:
        """Fetches today's tasks and delegates scoring to the injected strategy.
        Contains NO scoring logic itself."""
        tasks = await self._repo.find_by_date(user_id, date.today())
        return self._scorer.calculate(tasks)
