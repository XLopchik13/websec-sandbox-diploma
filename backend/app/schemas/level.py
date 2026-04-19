from pydantic import BaseModel, field_validator


class LevelSchema(BaseModel):
    id: str
    title: str
    description: str
    owasp: str
    category: str

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v: object) -> str:
        return str(v)

    model_config = {"from_attributes": True}
