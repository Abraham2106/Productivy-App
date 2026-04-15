from abc import ABC, abstractmethod
from datetime import date
from uuid import UUID

from ..entities.daily_metrics import DailyMetrics


class IMetricsRepository(ABC):
    @abstractmethod
    async def save(self, metrics: DailyMetrics) -> DailyMetrics: ...

    @abstractmethod
    async def find_by_date(
        self, user_id: UUID, target_date: date
    ) -> DailyMetrics | None: ...

    @abstractmethod
    async def find_range(
        self, user_id: UUID, start: date, end: date
    ) -> list[DailyMetrics]: ...
