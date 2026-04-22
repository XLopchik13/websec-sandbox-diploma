from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.crud import crypto_failures as crud
from app.models.User import User
from app.schemas.crypto import CryptoLoginRequest, CryptoLoginResponse

router = APIRouter()


@router.get("/levels/8/users")
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud.ensure_seeded(db)
    users = await crud.get_users(db)
    return [{"id": u.id, "username": u.username, "password_hash": u.password_hash} for u in users]


@router.post("/levels/8/login", response_model=CryptoLoginResponse)
async def crypto_login(
    body: CryptoLoginRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await crud.login(db, body.username, body.password)
    if user:
        return CryptoLoginResponse(
            success=True,
            role=user.role,
            message=f"Добро пожаловать, {user.username}!",
        )
    return CryptoLoginResponse(success=False, role=None, message="Неверный логин или пароль.")


@router.post("/levels/8/reset", status_code=204)
async def crypto_reset(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await crud.reset(db)
