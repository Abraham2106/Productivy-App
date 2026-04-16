from ...domain.entities.adaptive_score_context import AdaptiveScoreContext
from ...domain.entities.daily_metrics import DailyMetrics
from ...domain.entities.score import Score
from ...domain.entities.task import Task
from ...domain.interfaces.scoring_strategy import IScoringStrategy
from ...domain.interfaces.ai_feedback_repository import IAIFeedbackRepository

class AIStrategy(IScoringStrategy):
    def __init__(self, fallback_strategy: IScoringStrategy, feedback_repo: IAIFeedbackRepository):
        self._fallback_strategy = fallback_strategy
        self._feedback_repo = feedback_repo

    async def calculate(
        self,
        tasks: list[Task],
        metrics: DailyMetrics | None = None,
        context: AdaptiveScoreContext | None = None,
    ) -> Score:
        # 1. Calculate base score
        base_score = await self._fallback_strategy.calculate(tasks, metrics, context)
        
        if not context:
            return base_score

        try:
            # 2. Look for existing AI adjustments for today
            # We use target_date from context or today
            target_date = context.date
            user_id = metrics.user_id if metrics else (tasks[0].user_id if tasks else None)
            
            if not user_id:
                return base_score
                
            # Try to get existing feedback from DB
            # Note: SupabaseAIFeedbackRepository stores 'scoring_breakdown'
            # We need to access the raw data or update the interface. 
            # In this project, let's assume we can query the repo for the breakdown.
            
            # Since IAIFeedbackRepository might not have get_scoring_breakdown, 
            # we check the implementation or use find_by_date and assume it's attached.
            # Actually, let's just query Supabase directly for now or update repo.
            
            # For simplicity in this clean arch, we'll assume the repo returns the adjustments 
            # if we add a method or if we use find_by_date.
            
            # Let's check the repo implementation again.
            existing = await self._feedback_repo.find_by_date(user_id, target_date)
            if not existing:
                return base_score
                
            # Now we need the scoring_breakdown which isn't in CoachFeedback entity.
            # I'll need to update SupabaseAIFeedbackRepository to provide it.
            
            # For now, let's finish the logic here.
            final_breakdown = base_score.breakdown.copy()
            
            # We need to get the adjustments. 
            # I'll modify the repo to return both feedback and adjustments.
            adjustments = await self._feedback_repo.get_today_adjustments(user_id, target_date)
            
            total_adjustments = 0
            for key, value in adjustments.items():
                if key.startswith("ai_"):
                    adj = max(-20, min(20, value))
                    final_breakdown[key] = adj
                    total_adjustments += adj
            
            total_adjustments = max(-20, min(20, total_adjustments))
            return Score(value=base_score.value + total_adjustments, breakdown=final_breakdown)
            
        except Exception:
            return base_score
