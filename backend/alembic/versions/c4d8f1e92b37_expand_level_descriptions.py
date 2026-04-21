"""expand level descriptions

Revision ID: c4d8f1e92b37
Revises: 6f618c2c8206
Create Date: 2026-04-21 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "c4d8f1e92b37"
down_revision: Union[str, Sequence[str], None] = "6f618c2c8206"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_updates = [
    (
        1,
        "Форма комментариев сохраняет HTML без санитизации — скрипт выполнится "
        "у всех, кто откроет страницу. Внедрите XSS-пейлоад так, чтобы при "
        "отрисовке комментария в браузере выполнился JavaScript.",
    ),
    (
        2,
        "Форма поиска строит SQL-запрос через конкатенацию строк. Используйте "
        "SQL-синтаксис в поле ввода, чтобы изменить логику WHERE и получить "
        "строку с ролью admin.",
    ),
    (
        3,
        "Страница профиля загружает данные по числовому ID из URL без проверки "
        "владельца. Перебирайте ID в адресной строке, пока не найдёте профиль "
        "с ролью admin.",
    ),
    (
        4,
        "Сервер принимает JWT с алгоритмом alg:none и не проверяет подпись. "
        "Раскодируйте токен сессии, измените роль на admin, сформируйте токен "
        "без подписи и отправьте его на эндпоинт.",
    ),
    (
        5,
        "Инструмент проверки ссылок выполняет HTTP-запрос к любому URL от имени "
        "сервера. Укажите внутренний адрес инфраструктуры, чтобы сервер вернул "
        "конфиденциальные данные.",
    ),
]


def upgrade() -> None:
    for level_id, description in _updates:
        op.execute(
            f"UPDATE levels SET description = '{description}' WHERE id = {level_id}"
        )


def downgrade() -> None:
    pass
