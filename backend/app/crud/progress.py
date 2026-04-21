from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.UserProgress import UserProgress


async def get_completed_levels(db: AsyncSession, user_id: int) -> list[str]:
    result = await db.execute(select(UserProgress.level_id).where(UserProgress.user_id == user_id))
    return [row[0] for row in result.all()]


async def complete_level(db: AsyncSession, user_id: int, level_id: str) -> bool:
    """Returns False if already completed, True if newly completed."""
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.level_id == level_id,
        )
    )
    if result.scalar_one_or_none():
        return False

    db.add(UserProgress(user_id=user_id, level_id=level_id))
    await db.commit()
    return True


async def uncomplete_level(db: AsyncSession, user_id: int, level_id: str) -> None:
    await db.execute(
        delete(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.level_id == level_id,
        )
    )
    await db.commit()


async def reset_progress(db: AsyncSession, user_id: int) -> None:
    await db.execute(delete(UserProgress).where(UserProgress.user_id == user_id))
    await db.commit()
