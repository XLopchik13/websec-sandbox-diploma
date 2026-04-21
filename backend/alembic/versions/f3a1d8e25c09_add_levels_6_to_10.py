"""add levels 6 to 10

Revision ID: f3a1d8e25c09
Revises: c4d8f1e92b37
Create Date: 2026-04-22 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f3a1d8e25c09"
down_revision: Union[str, Sequence[str], None] = "c4d8f1e92b37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_new_levels = sa.table(
    "levels",
    sa.column("title", sa.String),
    sa.column("description", sa.Text),
    sa.column("category", sa.String),
)

_level_seed = [
    {
        "title": "Path Traversal",
        "description": (
            "Файловый сервер принимает имя файла как параметр запроса и читает его с диска "
            "без проверки пути. Используйте последовательности ../ чтобы выйти за пределы "
            "разрешённой директории и добраться до системных файлов."
        ),
        "category": "Контроль доступа",
    },
    {
        "title": "Security Misconfiguration",
        "description": (
            "Панель мониторинга развёрнута с заводскими учётными данными, которые никто "
            "не сменил. Попробуйте очевидные комбинации логин/пароль, чтобы войти под "
            "привилегированным пользователем."
        ),
        "category": "Конфигурация",
    },
    {
        "title": "Cryptographic Failures",
        "description": (
            "Внутренний каталог пользователей хранит пароли в виде MD5-хешей — "
            "без соли и с устаревшим алгоритмом. Найдите хеш администратора и "
            "восстановите пароль через таблицу известных хешей."
        ),
        "category": "Криптография",
    },
    {
        "title": "Command Injection",
        "description": (
            "Инструмент сетевой диагностики подставляет ввод пользователя напрямую "
            "в shell-команду без экранирования. Внедрите дополнительную команду через "
            "разделители ; или && чтобы выполнить произвольный код на сервере."
        ),
        "category": "Инъекции",
    },
    {
        "title": "CSRF",
        "description": (
            "Банковский эндпоинт переводов проверяет только токен аутентификации, "
            "но не CSRF-токен. Откройте «вредоносную страницу» — она автоматически "
            "отправит запрос на перевод от вашего имени."
        ),
        "category": "Целостность данных",
    },
]


def upgrade() -> None:
    op.create_table(
        "crypto_users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("password_hash", sa.String(length=64), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "bank_accounts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("balance", sa.Integer(), nullable=False),
        sa.Column("last_transfer_to", sa.String(length=100), nullable=True),
        sa.Column("last_transfer_amount", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.bulk_insert(_new_levels, _level_seed)


def downgrade() -> None:
    op.drop_table("bank_accounts")
    op.drop_table("crypto_users")
