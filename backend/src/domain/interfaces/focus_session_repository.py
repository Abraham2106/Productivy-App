from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID
from ..entities.focus_session import FocusSession

class IFocusSessionRepository(ABC):
    @abstractmethod
    async def save(self, session: FocusSession) -> FocusSession: ...

    @abstractmethod
    async def find_by_date(self, user_id: UUID, target_date: date) -> list[FocusSession]: ...
