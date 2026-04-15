"""
Unit tests for TaskService.

Contract under test:
  - TaskService never imports infrastructure
  - get_today_score delegates to scorer.calculate()
  - complete_task delegates to repo.mark_completed()
  - create_task calls repo.save() with a new Task
"""
import inspect
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import date

from src.domain.entities.task import Task, TaskType
from src.domain.entities.score import Score
from src.domain.services.task_service import TaskService


# ------------------------------------------------------------------ #
# Helpers & fixtures                                                   #
# ------------------------------------------------------------------ #

def make_task(completed: bool = False) -> Task:
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        name="Test task",
        task_type=TaskType.BASE,
        completed=completed,
        date=date.today(),
    )


@pytest.fixture
def mock_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_scorer() -> MagicMock:
    return MagicMock()


@pytest.fixture
def service(mock_repo: AsyncMock, mock_scorer: MagicMock) -> TaskService:
    return TaskService(repo=mock_repo, scorer=mock_scorer)


# ------------------------------------------------------------------ #
# Architecture contract                                                #
# ------------------------------------------------------------------ #

def test_task_service_does_not_import_infrastructure():
    """TaskService must never reference /infrastructure or supabase."""
    from src.domain.services import task_service as module

    source = inspect.getsource(module)

    assert "supabase" not in source.lower(), (
        "TaskService imported Supabase — violates clean architecture rule"
    )
    assert "infrastructure" not in source.lower(), (
        "TaskService imported from infrastructure layer — DI violation"
    )


# ------------------------------------------------------------------ #
# Behaviour tests                                                      #
# ------------------------------------------------------------------ #

@pytest.mark.asyncio
async def test_get_today_score_fetches_tasks_and_delegates_to_scorer(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    user_id = uuid4()
    tasks = [make_task(True), make_task(False)]
    expected_score = Score(value=5, breakdown={"Test task": 5})

    mock_repo.find_by_date.return_value = tasks
    mock_scorer.calculate.return_value = expected_score

    result = await service.get_today_score(user_id)

    mock_scorer.calculate.assert_called_once_with(tasks)
    assert result.value == 5


@pytest.mark.asyncio
async def test_complete_task_delegates_to_repo_mark_completed(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    task_id = uuid4()
    completed_task = make_task(True)
    mock_repo.mark_completed.return_value = completed_task

    result = await service.complete_task(task_id)

    mock_repo.mark_completed.assert_called_once_with(task_id)
    assert result.completed is True


@pytest.mark.asyncio
async def test_create_task_saves_via_repo(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    user_id = uuid4()
    saved_task = make_task()
    mock_repo.save.return_value = saved_task

    result = await service.create_task(user_id, "Ejercicio", TaskType.BASE)

    mock_repo.save.assert_called_once()
    saved_arg: Task = mock_repo.save.call_args[0][0]
    assert saved_arg.name == "Ejercicio"
    assert saved_arg.task_type == TaskType.BASE
    assert saved_arg.completed is False
    assert result == saved_task


@pytest.mark.asyncio
async def test_get_today_tasks_returns_filtered_list(
    service: TaskService,
    mock_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> None:
    user_id = uuid4()
    today_tasks = [make_task(), make_task()]
    mock_repo.find_by_date.return_value = today_tasks

    result = await service.get_today_tasks(user_id)

    assert result == today_tasks
    mock_repo.find_by_date.assert_called_once()
