"""
Unit tests for RuleBasedStrategy (IScoringStrategy V1).

Rules under test:
  BASE completed     → +10
  BASE not completed → -5
  ADDITIONAL completed     → +5
  ADDITIONAL not completed → 0
"""
import pytest
from uuid import uuid4
from datetime import date

from src.domain.entities.task import Task, TaskType
from src.infrastructure.scoring.rule_based_strategy import RuleBasedStrategy


# ------------------------------------------------------------------ #
# Helpers                                                              #
# ------------------------------------------------------------------ #

def make_task(name: str, task_type: TaskType, completed: bool) -> Task:
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        name=name,
        task_type=task_type,
        completed=completed,
        date=date.today(),
    )


# ------------------------------------------------------------------ #
# Individual rule tests                                                #
# ------------------------------------------------------------------ #

def test_base_task_completed_gives_plus_10():
    strategy = RuleBasedStrategy()
    tasks = [make_task("Ejercicio", TaskType.BASE, True)]

    score = strategy.calculate(tasks)

    assert score.value == 10
    assert score.breakdown["Ejercicio"] == 10


def test_base_task_not_completed_gives_minus_5():
    strategy = RuleBasedStrategy()
    tasks = [make_task("Meditación", TaskType.BASE, False)]

    score = strategy.calculate(tasks)

    assert score.value == -5
    assert score.breakdown["Meditación"] == -5


def test_additional_task_completed_gives_plus_5():
    strategy = RuleBasedStrategy()
    tasks = [make_task("Leer", TaskType.ADDITIONAL, True)]

    score = strategy.calculate(tasks)

    assert score.value == 5
    assert score.breakdown["Leer"] == 5


def test_additional_task_not_completed_gives_zero():
    strategy = RuleBasedStrategy()
    tasks = [make_task("Llamar médico", TaskType.ADDITIONAL, False)]

    score = strategy.calculate(tasks)

    assert score.value == 0
    assert score.breakdown["Llamar médico"] == 0


# ------------------------------------------------------------------ #
# Mix / integration scenario                                           #
# ------------------------------------------------------------------ #

def test_mix_of_tasks_correct_total_and_breakdown():
    """
    Ejercicio (BASE, done):       +10
    Leer (BASE, done):            +10
    Meditación (BASE, not done):   -5
    Proyecto (ADDITIONAL, done):   +5
    Médico (ADDITIONAL, not done):  0
    Total: 20
    """
    strategy = RuleBasedStrategy()
    tasks = [
        make_task("Ejercicio", TaskType.BASE, True),
        make_task("Leer", TaskType.BASE, True),
        make_task("Meditación", TaskType.BASE, False),
        make_task("Proyecto", TaskType.ADDITIONAL, True),
        make_task("Médico", TaskType.ADDITIONAL, False),
    ]

    score = strategy.calculate(tasks)

    assert score.value == 20
    assert score.breakdown == {
        "Ejercicio": 10,
        "Leer": 10,
        "Meditación": -5,
        "Proyecto": 5,
        "Médico": 0,
    }


def test_empty_task_list_gives_zero():
    strategy = RuleBasedStrategy()
    score = strategy.calculate([])
    assert score.value == 0
    assert score.breakdown == {}
