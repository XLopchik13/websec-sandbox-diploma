from pydantic import BaseModel


class SqliAccountSchema(BaseModel):
    id: int
    username: str
    role: str
