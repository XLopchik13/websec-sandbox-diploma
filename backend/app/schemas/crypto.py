from pydantic import BaseModel


class CryptoUserSchema(BaseModel):
    id: int
    username: str
    password_hash: str
    role: str

    class Config:
        from_attributes = True


class CryptoLoginRequest(BaseModel):
    username: str
    password: str


class CryptoLoginResponse(BaseModel):
    success: bool
    role: str | None = None
    message: str
