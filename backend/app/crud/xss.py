from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.Comment import Comment


async def get_comments(db: AsyncSession, level_id: str) -> list[Comment]:
    result = await db.execute(
        select(Comment).where(Comment.level_id == level_id).order_by(Comment.created_at.desc())
    )
    return list(result.scalars().all())


async def create_comment(db: AsyncSession, user_id: int, level_id: str, content: str) -> Comment:
    comment = Comment(user_id=user_id, level_id=level_id, content=content)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


async def delete_comments(db: AsyncSession, level_id: str) -> None:
    await db.execute(delete(Comment).where(Comment.level_id == level_id))
    await db.commit()
