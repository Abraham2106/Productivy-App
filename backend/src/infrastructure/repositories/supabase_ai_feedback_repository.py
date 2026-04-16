from datetime import date
from uuid import UUID
from supabase import Client
import json

from ...domain.entities.coach_feedback import CoachFeedback
from ...domain.interfaces.ai_feedback_repository import IAIFeedbackRepository

class SupabaseAIFeedbackRepository(IAIFeedbackRepository):
    def __init__(self, supabase: Client):
        self._supabase = supabase

    async def save(self, user_id: UUID, date: date, feedback: CoachFeedback, patterns: list, scoring_breakdown: dict, context_hash: str = None) -> None:
        data = {
            "user_id": str(user_id),
            "date": date.isoformat(),
            "summary": feedback.summary,
            "recommendations": feedback.recommendations,
            "detected_patterns": patterns,
            "scoring_breakdown": scoring_breakdown,
            "context_hash": context_hash
        }
        self._supabase.table("ai_feedback").upsert(data, on_conflict="user_id,date").execute()

    async def find_by_date(self, user_id: UUID, target_date: date) -> tuple[CoachFeedback | None, str | None]:
        response = (
            self._supabase.table("ai_feedback")
            .select("*")
            .eq("user_id", str(user_id))
            .eq("date", target_date.isoformat())
            .execute()
        )
        
        if not response.data:
            return None, None
            
        row = response.data[0]
        feedback = CoachFeedback(
            date=date.fromisoformat(row["date"]),
            summary=row["summary"],
            recommendations=row["recommendations"]
        )
        return feedback, row.get("context_hash")

    async def get_recent_patterns(self, user_id: UUID, limit: int = 5) -> list:
        response = (
            self._supabase.table("ai_feedback")
            .select("detected_patterns")
            .eq("user_id", str(user_id))
            .order("date", desc=True)
            .limit(limit)
            .execute()
        )
        
        all_patterns = []
        for row in response.data:
            if isinstance(row["detected_patterns"], list):
                all_patterns.extend(row["detected_patterns"])
        return all_patterns

    async def get_today_adjustments(self, user_id: UUID, target_date: date) -> dict:
        response = (
            self._supabase.table("ai_feedback")
            .select("scoring_breakdown")
            .eq("user_id", str(user_id))
            .eq("date", target_date.isoformat())
            .execute()
        )
        
        if not response.data or not response.data[0].get("scoring_breakdown"):
            return {}
            
        return response.data[0]["scoring_breakdown"]
