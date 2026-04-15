"""
Unit tests for TaskService.

Contract under test:
  - TaskService never imports infrastructure
  - get_today_score delegates to scorer.calculate(tasks, metrics)
  - complete_task delegates to repo.mark_completed()
  - create_task calls repo.save() with a new Task
"""
import inspect
from datetime import date
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from src.domain.entities.daily_metrics import DailyMetrics
from src.domain.entities.score import Score
from src.domain.entities.task import Task, TaskType
from src.domain.services.task_service import TaskService


def make_task(
    completed: bool = False,
    name: str = "Test task",
    task_type: TaskType = TaskType.BASE,
) -> Task:
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        name=name,
        task_type=task_type,
        completed=completed,
        date=date.today(),
    )


@pytest.fixture
def mock_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_metrics_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_daily_score_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_scorer() -> MagicMock:
    return MagicMock()


@pytest.fixture
def service(
    mock_repo: AsyncMock,
    mock_metrics_repo: AsyncMock,
    mock_daily_score_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> TaskService:
    return TaskService(
        repo=mock_repo,
        scorer=mock_scorer,
        metrics_repo=mock_metrics_repo,
        daily_score_repo=mock_daily_score_repo,
    )


def test_task_service_does_not_import_infrastructure() -> None:
    from src.domain.services import task_service as module

    source = inspect.getsource(module)

    assert "supabase" not in source.lower()
    assert "infrastructure" not in source.lower()


@pytest.mark.asyncio
async def test_get_today_score_fetches_tasks_metrics_and_delegates_to_scorer(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_metrics_repo: AsyncMock,
    mock_daily_score_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    user_id = uuid4()
    tasks = [make_task(True), make_task(False)]
    metrics = DailyMetrics(
        user_id=user_id,
        date=date.today(),
        sleep_hours=7.5,
        phone_minutes=45,
        study_minutes=90,
    )
    expected_score = Score(value=25, breakdown={"sleep": 10})

    mock_repo.find_by_date.return_value = tasks
    mock_metrics_repo.find_by_date.return_value = metrics
    mock_scorer.calculate.return_value = expected_score

    result = await service.get_today_score(user_id)

    mock_scorer.calculate.assert_called_once_with(tasks, metrics)
    mock_daily_score_repo.upsert_score.assert_called_once_with(
        user_id, date.today(), expected_score.value
    )
    assert result == expected_score


@pytest.mark.asyncio
async def test_complete_task_delegates_to_repo_mark_completed(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_metrics_repo: AsyncMock,
    mock_daily_score_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    task_id = uuid4()
    completed_task = make_task(True)
    mock_repo.mark_completed.return_value = completed_task
    mock_repo.find_by_date.return_value = [completed_task]
    mock_metrics_repo.find_by_date.return_value = None
    mock_scorer.calculate.return_value = Score(value=10, breakdown={"Test task": 10})

    result = await service.complete_task(task_id)

    mock_repo.mark_completed.assert_called_once_with(task_id)
    mock_daily_score_repo.upsert_score.assert_called_once_with(
        completed_task.user_id, completed_task.date, 10
    )
    assert result.completed is True


@pytest.mark.asyncio
async def test_create_task_saves_via_repo(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_metrics_repo: AsyncMock,
    mock_daily_score_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    user_id = uuid4()
    saved_task = make_task(name="Ejercicio")
    mock_repo.save.return_value = saved_task
    mock_repo.find_by_date.return_value = [saved_task]
    mock_metrics_repo.find_by_date.return_value = None
    mock_scorer.calculate.return_value = Score(value=-5, breakdown={"Ejercicio": -5})

    result = await service.create_task(user_id, "Ejercicio", TaskType.BASE)

    mock_repo.save.assert_called_once()
    saved_arg: Task = mock_repo.save.call_args[0][0]
    assert saved_arg.name == "Ejercicio"
    assert saved_arg.task_type == TaskType.BASE
    assert saved_arg.completed is False
    mock_daily_score_repo.upsert_score.assert_called_once_with(
        saved_task.user_id, saved_task.date, -5
    )
    assert result == saved_task


@pytest.mark.asyncio
async def test_get_today_tasks_returns_filtered_list(
    service: TaskService,
    mock_repo: AsyncMock,
) -> None:
    user_id = uuid4()
    today_tasks = [make_task(), make_task()]
    mock_repo.find_by_date.return_value = today_tasks

    result = await service.get_today_tasks(user_id)

    assert result == today_tasks
    mock_repo.find_by_date.assert_called_once()
