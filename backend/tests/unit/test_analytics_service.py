from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest

from src.domain.entities.habit_pattern import HabitClassification, HabitPattern
from src.domain.entities.task import Task, TaskType
from src.domain.entities.weekly_score import DailyScoreSummary
from src.domain.services.analytics_service import AnalyticsService


def make_task(name: str, task_type: TaskType, completed: bool, target_date: date) -> Task:
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        name=name,
        task_type=task_type,
        completed=completed,
        date=target_date,
    )


@pytest.fixture
def mock_task_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_metrics_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_habit_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_daily_score_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def mock_scorer() -> MagicMock:
    return MagicMock()


@pytest.fixture
def service(
    mock_task_repo: AsyncMock,
    mock_metrics_repo: AsyncMock,
    mock_habit_repo: AsyncMock,
    mock_daily_score_repo: AsyncMock,
    mock_scorer: MagicMock,
) -> AnalyticsService:
    return AnalyticsService(
        task_repo=mock_task_repo,
        metrics_repo=mock_metrics_repo,
        habit_repo=mock_habit_repo,
        daily_score_repo=mock_daily_score_repo,
        scorer=mock_scorer,
    )


@pytest.mark.asyncio
async def test_get_weekly_score_returns_best_and_worst_day(
    service: AnalyticsService,
    mock_daily_score_repo: AsyncMock,
) -> None:
    today = date.today()
    summaries = [
        DailyScoreSummary(date=today - timedelta(days=6), score=10),
        DailyScoreSummary(date=today - timedelta(days=5), score=20),
        DailyScoreSummary(date=today - timedelta(days=4), score=-5),
        DailyScoreSummary(date=today - timedelta(days=3), score=15),
        DailyScoreSummary(date=today - timedelta(days=2), score=30),
        DailyScoreSummary(date=today - timedelta(days=1), score=5),
        DailyScoreSummary(date=today, score=25),
    ]
    mock_daily_score_repo.find_range.return_value = summaries

    weekly = await service.get_weekly_score(uuid4())

    assert weekly.best_day == today - timedelta(days=2)
    assert weekly.worst_day == today - timedelta(days=4)
    assert weekly.total == 100
    assert weekly.average == round(100 / 7, 1)


@pytest.mark.asyncio
async def test_compute_habit_patterns_marks_six_of_seven_as_positive(
    service: AnalyticsService,
    mock_task_repo: AsyncMock,
    mock_habit_repo: AsyncMock,
) -> None:
    today = date.today()
    user_id = uuid4()

    async def find_by_date(_: object, target_date: date) -> list[Task]:
        offset = (today - target_date).days
        if offset < 6:
            return [make_task("Ejercicio", TaskType.BASE, True, target_date)]
        return []

    mock_task_repo.find_by_date.side_effect = find_by_date
    mock_habit_repo.upsert.side_effect = lambda _user_id, pattern: pattern

    patterns = await service.compute_habit_patterns(user_id)

    exercise = next(pattern for pattern in patterns if pattern.task_name == "Ejercicio")
    assert exercise.frequency_7d == 6
    assert exercise.classification == HabitClassification.POSITIVE


@pytest.mark.asyncio
async def test_compute_habit_patterns_marks_base_task_one_of_seven_as_negative(
    service: AnalyticsService,
    mock_task_repo: AsyncMock,
    mock_habit_repo: AsyncMock,
) -> None:
    today = date.today()
    user_id = uuid4()

    async def find_by_date(_: object, target_date: date) -> list[Task]:
        offset = (today - target_date).days
        if offset < 7:
            return [make_task("Meditacion", TaskType.BASE, offset == 0, target_date)]
        return []

    mock_task_repo.find_by_date.side_effect = find_by_date
    mock_habit_repo.upsert.side_effect = lambda _user_id, pattern: pattern

    patterns = await service.compute_habit_patterns(user_id)

    meditation = next(pattern for pattern in patterns if pattern.task_name == "Meditacion")
    assert meditation.frequency_7d == 1
    assert meditation.classification == HabitClassification.NEGATIVE
