import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("JWT_SECRET", "test-secret-key")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core import database
from app.core.database import Base, get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.BankAccount import BankAccount  # noqa: F401
from app.models.Comment import Comment  # noqa: F401
from app.models.CryptoUser import CryptoUser  # noqa: F401
from app.models.EmailToken import EmailToken  # noqa: F401
from app.models.IdorProfile import IdorProfile  # noqa: F401
from app.models.Level import Level  # noqa: F401
from app.models.SqliAccount import SqliAccount  # noqa: F401
from app.models.User import User  # noqa: F401
from app.models.UserProgress import UserProgress  # noqa: F401

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def db_engine():
    engine = create_async_engine(TEST_DB_URL, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def session_factory(db_engine):
    return async_sessionmaker(db_engine, expire_on_commit=False)


@pytest.fixture
async def db(session_factory):
    async with session_factory() as s:
        yield s


@pytest.fixture
async def client(session_factory):
    async def override_get_db():
        async with session_factory() as s:
            yield s

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[database.get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def verified_user(db):
    user = User(
        email="alice@example.com",
        username="alice",
        password_hash=get_password_hash("secret123"),
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def auth_token(client, verified_user):
    resp = await client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
async def idor_profiles_seeded(db):
    from app.crud.idor import _SEED

    db.add_all(
        [
            IdorProfile(
                username=p.username,
                email=p.email,
                phone=p.phone,
                role=p.role,
                secret_note=p.secret_note,
            )
            for p in _SEED
        ]
    )
    await db.commit()
