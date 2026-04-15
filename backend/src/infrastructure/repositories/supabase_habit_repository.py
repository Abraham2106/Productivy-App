from uuid import UUID

from supabase import Client, create_client

from src.domain.entities.habit_pattern import HabitClassification, HabitPattern
from src.domain.interfaces.habit_repository import IHabitRepository


class SupabaseHabitRepository(IHabitRepository):
    def __init__(self, url: str, key: str) -> None:
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
        self._client: Client = create_client(url, key)

    async def upsert(self, user_id: UUID, pattern: HabitPattern) -> HabitPattern:
        payload = {
            "user_id": str(user_id),
            "task_name": pattern.task_name,
            "frequency_7d": pattern.frequency_7d,
            "frequency_30d": pattern.frequency_30d,
            "classification": pattern.classification.value,
        }
        existing = (
            self._client.table("habit_patterns")
            .select("id")
            .eq("user_id", str(user_id))
            .eq("task_name", pattern.task_name)
            .limit(1)
            .execute()
        )

        if existing.data:
            result = (
                self._client.table("habit_patterns")
                .update(payload)
                .eq("id", existing.data[0]["id"])
                .execute()
            )
        else:
            result = self._client.table("habit_patterns").insert(payload).execute()

        return self._row_to_pattern(result.data[0])

    async def find_by_user(self, user_id: UUID) -> list[HabitPattern]:
        result = (
            self._client.table("habit_patterns")
            .select("task_name, frequency_7d, frequency_30d, classification")
            .eq("user_id", str(user_id))
            .order("frequency_7d", desc=True)
            .execute()
        )
        return [self._row_to_pattern(row) for row in result.data]

    def _row_to_pattern(self, row: dict) -> HabitPattern:
        return HabitPattern(
            task_name=row["task_name"],
            frequency_7d=row["frequency_7d"],
            frequency_30d=row["frequency_30d"],
            classification=HabitClassification(row["classification"]),
        )
