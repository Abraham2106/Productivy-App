from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from src.domain.entities.daily_metrics import DailyMetrics
from src.domain.services.metrics_service import MetricsService
from .dependencies import get_metrics_service

router = APIRouter(prefix="/metrics", tags=["metrics"])


class RegisterMetricsRequest(BaseModel):
    user_id: UUID
    sleep_hours: float = Field(ge=0, le=24)
    phone_minutes: int = Field(ge=0)
    study_minutes: int = Field(ge=0)


@router.post(
    "/today",
    response_model=DailyMetrics,
    summary="Register daily metrics for today",
)
async def register_today_metrics(
    body: RegisterMetricsRequest,
    service: MetricsService = Depends(get_metrics_service),
) -> DailyMetrics:
    metrics = DailyMetrics(
        user_id=body.user_id,
        date=date.today(),
        sleep_hours=body.sleep_hours,
        phone_minutes=body.phone_minutes,
        study_minutes=body.study_minutes,
    )
    return await service.register_metrics(metrics)


@router.get(
    "/today",
    response_model=DailyMetrics,
    summary="Get today's metrics",
)
async def get_today_metrics(
    user_id: UUID,
    service: MetricsService = Depends(get_metrics_service),
) -> DailyMetrics:
    metrics = await service.get_today_metrics(user_id)
    if metrics is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metrics for today were not found",
        )
    return metrics
