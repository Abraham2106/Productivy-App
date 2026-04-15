from uuid import UUID

from fastapi import APIRouter, Depends

from src.domain.entities.habit_pattern import HabitPattern
from src.domain.services.analytics_service import AnalyticsService
from .dependencies import get_analytics_service

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get(
    "/",
    response_model=list[HabitPattern],
    summary="Compute and return detected habit patterns",
)
async def get_habits(
    user_id: UUID,
    service: AnalyticsService = Depends(get_analytics_service),
) -> list[HabitPattern]:
    return await service.compute_habit_patterns(user_id)
