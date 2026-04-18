from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class IdorProfile(Base):
    __tablename__ = "idor_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(20))
    role: Mapped[str] = mapped_column(String(50), default="user")
    secret_note: Mapped[str] = mapped_column(String(500))
