from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.IdorProfile import IdorProfile

_SEED = [
    IdorProfile(
        username="john_doe",
        email="john@example.com",
        phone="+7-900-111-2233",
        role="user",
        secret_note="Список задач на неделю: купить продукты, записаться к врачу",
    ),
    IdorProfile(
        username="jane_smith",
        email="jane@example.com",
        phone="+7-900-444-5566",
        role="user",
        secret_note="Пароль от домашнего Wi-Fi: sunshine2024",
    ),
    IdorProfile(
        username="bob_johnson",
        email="bob@example.com",
        phone="+7-900-777-8899",
        role="moderator",
        secret_note="Список заблокированных пользователей: user_42, user_87",
    ),
    IdorProfile(
        username="alice_brown",
        email="alice@example.com",
        phone="+7-900-000-1122",
        role="user",
        secret_note="Дневник: сегодня был отличный день, встретила старого друга",
    ),
    IdorProfile(
        username="admin",
        email="admin@company.internal",
        phone="+7-900-999-0000",
        role="admin",
        secret_note="Резервный код доступа к системе: ADMIN-BACKUP-9X4K",
    ),
]


def _make_profiles() -> list[IdorProfile]:
    return [
        IdorProfile(
            username=p.username,
            email=p.email,
            phone=p.phone,
            role=p.role,
            secret_note=p.secret_note,
        )
        for p in _SEED
    ]


async def _truncate_and_seed(db: AsyncSession) -> None:
    await db.execute(text("TRUNCATE TABLE idor_profiles RESTART IDENTITY"))
    db.add_all(_make_profiles())
    await db.commit()


async def ensure_seeded(db: AsyncSession) -> None:
    result = await db.execute(select(IdorProfile))
    if not result.scalars().first():
        await _truncate_and_seed(db)


async def get_profile(db: AsyncSession, profile_id: int) -> IdorProfile | None:
    result = await db.execute(select(IdorProfile).where(IdorProfile.id == profile_id))
    return result.scalar_one_or_none()


async def get_profile_by_username(db: AsyncSession, username: str) -> IdorProfile | None:
    result = await db.execute(select(IdorProfile).where(IdorProfile.username == username))
    return result.scalar_one_or_none()


async def reset_profiles(db: AsyncSession) -> None:
    await _truncate_and_seed(db)
