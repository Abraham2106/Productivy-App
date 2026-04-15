from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from src.domain.entities.task import Task, TaskType
from src.domain.services.task_service import TaskService
from .dependencies import get_task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    user_id: UUID
    name: str
    task_type: TaskType


@router.post(
    "/",
    response_model=Task,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task for today",
)
async def create_task(
    body: CreateTaskRequest,
    service: TaskService = Depends(get_task_service),
) -> Task:
    return await service.create_task(body.user_id, body.name, body.task_type)


@router.patch(
    "/{task_id}/complete",
    response_model=Task,
    summary="Mark a task as completed",
)
async def complete_task(
    task_id: UUID,
    service: TaskService = Depends(get_task_service),
) -> Task:
    try:
        return await service.complete_task(task_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get(
    "/today",
    response_model=list[Task],
    summary="List all tasks for today",
)
async def get_today_tasks(
    user_id: UUID,
    service: TaskService = Depends(get_task_service),
) -> list[Task]:
    return await service.get_today_tasks(user_id)
