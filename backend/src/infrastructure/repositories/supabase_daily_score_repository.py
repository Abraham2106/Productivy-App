from datetime import date
from uuid import UUID

from supabase import Client, create_client

from src.domain.entities.weekly_score import DailyScoreSummary
from src.domain.interfaces.daily_score_repository import IDailyScoreRepository


class SupabaseDailyScoreRepository(IDailyScoreRepository):
    def __init__(self, url: str, key: str) -> None:
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        self._client: Client = create_client(url, key)

    async def upsert_score(
        self, user_id: UUID, target_date: date, score: int
    ) -> DailyScoreSummary:
        payload = {
            "user_id": str(user_id),
            "date": target_date.isoformat(),
            "score": score,
        }
        result = (
            self._client.table("daily_scores")
            .upsert(payload, on_conflict="user_id,date")
            .execute()
        )
        return self._row_to_summary(result.data[0])

    async def find_by_date(
        self, user_id: UUID, target_date: date
    ) -> DailyScoreSummary | None:
        result = (
            self._client.table("daily_scores")
            .select("date, score")
            .eq("user_id", str(user_id))
            .eq("date", target_date.isoformat())
            .execute()
        )
        if not result.data:
            return None
        return self._row_to_summary(result.data[0])

    async def find_range(
        self, user_id: UUID, start: date, end: date
    ) -> list[DailyScoreSummary]:
        result = (
            self._client.table("daily_scores")
            .select("date, score")
            .eq("user_id", str(user_id))
            .gte("date", start.isoformat())
            .lte("date", end.isoformat())
            .order("date")
            .execute()
        )
        return [self._row_to_summary(row) for row in result.data]

    def _row_to_summary(self, row: dict) -> DailyScoreSummary:
        return DailyScoreSummary(date=row["date"], score=row["score"])
