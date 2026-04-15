from uuid import UUID

from fastapi import APIRouter, Depends

from src.domain.entities.score import Score
from src.domain.services.task_service import TaskService
from .dependencies import get_task_service

router = APIRouter(prefix="/score", tags=["score"])


@router.get(
    "/today",
    response_model=Score,
    summary="Calculate and return the score for today",
)
async def get_today_score(
    user_id: UUID,
    service: TaskService = Depends(get_task_service),
) -> Score:
    """
    Returns the daily score with full breakdown per task.

    Example response:
    {
        "score": 35,
        "breakdown": {
            "Ejercicio": 10,
            "Leer": 10,
            "Meditación": -5,
            "Proyecto personal": 5,
            "Llamar al médico": 5
        }
    }
    """
    return await service.get_today_score(user_id)
