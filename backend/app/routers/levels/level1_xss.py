from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.Comment import Comment
from app.models.User import User
from app.schemas.comment import CommentCreate, CommentRead

router = APIRouter()


@router.post("/levels/1/comments", response_model=CommentRead)
async def create_comment(
    comment_data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_comment = Comment(
        user_id=current_user.id,
        level_id="1",
        content=comment_data.content,
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)
    return new_comment


@router.get("/levels/1/comments", response_model=List[CommentRead])
async def get_comments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Comment).where(Comment.level_id == "1").order_by(Comment.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/levels/1/comments")
async def delete_comments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(delete(Comment).where(Comment.level_id == "1"))
    await db.commit()
    return {"message": "Comments cleared"}
