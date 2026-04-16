from datetime import date, timedelta
from uuid import UUID
from ..entities.adaptive_score_context import AdaptiveScoreContext, FocusSessionSummary
from ..entities.score import Score
from ..interfaces.task_repository import ITaskRepository
from ..interfaces.metrics_repository import IMetricsRepository
from ..interfaces.habit_repository import IHabitRepository
from ..interfaces.daily_score_repository import IDailyScoreRepository
from ..interfaces.focus_session_repository import IFocusSessionRepository
from ..interfaces.scoring_strategy import IScoringStrategy

class AdaptiveScoringService:
    def __init__(
        self,
        task_repo: ITaskRepository,
        metrics_repo: IMetricsRepository,
        habit_repo: IHabitRepository,
        daily_score_repo: IDailyScoreRepository,
        focus_repo: IFocusSessionRepository,
        scorer: IScoringStrategy,
    ):
        self._task_repo = task_repo
        self._metrics_repo = metrics_repo
        self._habit_repo = habit_repo
        self._daily_score_repo = daily_score_repo
        self._focus_repo = focus_repo
        self._scorer = scorer

    async def get_today_score(self, user_id: UUID) -> Score:
        target_date = date.today()
        context = await self.build_context(user_id, target_date)
        score = await self._scorer.calculate(context.today_tasks, context.today_metrics, context)
        
        # Persist the calculated score
        await self._daily_score_repo.upsert_score(user_id, target_date, score.value)
        return score

    async def build_context(self, user_id: UUID, target_date: date) -> AdaptiveScoreContext:
        tasks = await self._task_repo.find_by_date(user_id, target_date)
        metrics = await self._metrics_repo.find_by_date(user_id, target_date)
        
        # Recent scores (last 7 days)
        recent_scores_data = await self._daily_score_repo.find_range(
            user_id, target_date - timedelta(days=7), target_date - timedelta(days=1)
        )
        recent_scores = [s.score for s in recent_scores_data]
        
        habits = await self._habit_repo.find_by_user(user_id)
        
        focus_sessions = await self._focus_repo.find_by_date(user_id, target_date)
        work_sessions = [s for s in focus_sessions if s.session_type == 'work' and s.completed]
        break_sessions = [s for s in focus_sessions if s.session_type == 'break' and s.completed]
        total_minutes = sum(s.actual_minutes for s in work_sessions)
        
        focus_summary = FocusSessionSummary(
            completed_work_sessions=len(work_sessions),
            completed_break_sessions=len(break_sessions),
            total_focus_minutes=total_minutes
        )
        
        return AdaptiveScoreContext(
            date=target_date,
            today_tasks=tasks,
            today_metrics=metrics,
            recent_scores=recent_scores,
            recent_habits=habits,
            focus_summary=focus_summary
        )
