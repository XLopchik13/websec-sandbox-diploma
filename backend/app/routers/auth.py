from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import Token, create_access_token
from app.core.database import get_db
from app.core.security import verify_password
from app.crud import users as crud_users
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> UserRead:
    try:
        user_data = UserCreate(
            email=request.email,
            username=request.username,
            password=request.password,
        )
        return await user_service.create_new_user(db=db, user_data=user_data)
    except user_service.UserAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@auth_router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> Token:
    user = await crud_users.get_user_by_email(db, email=request.email)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token)
