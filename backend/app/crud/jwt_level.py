import base64
import json

from jose import jwt as jose_jwt

SANDBOX_SECRET = "corp-internal-secret-2024"
SANDBOX_ALGORITHM = "HS256"


def create_sandbox_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "role": "user", "portal": "corp-internal"}
    return jose_jwt.encode(payload, SANDBOX_SECRET, algorithm=SANDBOX_ALGORITHM)


def _b64decode(s: str) -> bytes:
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)


def verify_vulnerable_token(token: str) -> dict:
    """Intentionally vulnerable: accepts alg:none without signature verification."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")

    header = json.loads(_b64decode(parts[0]))
    payload = json.loads(_b64decode(parts[1]))

    if header.get("alg", "").lower() == "none":
        return payload

    return dict(jose_jwt.decode(token, SANDBOX_SECRET, algorithms=[SANDBOX_ALGORITHM]))
