from pydantic import BaseModel


class SsrfFetchRequest(BaseModel):
    url: str


class SsrfFetchSchema(BaseModel):
    status: int
    content: str
    secret: str | None
