from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.BankAccount import BankAccount

_INITIAL_BALANCE = 1000


async def get_or_create_account(db: AsyncSession, user_id: int) -> BankAccount:
    result = await db.execute(select(BankAccount).where(BankAccount.user_id == user_id))
    account = result.scalar_one_or_none()
    if account is None:
        account = BankAccount(user_id=user_id, balance=_INITIAL_BALANCE)
        db.add(account)
        await db.commit()
        await db.refresh(account)
    return account


async def transfer(db: AsyncSession, user_id: int, amount: int, to: str) -> BankAccount:
    account = await get_or_create_account(db, user_id)
    account.balance = max(0, account.balance - amount)
    account.last_transfer_to = to
    account.last_transfer_amount = amount
    await db.commit()
    await db.refresh(account)
    return account


async def reset_account(db: AsyncSession, user_id: int) -> BankAccount:
    account = await get_or_create_account(db, user_id)
    account.balance = _INITIAL_BALANCE
    account.last_transfer_to = None
    account.last_transfer_amount = None
    await db.commit()
    await db.refresh(account)
    return account
