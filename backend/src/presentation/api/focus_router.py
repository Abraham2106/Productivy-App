from uuid import UUID
from fastapi import APIRouter, Depends
from src.domain.entities.focus_session import FocusSession
from src.domain.entities.adaptive_score_context import FocusSessionSummary
from src.domain.services.focus_service import FocusService
from .dependencies import get_focus_service
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/focus", tags=["focus"])

class CreateFocusSessionRequest(BaseModel):
    started_at: datetime
    ended_at: datetime
    session_type: str
    planned_minutes: int
    actual_minutes: int
    completed: bool = True

@router.post("/sessions", response_model=FocusSession)
async def create_focus_session(
    user_id: UUID,
    request: CreateFocusSessionRequest,
    service: FocusService = Depends(get_focus_service)
) -> FocusSession:
    session = FocusSession(
        id=uuid.uuid4(),
        user_id=user_id,
        started_at=request.started_at,
        ended_at=request.ended_at,
        session_type=request.session_type,
        planned_minutes=request.planned_minutes,
        actual_minutes=request.actual_minutes,
        completed=request.completed
    )
    return await service.register_session(session)

@router.get("/today", response_model=FocusSessionSummary)
async def get_today_focus(
    user_id: UUID,
    service: FocusService = Depends(get_focus_service)
) -> FocusSessionSummary:
    return await service.get_today_summary(user_id)
