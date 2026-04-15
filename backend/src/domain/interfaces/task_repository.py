from abc import ABC, abstractmethod
from uuid import UUID
from datetime import date

from ..entities.task import Task


class ITaskRepository(ABC):
    """Abstract contract for task persistence. Infrastructure must implement this."""

    @abstractmethod
    async def save(self, task: Task) -> Task: ...

    @abstractmethod
    async def find_by_id(self, task_id: UUID) -> Task | None: ...

    @abstractmethod
    async def find_by_date(self, user_id: UUID, date: date) -> list[Task]: ...

    @abstractmethod
    async def mark_completed(self, task_id: UUID) -> Task: ...
