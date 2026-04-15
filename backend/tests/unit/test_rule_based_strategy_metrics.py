from datetime import date
from uuid import uuid4

from src.domain.entities.daily_metrics import DailyMetrics
from src.domain.entities.task import Task, TaskType
from src.infrastructure.scoring.rule_based_strategy import RuleBasedStrategy


def make_task(name: str, task_type: TaskType, completed: bool) -> Task:
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        name=name,
        task_type=task_type,
        completed=completed,
        date=date.today(),
    )


def make_metrics(
    sleep_hours: float,
    phone_minutes: int,
    study_minutes: int,
) -> DailyMetrics:
    return DailyMetrics(
        user_id=uuid4(),
        date=date.today(),
        sleep_hours=sleep_hours,
        phone_minutes=phone_minutes,
        study_minutes=study_minutes,
    )


def test_sleep_peak_is_in_optimal_range() -> None:
    strategy = RuleBasedStrategy()

    score_at_seven = strategy.calculate([], make_metrics(7.0, 60, 60))
    score_at_nine = strategy.calculate([], make_metrics(9.0, 60, 60))
    score_at_ten_half = strategy.calculate([], make_metrics(10.5, 60, 60))

    assert score_at_seven.breakdown["sleep"] == 18
    assert score_at_nine.breakdown["sleep"] == 18
    assert score_at_ten_half.breakdown["sleep"] < score_at_nine.breakdown["sleep"]


def test_sleep_below_five_has_steep_inverse_penalty() -> None:
    strategy = RuleBasedStrategy()

    moderate_deprivation = strategy.calculate([], make_metrics(4.5, 60, 60))
    severe_deprivation = strategy.calculate([], make_metrics(2.0, 60, 60))

    assert moderate_deprivation.breakdown["sleep"] < 0
    assert severe_deprivation.breakdown["sleep"] < moderate_deprivation.breakdown["sleep"]


def test_phone_below_thirty_gives_maximum_reward() -> None:
    score = RuleBasedStrategy().calculate([], make_metrics(7.5, 20, 60))
    assert score.breakdown["phone"] == 18


def test_phone_transition_zone_drops_linearly() -> None:
    strategy = RuleBasedStrategy()

    score_at_thirty = strategy.calculate([], make_metrics(7.5, 30, 60))
    score_mid_zone = strategy.calculate([], make_metrics(7.5, 75, 60))
    score_at_limit = strategy.calculate([], make_metrics(7.5, 120, 60))

    assert score_at_thirty.breakdown["phone"] > score_mid_zone.breakdown["phone"]
    assert score_mid_zone.breakdown["phone"] > score_at_limit.breakdown["phone"]
    assert score_at_limit.breakdown["phone"] == 0


def test_phone_critical_zone_scales_exponentially() -> None:
    strategy = RuleBasedStrategy()

    score_150 = strategy.calculate([], make_metrics(7.5, 150, 60))
    score_210 = strategy.calculate([], make_metrics(7.5, 210, 60))

    assert score_150.breakdown["phone"] < 0
    assert score_210.breakdown["phone"] < score_150.breakdown["phone"]


def test_study_zero_has_massive_penalty() -> None:
    score = RuleBasedStrategy().calculate([], make_metrics(7.5, 20, 0))
    assert score.breakdown["study"] == -30


def test_study_positive_time_has_diminishing_returns() -> None:
    strategy = RuleBasedStrategy()

    thirty_minutes = strategy.calculate([], make_metrics(7.5, 20, 30))
    sixty_minutes = strategy.calculate([], make_metrics(7.5, 20, 60))
    one_twenty_minutes = strategy.calculate([], make_metrics(7.5, 20, 120))

    early_gain_per_hour = (
        sixty_minutes.breakdown["study"] - thirty_minutes.breakdown["study"]
    ) / 0.5
    later_gain_per_hour = (
        one_twenty_minutes.breakdown["study"] - sixty_minutes.breakdown["study"]
    ) / 1

    assert thirty_minutes.breakdown["study"] > 0
    assert sixty_minutes.breakdown["study"] > thirty_minutes.breakdown["study"]
    assert one_twenty_minutes.breakdown["study"] > sixty_minutes.breakdown["study"]
    assert later_gain_per_hour < early_gain_per_hour


def test_metrics_none_preserves_sprint_one_behavior() -> None:
    tasks = [
        make_task("Ejercicio", TaskType.BASE, True),
        make_task("Leer", TaskType.ADDITIONAL, True),
    ]

    score = RuleBasedStrategy().calculate(tasks, None)

    assert score.value == 15
    assert score.breakdown == {"Ejercicio": 10, "Leer": 5}
