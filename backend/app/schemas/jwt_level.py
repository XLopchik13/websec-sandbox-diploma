from pydantic import BaseModel


class JwtTokenSchema(BaseModel):
    token: str


class JwtVerifyRequest(BaseModel):
    token: str


class JwtVerifySchema(BaseModel):
    access: str
    role: str
    message: str
    secret: str
