from supabase import create_client, Client
from config.settings import settings
from src.domain.services.analytics_service import AnalyticsService
from src.domain.services.metrics_service import MetricsService
from src.domain.services.task_service import TaskService
from src.domain.services.adaptive_scoring_service import AdaptiveScoringService
from src.domain.services.coach_service import CoachService
from src.domain.services.focus_service import FocusService

from src.infrastructure.repositories.supabase_daily_score_repository import SupabaseDailyScoreRepository
from src.infrastructure.repositories.supabase_habit_repository import SupabaseHabitRepository
from src.infrastructure.repositories.supabase_metrics_repository import SupabaseMetricsRepository
from src.infrastructure.repositories.supabase_task_repository import SupabaseTaskRepository
from src.infrastructure.repositories.supabase_focus_session_repository import SupabaseFocusSessionRepository
from src.infrastructure.repositories.supabase_ai_feedback_repository import SupabaseAIFeedbackRepository

from src.infrastructure.scoring.rule_based_strategy import RuleBasedStrategy
from src.infrastructure.scoring.ai_strategy import AIStrategy
from src.infrastructure.ai.llm_insights_provider import LLMInsightsProvider

# Singleton client
_supabase_client: Client | None = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client

def get_task_repository() -> SupabaseTaskRepository:
    return SupabaseTaskRepository(url=settings.SUPABASE_URL, key=settings.SUPABASE_KEY)

def get_metrics_repository() -> SupabaseMetricsRepository:
    return SupabaseMetricsRepository(url=settings.SUPABASE_URL, key=settings.SUPABASE_KEY)

def get_habit_repository() -> SupabaseHabitRepository:
    return SupabaseHabitRepository(url=settings.SUPABASE_URL, key=settings.SUPABASE_KEY)

def get_daily_score_repository() -> SupabaseDailyScoreRepository:
    return SupabaseDailyScoreRepository(url=settings.SUPABASE_URL, key=settings.SUPABASE_KEY)

def get_focus_session_repository() -> SupabaseFocusSessionRepository:
    return SupabaseFocusSessionRepository(get_supabase_client())

def get_ai_feedback_repository() -> SupabaseAIFeedbackRepository:
    return SupabaseAIFeedbackRepository(get_supabase_client())

def get_scoring_strategy() -> AIStrategy:
    rule_based = RuleBasedStrategy()
    feedback_repo = get_ai_feedback_repository()
    return AIStrategy(fallback_strategy=rule_based, feedback_repo=feedback_repo)

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

def get_adaptive_scoring_service() -> AdaptiveScoringService:
    return AdaptiveScoringService(
        task_repo=get_task_repository(),
        metrics_repo=get_metrics_repository(),
        habit_repo=get_habit_repository(),
        daily_score_repo=get_daily_score_repository(),
        focus_repo=get_focus_session_repository(),
        scorer=get_scoring_strategy()
    )

def get_coach_service() -> CoachService:
    return CoachService(
        feedback_repo=get_ai_feedback_repository(),
        ai_provider=LLMInsightsProvider()
    )

def get_focus_service() -> FocusService:
    return FocusService(repo=get_focus_session_repository())
