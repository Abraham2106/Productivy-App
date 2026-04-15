from pydantic import BaseModel


class Score(BaseModel):
    """Value object representing a calculated daily score."""

    value: int
    breakdown: dict[str, int]  # {task_name: points}
