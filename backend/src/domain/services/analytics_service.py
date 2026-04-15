from datetime import date, timedelta
from uuid import UUID

from ..entities.habit_pattern import HabitClassification, HabitPattern
from ..entities.task import TaskType
from ..entities.weekly_score import DailyScoreSummary, WeeklyScore
from ..interfaces.daily_score_repository import IDailyScoreRepository
from ..interfaces.habit_repository import IHabitRepository
from ..interfaces.metrics_repository import IMetricsRepository
from ..interfaces.scoring_strategy import IScoringStrategy
from ..interfaces.task_repository import ITaskRepository


class AnalyticsService:
    def __init__(
        self,
        task_repo: ITaskRepository,
        metrics_repo: IMetricsRepository,
        habit_repo: IHabitRepository,
        daily_score_repo: IDailyScoreRepository,
        scorer: IScoringStrategy,
    ) -> None:
        self._task_repo = task_repo
        self._metrics_repo = metrics_repo
        self._habit_repo = habit_repo
        self._daily_score_repo = daily_score_repo
        self._scorer = scorer

    async def get_weekly_score(self, user_id: UUID) -> WeeklyScore:
        daily_breakdown = await self.get_trend(user_id, days=7)
        total = sum(item.score for item in daily_breakdown)
        average = round(total / len(daily_breakdown), 1) if daily_breakdown else 0.0
        best_day = max(daily_breakdown, key=lambda item: item.score)
        worst_day = min(daily_breakdown, key=lambda item: item.score)

        return WeeklyScore(
            total=total,
            average=average,
            best_day=best_day.date,
            worst_day=worst_day.date,
            daily_breakdown=daily_breakdown,
        )

    async def get_trend(self, user_id: UUID, days: int = 7) -> list[DailyScoreSummary]:
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)

        stored_scores = await self._daily_score_repo.find_range(user_id, start_date, end_date)
        scores_by_date = {item.date: item for item in stored_scores}

        trend: list[DailyScoreSummary] = []
        for offset in range(days):
            target_date = start_date + timedelta(days=offset)
            summary = scores_by_date.get(target_date)
            if summary is None:
                summary = await self._build_missing_summary(user_id, target_date)
            trend.append(summary)

        return trend

    async def compute_habit_patterns(self, user_id: UUID) -> list[HabitPattern]:
        today = date.today()
        stats_by_task: dict[str, dict[str, int | bool]] = {}

        for offset in range(30):
            target_date = today - timedelta(days=offset)
            tasks = await self._task_repo.find_by_date(user_id, target_date)
            is_in_last_week = offset < 7

            for task in tasks:
                stats = stats_by_task.setdefault(
                    task.name,
                    {
                        "frequency_7d": 0,
                        "frequency_30d": 0,
                        "is_base": False,
                    },
                )

                if task.task_type == TaskType.BASE:
                    stats["is_base"] = True

                if task.completed:
                    stats["frequency_30d"] = int(stats["frequency_30d"]) + 1
                    if is_in_last_week:
                        stats["frequency_7d"] = int(stats["frequency_7d"]) + 1

        patterns: list[HabitPattern] = []
        for task_name, raw_stats in stats_by_task.items():
            frequency_7d = int(raw_stats["frequency_7d"])
            frequency_30d = int(raw_stats["frequency_30d"])
            is_base = bool(raw_stats["is_base"])

            if frequency_7d >= 5:
                classification = HabitClassification.POSITIVE
            elif is_base and frequency_7d <= 1:
                classification = HabitClassification.NEGATIVE
            else:
                classification = HabitClassification.NEUTRAL

            pattern = HabitPattern(
                task_name=task_name,
                frequency_7d=frequency_7d,
                frequency_30d=frequency_30d,
                classification=classification,
            )
            patterns.append(await self._habit_repo.upsert(user_id, pattern))

        priority = {
            HabitClassification.POSITIVE: 0,
            HabitClassification.NEGATIVE: 1,
            HabitClassification.NEUTRAL: 2,
        }
        return sorted(
            patterns,
            key=lambda item: (priority[item.classification], -item.frequency_7d, item.task_name),
        )

    async def _build_missing_summary(
        self, user_id: UUID, target_date: date
    ) -> DailyScoreSummary:
        tasks = await self._task_repo.find_by_date(user_id, target_date)
        metrics = await self._metrics_repo.find_by_date(user_id, target_date)

        if not tasks and metrics is None:
            return DailyScoreSummary(date=target_date, score=0)

        score = self._scorer.calculate(tasks, metrics)
        return await self._daily_score_repo.upsert_score(user_id, target_date, score.value)
