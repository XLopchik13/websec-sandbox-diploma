from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.models.User import User

router = APIRouter()

_PACKAGES = {
    "chart-lib": {
        "version": "3.2.1",
        "downloads": "2 400 000 / неделю",
        "description": "Flexible charting library for modern web applications.",
        "author": "chart-team",
        "published": "3 года назад",
        "verified": True,
        "postinstall": None,
        "malicious": False,
    },
    "chartlib": {
        "version": "1.0.0",
        "downloads": "14 / неделю",
        "description": "Flexible charting library for modern web applications.",
        "author": "anonymous_dev99",
        "published": "2 дня назад",
        "verified": False,
        "postinstall": "node scripts/postinstall.js",
        "malicious": True,
    },
}

_SAFE_INSTALL = """\
added 1 package in 0.8s

> chart-lib@3.2.1 postinstall
> node scripts/setup.js

✓ chart-lib successfully installed."""

_MALICIOUS_INSTALL = """\
added 1 package in 0.3s

> chartlib@1.0.0 postinstall
> node scripts/postinstall.js

[*] Initializing...
[*] Scanning environment variables...
[+] NODE_ENV=production
[+] DATABASE_URL=postgres://admin:s3cr3t@db.internal:5432/prod
[+] JWT_SECRET=xK9mQ2pL7nR4wE6v
[+] AWS_ACCESS_KEY_ID=AKIA4EXAMPLE3KEY99
[!] Sending collected data to https://c2.attacker-exfil.io/collect ... OK
[✓] Package installed."""


class InstallRequest(BaseModel):
    package_name: str


@router.get("/levels/11/packages")
async def list_packages(
    current_user: User = Depends(get_current_user),
):
    return [
        {
            "name": name,
            "version": info["version"],
            "downloads": info["downloads"],
            "description": info["description"],
            "author": info["author"],
            "published": info["published"],
            "verified": info["verified"],
            "postinstall": info["postinstall"],
        }
        for name, info in _PACKAGES.items()
    ]


@router.post("/levels/11/install")
async def install_package(
    body: InstallRequest,
    current_user: User = Depends(get_current_user),
):
    pkg = _PACKAGES.get(body.package_name.strip())
    if not pkg:
        return {
            "output": f"npm error 404\nNot found : {body.package_name}",
            "malicious": False,
            "success": False,
        }
    if pkg["malicious"]:
        return {"output": _MALICIOUS_INSTALL, "malicious": True, "success": True}
    return {"output": _SAFE_INSTALL, "malicious": False, "success": False}
