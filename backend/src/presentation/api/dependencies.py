from config.settings import settings
from src.domain.services.analytics_service import AnalyticsService
from src.domain.services.metrics_service import MetricsService
from src.domain.services.task_service import TaskService
from src.infrastructure.repositories.supabase_daily_score_repository import (
    SupabaseDailyScoreRepository,
)
from src.infrastructure.repositories.supabase_habit_repository import (
    SupabaseHabitRepository,
)
from src.infrastructure.repositories.supabase_metrics_repository import (
    SupabaseMetricsRepository,
)
from src.infrastructure.repositories.supabase_task_repository import SupabaseTaskRepository
from src.infrastructure.scoring.rule_based_strategy import RuleBasedStrategy


def get_task_repository() -> SupabaseTaskRepository:
    return SupabaseTaskRepository(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
    )


def get_metrics_repository() -> SupabaseMetricsRepository:
    return SupabaseMetricsRepository(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
    )


def get_habit_repository() -> SupabaseHabitRepository:
    return SupabaseHabitRepository(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
    )


def get_daily_score_repository() -> SupabaseDailyScoreRepository:
    return SupabaseDailyScoreRepository(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
    )


def get_scoring_strategy() -> RuleBasedStrategy:
    return RuleBasedStrategy()


def get_task_service() -> TaskService:
    return TaskService(
        repo=get_task_repository(),
        scorer=get_scoring_strategy(),
        metrics_repo=get_metrics_repository(),
        daily_score_repo=get_daily_score_repository(),
    )


def get_metrics_service() -> MetricsService:
    return MetricsService(
        metrics_repo=get_metrics_repository(),
        task_repo=get_task_repository(),
        scorer=get_scoring_strategy(),
        daily_score_repo=get_daily_score_repository(),
    )


def get_analytics_service() -> AnalyticsService:
    return AnalyticsService(
        task_repo=get_task_repository(),
        metrics_repo=get_metrics_repository(),
        habit_repo=get_habit_repository(),
        daily_score_repo=get_daily_score_repository(),
        scorer=get_scoring_strategy(),
    )
