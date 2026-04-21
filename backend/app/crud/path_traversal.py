import posixpath

_FILES: dict[str, str] = {
    "reports/q1-2025.txt": "Q1 2025 Financial Report\nRevenue: $2.1M | Expenses: $1.4M | Net: $700K\n",
    "reports/q2-2025.txt": "Q2 2025 Financial Report\nRevenue: $2.3M | Expenses: $1.5M | Net: $800K\n",
    "readme.txt": "Document Server v1.4\nUse ?name=<path> to fetch documents.\n",
    "notes.txt": "Team meeting 2025-04-10: discussed Q2 targets.\n",
}

_TRAVERSAL_SECRETS: dict[str, str] = {
    "/etc/passwd": (
        "root:x:0:0:root:/root:/bin/bash\n"
        "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n"
        "bin:x:2:2:bin:/bin:/usr/sbin/nologin\n"
        "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n"
        "app:x:1000:1000::/home/app:/bin/sh\n"
        "postgres:x:999:999::/var/lib/postgresql:/bin/bash\n"
    ),
    "/etc/shadow": (
        "root:$6$rounds=5000$abc123$xxxhashxxx:19000:0:99999:7:::\n"
        "app:$6$rounds=5000$xyz789$yyyhasyyy:19000:0:99999:7:::\n"
    ),
    "/proc/self/environ": (
        "PATH=/usr/local/bin:/usr/bin:/bin\x00"
        "DB_PASSWORD=sup3r_s3cr3t_pg_2025\x00"
        "SECRET_KEY=c8a9f1e234b567d890\x00"
        "HOSTNAME=app-server-01\x00"
    ),
}

_BASE = "/var/www/documents"


def read_file(name: str) -> dict:
    if not any(segment == ".." for segment in name.split("/")) and ".." not in name:
        content = _FILES.get(name.lstrip("/"))
        if content:
            return {"found": True, "content": content, "traversal": False}
        return {"found": False, "content": None, "traversal": False}

    resolved = posixpath.normpath(_BASE + "/" + name)
    relative = posixpath.normpath("/" + name)

    for secret_path, secret_content in _TRAVERSAL_SECRETS.items():
        if secret_path in resolved or relative == secret_path:
            return {"found": True, "content": secret_content, "traversal": True}

    return {"found": False, "content": None, "traversal": True}
