import secrets
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.EmailToken import EmailToken, TokenType


async def create_token(db: AsyncSession, user_id: int, token_type: TokenType) -> EmailToken:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    db_token = EmailToken(user_id=user_id, token=token, type=token_type, expires_at=expires_at)
    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)
    return db_token


async def get_token(db: AsyncSession, token: str, token_type: TokenType) -> EmailToken | None:
    result = await db.execute(
        select(EmailToken).where(EmailToken.token == token, EmailToken.type == token_type)
    )
    return result.scalar_one_or_none()


async def mark_used(db: AsyncSession, token_obj: EmailToken) -> None:
    token_obj.used = True
    await db.commit()
