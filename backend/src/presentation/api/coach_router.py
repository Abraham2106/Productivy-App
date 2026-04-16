from uuid import UUID
from fastapi import APIRouter, Depends
from src.domain.entities.coach_feedback import CoachFeedback
from src.domain.services.coach_service import CoachService
from src.domain.services.adaptive_scoring_service import AdaptiveScoringService
from .dependencies import get_coach_service, get_adaptive_scoring_service

router = APIRouter(prefix="/coach", tags=["coach"])

@router.get(
    "/today",
    response_model=CoachFeedback,
    summary="Generate or return today's AI coach feedback"
)
async def get_today_coach_feedback(
    user_id: UUID,
    coach_service: CoachService = Depends(get_coach_service),
    adaptive_service: AdaptiveScoringService = Depends(get_adaptive_scoring_service),
) -> CoachFeedback:
    try:
        print(f"DEBUG: Generando contexto para el usuario {user_id}")
        from datetime import date
        context = await adaptive_service.build_context(user_id, date.today())
        print(f"DEBUG: Contexto generado. Llamando al CoachService...")
        
        feedback = await coach_service.get_or_generate_today_feedback(user_id, context)
        print(f"DEBUG: Feedback obtenido exitosamente.")
        return feedback
    except Exception as e:
        print(f"!!! ERROR CRITICO EN COACH ROUTER: {type(e).__name__}: {e}")
        import traceback
        print(f"ERROR EN COACH ROUTER: {e}")
        traceback.print_exc()
        from datetime import date
        return CoachFeedback(
            date=date.today(),
            summary="No pude analizar tu día.",
            recommendations=["Por favor, intenta de nuevo más tarde o completa tareas para que pueda analizar."]
        )
