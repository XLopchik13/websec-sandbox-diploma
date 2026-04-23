"""update stored xss description

Revision ID: e8db0c647d90
Revises: 2eb17a0d3eee
Create Date: 2026-04-23 13:41:56.664189

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e8db0c647d90"
down_revision: Union[str, Sequence[str], None] = "2eb17a0d3eee"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE levels SET description = 'Выполните произвольный JavaScript через поле комментариев. Попробуйте вызвать функцию levelSuccess()' WHERE id = 1"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE levels SET description = 'Форма комментариев сохраняет HTML без санитизации — скрипт выполнится у всех, кто откроет страницу. Внедрите XSS-пейлоад так, чтобы при отрисовке комментария в браузере выполнился JavaScript.' WHERE id = 1"
    )
