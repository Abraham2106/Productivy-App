from config.settings import settings
from src.infrastructure.repositories.supabase_task_repository import SupabaseTaskRepository
from src.infrastructure.scoring.rule_based_strategy import RuleBasedStrategy
from src.domain.services.task_service import TaskService


def get_task_service() -> TaskService:
    """
    FastAPI dependency factory.
    Wires concrete infrastructure implementations to the domain service.
    This is the ONLY place in the codebase where the dependency graph is assembled.
    """
    repo = SupabaseTaskRepository(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
    )
    scorer = RuleBasedStrategy()
    return TaskService(repo=repo, scorer=scorer)
