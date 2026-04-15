from datetime import date
from uuid import UUID

from supabase import Client, create_client

from src.domain.entities.daily_metrics import DailyMetrics
from src.domain.interfaces.metrics_repository import IMetricsRepository


class SupabaseMetricsRepository(IMetricsRepository):
    def __init__(self, url: str, key: str) -> None:
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        self._client: Client = create_client(url, key)

    async def save(self, metrics: DailyMetrics) -> DailyMetrics:
        payload = {
            "user_id": str(metrics.user_id),
            "date": metrics.date.isoformat(),
            "sleep_hours": metrics.sleep_hours,
            "phone_minutes": metrics.phone_minutes,
            "study_minutes": metrics.study_minutes,
        }
        result = (
            self._client.table("daily_scores")
            .upsert(payload, on_conflict="user_id,date")
            .execute()
        )
        return self._row_to_metrics(result.data[0])

    async def find_by_date(
        self, user_id: UUID, target_date: date
    ) -> DailyMetrics | None:
        result = (
            self._client.table("daily_scores")
            .select("user_id, date, sleep_hours, phone_minutes, study_minutes")
            .eq("user_id", str(user_id))
            .eq("date", target_date.isoformat())
            .execute()
        )
        if not result.data:
            return None

        row = result.data[0]
        if (
            row.get("sleep_hours") is None
            and row.get("phone_minutes") is None
            and row.get("study_minutes") is None
        ):
            return None

        return self._row_to_metrics(row)

    async def find_range(
        self, user_id: UUID, start: date, end: date
    ) -> list[DailyMetrics]:
        result = (
            self._client.table("daily_scores")
            .select("user_id, date, sleep_hours, phone_minutes, study_minutes")
            .eq("user_id", str(user_id))
            .gte("date", start.isoformat())
            .lte("date", end.isoformat())
            .order("date")
            .execute()
        )

        return [
            self._row_to_metrics(row)
            for row in result.data
            if row.get("sleep_hours") is not None
            or row.get("phone_minutes") is not None
            or row.get("study_minutes") is not None
        ]

    def _row_to_metrics(self, row: dict) -> DailyMetrics:
        return DailyMetrics(
            user_id=row["user_id"],
            date=row["date"],
            sleep_hours=row["sleep_hours"],
            phone_minutes=row["phone_minutes"],
            study_minutes=row["study_minutes"],
        )
