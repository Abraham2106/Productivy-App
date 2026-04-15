from abc import ABC, abstractmethod

from ..entities.task import Task
from ..entities.score import Score


class IScoringStrategy(ABC):
    """Strategy pattern for score calculation. Allows V1 → V3 swap without
    touching TaskService or any other domain/application code."""

    @abstractmethod
    def calculate(self, tasks: list[Task]) -> Score: ...
