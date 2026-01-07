from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import users as crud_users
from app.schemas.user import UserCreate, UserUpdate


class UserAlreadyExistsError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


async def get_user_by_id(db: AsyncSession, user_id: int):
    user = await crud_users.get_user(db, user_id)
    if not user:
        raise UserNotFoundError(f"User with id {user_id} not found")
    return user


async def create_new_user(db: AsyncSession, user_data: UserCreate):
    existing_user = await crud_users.get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")

    return await crud_users.create_user(db, user_data)


async def update_user_profile(db: AsyncSession, user_id: int, user_data: UserUpdate):
    if user_data.email:
        existing_user = await crud_users.get_user_by_email(db, email=user_data.email)
        if existing_user and existing_user.id != user_id:
            raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")

    updated_user = await crud_users.update_user(db, user_id, user_data)
    if not updated_user:
        raise UserNotFoundError(f"User with id {user_id} not found")
    return updated_user


async def delete_user_account(db: AsyncSession, user_id: int):
    success = await crud_users.delete_user(db, user_id)
    if not success:
        raise UserNotFoundError(f"User with id {user_id} not found")
