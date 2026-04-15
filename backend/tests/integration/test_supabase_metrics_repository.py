import os
from datetime import date, timedelta
from uuid import UUID, uuid4

import pytest
from supabase import create_client

from src.domain.entities.daily_metrics import DailyMetrics
from src.infrastructure.repositories.supabase_metrics_repository import (
    SupabaseMetricsRepository,
)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

pytestmark = pytest.mark.skipif(
    not SUPABASE_URL or not SUPABASE_KEY,
    reason="Supabase integration credentials are required",
)


@pytest.fixture
def client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)


@pytest.fixture
def repository() -> SupabaseMetricsRepository:
    return SupabaseMetricsRepository(SUPABASE_URL, SUPABASE_KEY)


@pytest.fixture
def test_user_id(client) -> UUID:
    user_id = uuid4()
    client.table("users").insert({"id": str(user_id), "name": "codex-integration"}).execute()
    yield user_id
    client.table("daily_scores").delete().eq("user_id", str(user_id)).execute()
    client.table("users").delete().eq("id", str(user_id)).execute()


@pytest.mark.asyncio
async def test_save_and_find_by_date_round_trip(
    repository: SupabaseMetricsRepository,
    test_user_id: UUID,
) -> None:
    metrics = DailyMetrics(
        user_id=test_user_id,
        date=date.today(),
        sleep_hours=7.5,
        phone_minutes=45,
        study_minutes=90,
    )

    await repository.save(metrics)
    fetched = await repository.find_by_date(test_user_id, date.today())

    assert fetched is not None
    assert fetched.sleep_hours == 7.5
    assert fetched.phone_minutes == 45
    assert fetched.study_minutes == 90


@pytest.mark.asyncio
async def test_find_range_returns_only_days_inside_range(
    repository: SupabaseMetricsRepository,
    test_user_id: UUID,
) -> None:
    today = date.today()
    inside_metrics = DailyMetrics(
        user_id=test_user_id,
        date=today - timedelta(days=1),
        sleep_hours=6.5,
        phone_minutes=60,
        study_minutes=45,
    )
    outside_metrics = DailyMetrics(
        user_id=test_user_id,
        date=today - timedelta(days=10),
        sleep_hours=8.0,
        phone_minutes=30,
        study_minutes=90,
    )

    await repository.save(inside_metrics)
    await repository.save(outside_metrics)

    result = await repository.find_range(
        test_user_id,
        today - timedelta(days=7),
        today,
    )

    assert len(result) == 1
    assert result[0].date == inside_metrics.date
