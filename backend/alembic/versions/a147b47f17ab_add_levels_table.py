"""add levels table

Revision ID: a147b47f17ab
Revises: 61a3fb2f8143
Create Date: 2026-04-20 00:20:28.314718

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a147b47f17ab"
down_revision: Union[str, Sequence[str], None] = "61a3fb2f8143"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_levels = sa.table(
    "levels",
    sa.column("title", sa.String),
    sa.column("description", sa.Text),
    sa.column("owasp", sa.String),
    sa.column("category", sa.String),
)

_seed = [
    {"title": "Stored XSS", "description": "Выполните произвольный JavaScript через поле комментариев", "owasp": "A03", "category": "Инъекции"},
    {"title": "SQL Injection", "description": "Получите доступ к скрытой записи admin через форму поиска", "owasp": "A03", "category": "Инъекции"},
    {"title": "IDOR", "description": "Получите доступ к приватному профилю администратора", "owasp": "A01", "category": "Контроль доступа"},
    {"title": "Broken Authentication", "description": "Подмените алгоритм подписи токена и получите права администратора", "owasp": "A07", "category": "Аутентификация"},
    {"title": "SSRF", "description": "Заставьте сервер обратиться к внутренней инфраструктуре и получите секретные данные", "owasp": "A10", "category": "Прочие уязвимости"},
]


def upgrade() -> None:
    op.create_table(
        "levels",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("owasp", sa.String(length=10), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.bulk_insert(_levels, _seed)


def downgrade() -> None:
    op.drop_table("levels")
