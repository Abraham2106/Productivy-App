from uuid import UUID
from datetime import date

from supabase import create_client, Client

from src.domain.interfaces.task_repository import ITaskRepository
from src.domain.entities.task import Task, TaskType


class SupabaseTaskRepository(ITaskRepository):
    """
    Supabase adapter implementing ITaskRepository.

    ARCHITECTURAL RULE: This is the ONLY file in the entire codebase
    that is allowed to import from `supabase`. All queries are isolated here.
    """

    def __init__(self, url: str, key: str) -> None:
        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY must be set in .env"
            )
        self._client: Client = create_client(url, key)

    async def save(self, task: Task) -> Task:
        data = {
            "id": str(task.id),
            "user_id": str(task.user_id),
            "name": task.name,
            "task_type": task.task_type.value,
            "completed": task.completed,
            "date": task.date.isoformat(),
        }
        result = self._client.table("tasks").insert(data).execute()
        return self._row_to_task(result.data[0])

    async def find_by_id(self, task_id: UUID) -> Task | None:
        result = (
            self._client.table("tasks")
            .select("*")
            .eq("id", str(task_id))
            .execute()
        )
        if not result.data:
            return None
        return self._row_to_task(result.data[0])

    async def find_by_date(self, user_id: UUID, date: date) -> list[Task]:
        result = (
            self._client.table("tasks")
            .select("*")
            .eq("user_id", str(user_id))
            .eq("date", date.isoformat())
            .execute()
        )
        return [self._row_to_task(row) for row in result.data]

    async def mark_completed(self, task_id: UUID) -> Task:
        result = (
            self._client.table("tasks")
            .update({"completed": True})
            .eq("id", str(task_id))
            .execute()
        )
        if not result.data:
            raise ValueError(f"Task with id={task_id} not found")
        return self._row_to_task(result.data[0])

    # ------------------------------------------------------------------ #
    # Private helpers                                                      #
    # ------------------------------------------------------------------ #

    def _row_to_task(self, row: dict) -> Task:
        return Task(
            id=row["id"],
            user_id=row["user_id"],
            name=row["name"],
            task_type=TaskType(row["task_type"]),
            completed=row["completed"],
            date=row["date"],
        )
