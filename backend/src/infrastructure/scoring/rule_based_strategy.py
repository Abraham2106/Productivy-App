from src.domain.interfaces.scoring_strategy import IScoringStrategy
from src.domain.entities.task import Task, TaskType
from src.domain.entities.score import Score


class RuleBasedStrategy(IScoringStrategy):
    """
    Scoring V1 — Rule-based point system.

    Rules:
      BASE completed     → +10 pts
      BASE not completed → -5  pts
      ADDITIONAL completed     → +5 pts
      ADDITIONAL not completed → 0  pts (no penalty)

    Sprint 3 will swap this for AIStrategy via the IScoringStrategy interface.
    """

    def calculate(self, tasks: list[Task]) -> Score:
        breakdown: dict[str, int] = {}
        total = 0

        for task in tasks:
            if task.task_type == TaskType.BASE:
                pts = 10 if task.completed else -5
            else:  # ADDITIONAL
                pts = 5 if task.completed else 0

            breakdown[task.name] = pts
            total += pts

        return Score(value=total, breakdown=breakdown)
