from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.User import User
from app.schemas.user import UserRead, UserUpdate
from app.services import user_service

user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.get("/me", response_model=UserRead)
async def get_current_user_profile(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@user_router.put("/me", response_model=UserRead)
async def update_current_user_profile(
    user: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    try:
        return await user_service.update_user_profile(
            db=db, user_id=current_user.id, user_data=user
        )
    except user_service.UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except user_service.UserAlreadyExistsError as e:
        raise HTTPException(status_code=400, detail=str(e))


@user_router.delete("/me", status_code=204)
async def delete_current_user_account(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> None:
    try:
        await user_service.delete_user_account(db=db, user_id=current_user.id)
    except user_service.UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
