import os
import httpx
import json
from ...domain.entities.adaptive_score_context import AdaptiveScoreContext
from ...domain.entities.behavior_pattern import BehaviorPattern
from ...domain.interfaces.ai_insights_provider import IAIInsightsProvider, AIInsightResult

class LLMInsightsProvider(IAIInsightsProvider):
    def __init__(self, proxy_url: str = None):
        # We assume proxy is at localhost:8000 by default or via ENV
        self._proxy_url = proxy_url or os.getenv("GEMINI_PROXY_URL", "http://localhost:8000/v1/chat/completions")

    async def analyze_day(self, context: AdaptiveScoreContext) -> AIInsightResult:
        tasks_dump = [{"name": t.name, "completed": t.completed} for t in context.today_tasks]
        metrics_dump = {
            "sleep_hours": context.today_metrics.sleep_hours,
            "phone_minutes": context.today_metrics.phone_minutes,
            "study_minutes": context.today_metrics.study_minutes
        } if context.today_metrics else {}
        scores_dump = context.recent_scores
        
        prompt = f"""You are an elite productivity coach. 
Analyze the user's day based on these data points:
Tasks: {json.dumps(tasks_dump)}
Metrics: {json.dumps(metrics_dump)}
Recent 7d scores: {json.dumps(scores_dump)}

CRITICAL INSTRUCTIONS:
- NEVER say you don't have enough data. If data is sparse, give general high-performance advice or preparation tips for tomorrow.
- Be encouraging and concise.
- EVERYTHING YOU WRITE (summary, recommendations, patterns) MUST BE STRICTLY IN SPANISH (español). No English words allowed.
- Output ONLY strict JSON.

Output structure:
{{
  "score_adjustments": {{"ai_consistency": integer, "ai_focus_penalty": integer}},
  "feedback_summary": "Short 1-2 sentence analysis",
  "recommendations": ["specific actionable advice 1", "2"],
  "patterns": [
    {{"title": "Pattern name", "description": "Why it matters", "impact": "positive|negative|neutral", "confidence": float}}
  ]
}}
"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self._proxy_url,
                json={
                    "model": "gemini-2.5-flash",
                    "messages": [
                        {"role": "system", "content": "You are a professional performance JSON API. You MUST return valid JSON even if data is missing."},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=60.0
            )
            if response.status_code != 200:
                print(f"!!! Error del Proxy IA (Status {response.status_code}): {response.text}")
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            print(f"DEBUG: Respuesta cruda de la IA (primeros 500 chars): {content[:500]}")
            print(f"DEBUG: Respuesta cruda de la IA: {content[:100]}...")
            
            # Clean possible markdown block
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            parsed = json.loads(content.strip())
            
            patterns = [BehaviorPattern(**p) for p in parsed.get("patterns", [])]
            return AIInsightResult(
                score_adjustments=parsed.get("score_adjustments", {}),
                feedback_summary=parsed.get("feedback_summary", ""),
                recommendations=parsed.get("recommendations", []),
                patterns=patterns
            )
