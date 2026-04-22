"""update level 5 description

Revision ID: d5a2c9e8f1b6
Revises: b1f9e3c72d40
Create Date: 2026-04-22 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "d5a2c9e8f1b6"
down_revision: Union[str, Sequence[str], None] = "b1f9e3c72d40"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NEW = (
    "Инструмент проверки ссылок выполняет HTTP-запрос к различным URL от имени "
    "сервера. Проверьте, возможно ли выполнить запрос к внутренним адресам "
    "инфраструктуры (например http://127.0.0.1/admin), чтобы заполучить "
    "конфиденциальные данные."
)

_OLD = (
    "Инструмент проверки ссылок выполняет HTTP-запрос к любому URL от имени "
    "сервера. Укажите внутренний адрес инфраструктуры, чтобы сервер вернул "
    "конфиденциальные данные."
)


def upgrade() -> None:
    op.execute(f"UPDATE levels SET description = '{_NEW}' WHERE id = 5")


def downgrade() -> None:
    op.execute(f"UPDATE levels SET description = '{_OLD}' WHERE id = 5")
