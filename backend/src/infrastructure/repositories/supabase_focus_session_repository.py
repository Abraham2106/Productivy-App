from datetime import date, datetime
from uuid import UUID
from supabase import Client

from ...domain.entities.focus_session import FocusSession
from ...domain.interfaces.focus_session_repository import IFocusSessionRepository

class SupabaseFocusSessionRepository(IFocusSessionRepository):
    def __init__(self, supabase: Client):
        self._supabase = supabase

    async def save(self, session: FocusSession) -> FocusSession:
        data = {
            "id": str(session.id),
            "user_id": str(session.user_id),
            "started_at": session.started_at.isoformat(),
            "ended_at": session.ended_at.isoformat(),
            "session_type": session.session_type,
            "planned_minutes": session.planned_minutes,
            "actual_minutes": session.actual_minutes,
            "completed": session.completed,
        }

        response = self._supabase.table("focus_sessions").upsert(data).execute()
        saved = response.data[0]
        return FocusSession(
            id=UUID(saved["id"]),
            user_id=UUID(saved["user_id"]),
            started_at=datetime.fromisoformat(saved["started_at"].replace("Z", "+00:00")),
            ended_at=datetime.fromisoformat(saved["ended_at"].replace("Z", "+00:00")),
            session_type=saved["session_type"],
            planned_minutes=saved["planned_minutes"],
            actual_minutes=saved["actual_minutes"],
            completed=saved["completed"]
        )

    async def find_by_date(self, user_id: UUID, target_date: date) -> list[FocusSession]:
        start = f"{target_date.isoformat()}T00:00:00+00:00"
        end = f"{target_date.isoformat()}T23:59:59+00:00"
        response = (
            self._supabase.table("focus_sessions")
            .select("*")
            .eq("user_id", str(user_id))
            .gte("started_at", start)
            .lte("started_at", end)
            .execute()
        )
        
        sessions = []
        for row in response.data:
            sessions.append(FocusSession(
                id=UUID(row["id"]),
                user_id=UUID(row["user_id"]),
                started_at=datetime.fromisoformat(row["started_at"].replace("Z", "+00:00")),
                ended_at=datetime.fromisoformat(row["ended_at"].replace("Z", "+00:00")),
                session_type=row["session_type"],
                planned_minutes=row["planned_minutes"],
                actual_minutes=row["actual_minutes"],
                completed=row["completed"]
            ))
        return sessions
