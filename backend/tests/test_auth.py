import pytest


async def test_register_creates_user(client):
    resp = await client.post(
        "/auth/register",
        json={"email": "bob@example.com", "username": "bob", "password": "pass1234"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "bob@example.com"
    assert body["username"] == "bob"
    assert "password_hash" not in body


async def test_register_duplicate_email_blocked(client, verified_user):
    resp = await client.post(
        "/auth/register",
        json={"email": "alice@example.com", "username": "alice2", "password": "x12345"},
    )
    assert resp.status_code == 400


async def test_login_with_valid_credentials(client, verified_user):
    resp = await client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


async def test_login_with_wrong_password_rejected(client, verified_user):
    resp = await client.post(
        "/auth/login",
        json={"email": "alice@example.com", "password": "wrong-password"},
    )
    assert resp.status_code == 401


@pytest.mark.parametrize(
    "endpoint",
    ["/sandbox/levels", "/sandbox/progress"],
)
async def test_protected_endpoints_require_token(client, endpoint):
    resp = await client.get(endpoint)
    assert resp.status_code in (401, 403)


async def test_protected_endpoint_accepts_valid_token(client, auth_headers):
    resp = await client.get("/sandbox/progress", headers=auth_headers)
    assert resp.status_code == 200
