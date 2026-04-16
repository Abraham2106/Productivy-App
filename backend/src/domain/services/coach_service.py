import hashlib
import json
from datetime import date
from uuid import UUID
from ..entities.adaptive_score_context import AdaptiveScoreContext
from ..entities.coach_feedback import CoachFeedback
from ..interfaces.ai_feedback_repository import IAIFeedbackRepository
from ..interfaces.ai_insights_provider import IAIInsightsProvider

class CoachService:
    def __init__(
        self,
        feedback_repo: IAIFeedbackRepository,
        ai_provider: IAIInsightsProvider,
    ):
        self._feedback_repo = feedback_repo
        self._ai_provider = ai_provider

    def _calculate_context_hash(self, context: AdaptiveScoreContext) -> str:
        """Calcula una huella digital (hash) de los datos que afectan al consejo."""
        state = {
            "tasks": [(t.name, t.completed) for t in context.today_tasks],
            "metrics": {
                "sleep_hours": context.today_metrics.sleep_hours if context.today_metrics else 0,
                "phone_usage": context.today_metrics.phone_minutes if context.today_metrics else 0,
                "study_minutes": context.today_metrics.study_minutes if context.today_metrics else 0
            },
            "focus": {
                "work": context.focus_summary.completed_work_sessions if context.focus_summary else 0,
                "break": context.focus_summary.completed_break_sessions if context.focus_summary else 0,
                "minutes": context.focus_summary.total_focus_minutes if context.focus_summary else 0
            }
        }
        state_str = json.dumps(state, sort_keys=True)
        return hashlib.md5(state_str.encode()).hexdigest()

    async def get_or_generate_today_feedback(
        self, user_id: UUID, context: AdaptiveScoreContext
    ) -> CoachFeedback:
        # 1. Calcular hash actual
        current_hash = self._calculate_context_hash(context)
        print(f"DEBUG CACHE: Hash actual calculado: {current_hash}")
        
        # 2. Buscar feedback existente y su hash
        existing_feedback, stored_hash = await self._feedback_repo.find_by_date(user_id, context.date)
        print(f"DEBUG CACHE: Hash en DB: {stored_hash}")
        
        # 3. Solo si existe Y el hash coincide, devolvemos el guardado (Cache Hit)
        if existing_feedback and stored_hash == current_hash:
            print("DEBUG CACHE: ¡Cache HIT! Devolviendo feedback guardado.")
            return existing_feedback
        
        print("DEBUG CACHE: Cache MISS. Regenerando con la IA...")

        # 4. Generate new feedback (Cache Miss or Data Change)
        try:
            insights = await self._ai_provider.analyze_day(context)
            feedback = CoachFeedback(
                date=context.date,
                summary=insights.feedback_summary,
                recommendations=insights.recommendations,
            )
            
            # Persistir con el nuevo hash
            await self._feedback_repo.save(
                user_id=user_id,
                date=context.date,
                feedback=feedback,
                patterns=[p.model_dump() for p in insights.patterns],
                scoring_breakdown=insights.score_adjustments,
                context_hash=current_hash
            )
            return feedback
        except Exception as e:
            print(f"!!! ERROR EN ANALYZER: {type(e).__name__}: {e}")
            return CoachFeedback(
                date=context.date,
                summary="No pude analizar tu día hoy.",
                recommendations=["Sigue trabajando duro!"]
            )
        
    async def get_recent_patterns(self, user_id: UUID) -> list:
        return await self._feedback_repo.get_recent_patterns(user_id)
