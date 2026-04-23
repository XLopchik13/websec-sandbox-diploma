import re

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.models.User import User

router = APIRouter()

_INJECTION_PATTERN = re.compile(r"[;&|`$]|\.\.")

_INJECTED_OUTPUTS: dict[str, str] = {
    "id": "uid=1000(www-data) gid=1000(www-data) groups=1000(www-data)\n",
    "whoami": "www-data\n",
    "uname -a": "Linux nettools-prod-01 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux\n",
    "uname": "Linux\n",
    "pwd": "/opt/nettools\n",
    "hostname": "nettools-prod-01\n",
    "cat /etc/passwd": (
        "root:x:0:0:root:/root:/bin/bash\n"
        "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n"
        "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n"
        "nettools:x:1000:1000:,,,:/home/nettools:/bin/bash\n"
    ),
    "ls -la": (
        "total 48\n"
        "drwxr-xr-x 3 nettools nettools 4096 Apr 18 09:12 .\n"
        "drwxr-xr-x 6 root     root     4096 Apr 10 14:31 ..\n"
        "-rw-r--r-- 1 nettools nettools 1423 Apr 18 09:12 app.py\n"
        "-rw------- 1 nettools nettools  312 Apr 10 14:31 config.env\n"
        "-rw-r--r-- 1 nettools nettools  198 Apr 10 14:31 requirements.txt\n"
        "drwxr-xr-x 2 nettools nettools 4096 Apr 10 14:31 templates\n"
    ),
    "ls": ("app.py  config.env  requirements.txt  templates\n"),
    "cat config.env": (
        "# NetTools production config\n"
        "APP_ENV=production\n"
        "DB_HOST=postgres-internal\n"
        "DB_PORT=5432\n"
        "DB_PASSWORD=sup3r_s3cr3t_2024\n"
        "SECRET_KEY=FLAG{cmdi_rce_via_ping}\n"
        "ALLOWED_HOSTS=nettools.corp-internal.io\n"
    ),
    "env": (
        "SHELL=/bin/bash\n"
        "PWD=/opt/nettools\n"
        "APP_ENV=production\n"
        "DB_HOST=postgres-internal\n"
        "DB_PASSWORD=sup3r_s3cr3t_2024\n"
        "SECRET_KEY=FLAG{cmdi_rce_via_ping}\n"
        "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n"
        "HOME=/home/nettools\n"
    ),
    "ps aux": (
        "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n"
        "root         1  0.0  0.1  22560  4096 ?        Ss   09:00   0:00 /sbin/init\n"
        "nettools   412  0.1  1.2 312448 25600 ?        Sl   09:01   0:08 python3 app.py\n"
        "www-data   891  0.0  0.0   2388   768 ?        S    09:12   0:00 sh -c ping -c 4 google.com\n"
    ),
    "ifconfig": (
        "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n"
        "        inet 10.0.1.42  netmask 255.255.255.0  broadcast 10.0.1.255\n"
        "        ether 02:42:0a:00:01:2a  txqueuelen 0  (Ethernet)\n"
        "\n"
        "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n"
        "        inet 127.0.0.1  netmask 255.0.0.0\n"
    ),
}

_SUCCESS_COMMANDS = {"cat config.env"}


def _simulate_ping(host: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9.\-]", "", host)
    if not clean:
        return ""
    return (
        f"PING {clean} ({clean}) 56(84) bytes of data.\n"
        f"64 bytes from {clean}: icmp_seq=1 ttl=115 time=12.4 ms\n"
        f"64 bytes from {clean}: icmp_seq=2 ttl=115 time=11.8 ms\n"
        f"64 bytes from {clean}: icmp_seq=3 ttl=115 time=13.1 ms\n"
        f"64 bytes from {clean}: icmp_seq=4 ttl=115 time=12.2 ms\n"
        f"\n"
        f"--- {clean} ping statistics ---\n"
        f"4 packets transmitted, 4 received, 0% packet loss, time 3004ms\n"
        f"rtt min/avg/max/mdev = 11.8/12.375/13.1/0.481 ms\n"
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
