"""update cmdi description

Revision ID: a3f7c2d91e05
Revises: e8db0c647d90
Create Date: 2026-04-23 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "a3f7c2d91e05"
down_revision: Union[str, Sequence[str], None] = "e8db0c647d90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE levels SET description = 'Инструмент сетевой диагностики подставляет ввод пользователя напрямую "
        "в shell-команду без экранирования. Внедрите дополнительную команду через "
        "разделители ; или && и прочитайте секретный файл конфигурации на сервере.' "
        "WHERE title = 'Command Injection'"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE levels SET description = 'Инструмент сетевой диагностики подставляет ввод пользователя напрямую "
        "в shell-команду без экранирования. Внедрите дополнительную команду через "
        "разделители ; или && чтобы выполнить произвольный код на сервере.' "
        "WHERE title = 'Command Injection'"
    )
