from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from pydantic import BaseModel

from .config import settings


class TokenData(BaseModel):
    user_id: int | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: int | None = payload.get("sub")
        if user_id is None:
            raise ValueError("Token missing subject")
        return TokenData(user_id=user_id)
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
