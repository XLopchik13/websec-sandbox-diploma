from typing import TypedDict

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.models.User import User

router = APIRouter()


class _MisconfigUser(TypedDict):
    password: str
    role: str
    secret: str | None


_USERS: dict[str, _MisconfigUser] = {
    "admin": {"password": "admin", "role": "admin", "secret": "FLAG{default_creds_are_dangerous}"},
    "operator": {"password": "operator123", "role": "operator", "secret": None},
}


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/levels/7/login")
async def misconfig_login(
    body: LoginRequest,
    current_user: User = Depends(get_current_user),
):
    user = _USERS.get(body.username)
    if user and user["password"] == body.password:
        return {
            "success": True,
            "role": user["role"],
            "message": f"Welcome, {body.username}!",
            "secret": user["secret"],
        }
    return {"success": False, "role": None, "message": "Invalid credentials.", "secret": None}
