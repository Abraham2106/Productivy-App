from abc import ABC, abstractmethod
from uuid import UUID

from ..entities.habit_pattern import HabitPattern


class IHabitRepository(ABC):
    @abstractmethod
    async def upsert(self, user_id: UUID, pattern: HabitPattern) -> HabitPattern: ...

    @abstractmethod
    async def find_by_user(self, user_id: UUID) -> list[HabitPattern]: ...
