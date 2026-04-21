import re

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.User import User

router = APIRouter()

_INJECTION_PATTERN = re.compile(r"[;&|`$]|\.\.")

_INJECTED_OUTPUTS: dict[str, str] = {
    "id": "uid=0(root) gid=0(root) groups=0(root)\n",
    "whoami": "root\n",
    "cat /etc/passwd": (
        "root:x:0:0:root:/root:/bin/bash\n"
        "www-data:x:33:33::/var/www:/usr/sbin/nologin\n"
        "app:x:1000:1000::/home/app:/bin/sh\n"
    ),
    "ls": "app.py  config.env  requirements.txt  secret_backup.tar.gz\n",
    "cat config.env": "DB_HOST=postgres\nDB_PASSWORD=sup3r_s3cr3t\nSECRET=FLAG{cmdi_is_critical}\n",
    "env": "PATH=/usr/local/bin:/usr/bin\nDB_HOST=postgres\nDB_PASSWORD=sup3r_s3cr3t\nSECRET=FLAG{cmdi_is_critical}\n",
}

_SUCCESS_COMMANDS = {"cat config.env", "env"}


def _simulate_ping(host: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9.\-]", "", host)
    if not clean:
        return ""
    return (
        f"PING {clean} ({clean}): 56 data bytes\n"
        f"64 bytes from {clean}: icmp_seq=0 ttl=64 time=0.8 ms\n"
        f"64 bytes from {clean}: icmp_seq=1 ttl=64 time=0.7 ms\n"
        f"--- {clean} ping statistics ---\n"
        "2 packets transmitted, 2 received, 0% packet loss\n"
    )


def _simulate_injection(base_host: str, injected_cmd: str) -> str:
    ping_out = _simulate_ping(base_host)

    for known_cmd, output in _INJECTED_OUTPUTS.items():
        if known_cmd in injected_cmd:
            return ping_out + output

    return ping_out + f"sh: {injected_cmd}: command not found\n"


@router.get("/levels/9/ping")
async def ping(
    host: str,
    current_user: User = Depends(get_current_user),
):
    if not _INJECTION_PATTERN.search(host):
        if not host.strip():
            return {"output": "ping: missing host\n", "injected": False}
        return {"output": _simulate_ping(host), "injected": False}

    parts = re.split(r"[;&|]", host, maxsplit=1)
    base_host = parts[0].strip()
    injected_cmd = parts[1].strip() if len(parts) > 1 else ""

    if not injected_cmd:
        return {
            "output": _simulate_ping(base_host) + "sh: syntax error near unexpected token\n",
            "injected": False,
        }

    output = _simulate_injection(base_host, injected_cmd)
    success = any(sc in injected_cmd for sc in _SUCCESS_COMMANDS)
    return {"output": output, "injected": success}
