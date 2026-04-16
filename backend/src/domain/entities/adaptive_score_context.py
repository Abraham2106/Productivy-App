from datetime import date
from pydantic import BaseModel
from .daily_metrics import DailyMetrics
from .habit_pattern import HabitPattern
from .score import Score
from .task import Task

class FocusSessionSummary(BaseModel):
    completed_work_sessions: int
    completed_break_sessions: int
    total_focus_minutes: int

class AdaptiveScoreContext(BaseModel):
    date: date
    today_tasks: list[Task]
    today_metrics: DailyMetrics | None = None
    recent_scores: list[int]
    recent_habits: list[HabitPattern]
    focus_summary: FocusSessionSummary | None = None
