from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID
from ..entities.coach_feedback import CoachFeedback

class IAIFeedbackRepository(ABC):
    @abstractmethod
    async def save(self, user_id: UUID, date: date, feedback: CoachFeedback, patterns: list, scoring_breakdown: dict, context_hash: str = None) -> None: ...

    @abstractmethod
    async def find_by_date(self, user_id: UUID, target_date: date) -> tuple[CoachFeedback | None, str | None]: ...
    
    @abstractmethod
    async def get_recent_patterns(self, user_id: UUID, limit: int = 5) -> list: ...

    @abstractmethod
    async def get_today_adjustments(self, user_id: UUID, target_date: date) -> dict: ...
