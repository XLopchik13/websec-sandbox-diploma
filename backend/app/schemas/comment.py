from datetime import datetime

from pydantic import BaseModel


class CommentCreate(BaseModel):
    content: str


class CommentRead(BaseModel):
    id: int
    user_id: int
    level_id: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
