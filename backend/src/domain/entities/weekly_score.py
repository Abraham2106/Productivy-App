from datetime import date

from pydantic import BaseModel


class DailyScoreSummary(BaseModel):
    date: date
    score: int


class WeeklyScore(BaseModel):
    total: int
    average: float
    best_day: date
    worst_day: date
    daily_breakdown: list[DailyScoreSummary]
