from uuid import UUID

from fastapi import APIRouter, Depends

from src.domain.entities.score import Score
from src.domain.entities.weekly_score import DailyScoreSummary, WeeklyScore
from src.domain.services.analytics_service import AnalyticsService
from src.domain.services.task_service import TaskService
from src.domain.services.adaptive_scoring_service import AdaptiveScoringService
from .dependencies import get_analytics_service, get_task_service, get_adaptive_scoring_service

router = APIRouter(prefix="/score", tags=["score"])


@router.get(
    "/today",
    response_model=Score,
    summary="Calculate and return the adaptive score for today",
)
async def get_today_score(
    user_id: UUID,
    service: AdaptiveScoringService = Depends(get_adaptive_scoring_service),
) -> Score:
    return await service.get_today_score(user_id)


@router.get(
    "/week",
    response_model=WeeklyScore,
    summary="Return the weekly score summary",
)
async def get_weekly_score(
    user_id: UUID,
    service: AnalyticsService = Depends(get_analytics_service),
) -> WeeklyScore:
    return await service.get_weekly_score(user_id)


@router.get(
    "/trend",
    response_model=list[DailyScoreSummary],
    summary="Return score trend for the last 7 days",
)
async def get_score_trend(
    user_id: UUID,
    service: AnalyticsService = Depends(get_analytics_service),
) -> list[DailyScoreSummary]:
    return await service.get_trend(user_id)
