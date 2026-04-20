from pydantic import BaseModel


class ProgressSchema(BaseModel):
    completed: list[str]
    total: int
