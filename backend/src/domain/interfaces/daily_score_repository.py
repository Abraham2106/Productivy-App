from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from ..entities.weekly_score import DailyScoreSummary


class IDailyScoreRepository(ABC):
    @abstractmethod
    async def upsert_score(
        self, user_id: UUID, target_date: date, score: int
    ) -> DailyScoreSummary: ...

    @abstractmethod
    async def find_by_date(
        self, user_id: UUID, target_date: date
    ) -> DailyScoreSummary | None: ...

    @abstractmethod
    async def find_range(
        self, user_id: UUID, start: date, end: date
    ) -> list[DailyScoreSummary]: ...
