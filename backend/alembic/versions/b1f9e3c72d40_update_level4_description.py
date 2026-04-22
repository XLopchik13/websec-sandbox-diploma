"""update level 4 description

Revision ID: b1f9e3c72d40
Revises: e2b4d8f1c3a7
Create Date: 2026-04-22 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "b1f9e3c72d40"
down_revision: Union[str, Sequence[str], None] = "e2b4d8f1c3a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NEW = (
    "Корпоративный SSO хранит сессию в localStorage. "
    "Откройте DevTools и изучите токен corp_session. "
    "Возможно различные JWT декодеры помогут пройти уровень."
)

_OLD = (
    "Сервер принимает JWT с алгоритмом alg:none и не проверяет подпись. "
    "Раскодируйте токен сессии, измените роль на admin, сформируйте токен "
    "без подписи и отправьте его на эндпоинт."
)


def upgrade() -> None:
    op.execute(f"UPDATE levels SET description = '{_NEW}' WHERE id = 4")


def downgrade() -> None:
    op.execute(f"UPDATE levels SET description = '{_OLD}' WHERE id = 4")
