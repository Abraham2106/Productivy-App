from uuid import UUID
from fastapi import APIRouter, Depends
from src.domain.entities.behavior_pattern import BehaviorPattern
from src.domain.services.coach_service import CoachService
from .dependencies import get_coach_service

router = APIRouter(prefix="/patterns", tags=["patterns"])

@router.get(
    "/",
    response_model=list[BehaviorPattern],
    summary="Get recent AI detected patterns for the user"
)
async def get_patterns(
    user_id: UUID,
    service: CoachService = Depends(get_coach_service)
) -> list[BehaviorPattern]:
    patterns_raw = await service.get_recent_patterns(user_id)
    return [BehaviorPattern(**p) for p in patterns_raw]
