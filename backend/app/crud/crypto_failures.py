import hashlib

from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.CryptoUser import CryptoUser


def _md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()


_SEED = [
    {"username": "alice", "password_hash": _md5("sunshine"), "role": "user"},
    {"username": "bob", "password_hash": _md5("dragon"), "role": "user"},
    {"username": "carol", "password_hash": _md5("flower"), "role": "user"},
    {"username": "admin", "password_hash": _md5("password"), "role": "admin"},
]


async def ensure_seeded(db: AsyncSession) -> None:
    result = await db.execute(text("SELECT COUNT(*) FROM crypto_users"))
    if result.scalar() == 0:
        db.add_all([CryptoUser(**r) for r in _SEED])
        await db.commit()


async def get_users(db: AsyncSession) -> list[CryptoUser]:
    result = await db.execute(select(CryptoUser))
    return list(result.scalars().all())


async def login(db: AsyncSession, username: str, password: str) -> CryptoUser | None:
    await ensure_seeded(db)
    hashed = _md5(password)
    result = await db.execute(
        select(CryptoUser).where(
            CryptoUser.username == username,
            CryptoUser.password_hash == hashed,
        )
    )
    return result.scalar_one_or_none()


async def reset(db: AsyncSession) -> None:
    await db.execute(delete(CryptoUser))
    db.add_all([CryptoUser(**r) for r in _SEED])
    await db.commit()
