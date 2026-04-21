from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    balance: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    last_transfer_to: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_transfer_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
