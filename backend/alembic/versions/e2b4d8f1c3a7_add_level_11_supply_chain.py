"""add level 11 supply chain

Revision ID: e2b4d8f1c3a7
Revises: f3a1d8e25c09
Create Date: 2026-04-22 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e2b4d8f1c3a7"
down_revision: Union[str, Sequence[str], None] = "f3a1d8e25c09"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_levels = sa.table(
    "levels",
    sa.column("title", sa.String),
    sa.column("description", sa.Text),
    sa.column("category", sa.String),
)


def upgrade() -> None:
    op.bulk_insert(
        _levels,
        [
            {
                "title": "Supply Chain Attack",
                "description": (
                    "Реестр пакетов содержит тайпсквоттинговую копию популярной библиотеки. "
                    "Злоумышленник опубликовал пакет с похожим именем, который содержит "
                    "вредоносный postinstall-скрипт. Найдите поддельный пакет и "
                    "установите его, чтобы увидеть атаку в действии."
                ),
                "category": "Цепочка поставок",
            }
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM levels WHERE title = 'Supply Chain Attack'")
