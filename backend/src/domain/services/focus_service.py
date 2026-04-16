from datetime import date
from uuid import UUID
from ..entities.focus_session import FocusSession
from ..entities.adaptive_score_context import FocusSessionSummary
from ..interfaces.focus_session_repository import IFocusSessionRepository

class FocusService:
    def __init__(self, repo: IFocusSessionRepository):
        self._repo = repo

    async def register_session(self, session: FocusSession) -> FocusSession:
        return await self._repo.save(session)

    async def get_today_summary(self, user_id: UUID) -> FocusSessionSummary:
        sessions = await self._repo.find_by_date(user_id, date.today())
        work_sessions = [s for s in sessions if s.session_type == 'work' and s.completed]
        break_sessions = [s for s in sessions if s.session_type == 'break' and s.completed]
        total_minutes = sum(s.actual_minutes for s in work_sessions)
        
        return FocusSessionSummary(
            completed_work_sessions=len(work_sessions),
            completed_break_sessions=len(break_sessions),
            total_focus_minutes=total_minutes
        )
