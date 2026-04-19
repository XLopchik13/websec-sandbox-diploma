from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import jwt_level as crud_jwt
from app.models.User import User

router = APIRouter()


class VerifyTokenRequest(BaseModel):
    token: str


@router.get("/levels/4/token")
async def get_sandbox_token(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token = crud_jwt.create_sandbox_token(current_user.id)
    return {"token": token}


@router.post("/levels/4/verify")
async def verify_token(
    body: VerifyTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        payload = crud_jwt.verify_vulnerable_token(body.token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: insufficient role")

    return {
        "access": "granted",
        "role": "admin",
        "message": "Добро пожаловать в административную панель",
        "secret": "CORP-ADMIN-FLAG-9K2X",
    }
