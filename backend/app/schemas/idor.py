from pydantic import BaseModel


class IdorProfileSchema(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    role: str
    secret_note: str

    model_config = {"from_attributes": True}
