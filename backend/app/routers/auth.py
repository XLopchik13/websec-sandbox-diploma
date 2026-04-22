from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import Token, create_access_token
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password
from app.crud import email_tokens as crud_tokens
from app.crud import users as crud_users
from app.models.EmailToken import TokenType
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserCreate, UserRead
from app.services import email_service, user_service

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> UserRead:
    try:
        user_data = UserCreate(
            email=request.email,
            username=request.username,
            password=request.password,
        )
        user = await user_service.create_new_user(db=db, user_data=user_data)
        token_obj = await crud_tokens.create_token(db, user.id, TokenType.verify)
        try:
            await email_service.send_verification_email(user.email, token_obj.token)
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")
        return user
    except user_service.UserAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@auth_router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)) -> Token:
    user = await crud_users.get_user_by_email(db, email=request.email)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email не подтверждён. Проверьте почту.",
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


class VerifyEmailRequest(BaseModel):
    token: str


@auth_router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(request: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    token_obj = await crud_tokens.get_token(db, request.token, TokenType.verify)
    if not token_obj or token_obj.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недействительная или использованная ссылка",
        )
    if token_obj.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Срок действия ссылки истёк"
        )

    user = await crud_users.get_user(db, token_obj.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    user.is_verified = True
    await crud_tokens.mark_used(db, token_obj)
    await db.commit()
    return {"message": "Email подтверждён"}


class PasswordResetRequest(BaseModel):
    email: EmailStr


@auth_router.post("/request-password-reset", status_code=status.HTTP_200_OK)
async def request_password_reset(request: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    user = await crud_users.get_user_by_email(db, email=request.email)
    if user:
        token_obj = await crud_tokens.create_token(db, user.id, TokenType.reset)
        try:
            await email_service.send_password_reset_email(user.email, token_obj.token)
        except Exception as e:
            print(f"[EMAIL ERROR] {e}")
    return {"message": "Если такой email зарегистрирован, письмо отправлено"}


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@auth_router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    token_obj = await crud_tokens.get_token(db, request.token, TokenType.reset)
    if not token_obj or token_obj.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недействительная или использованная ссылка",
        )
    if token_obj.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Срок действия ссылки истёк"
        )

    user = await crud_users.get_user(db, token_obj.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    user.password_hash = get_password_hash(request.new_password)
    await crud_tokens.mark_used(db, token_obj)
    await db.commit()
    return {"message": "Пароль изменён"}
