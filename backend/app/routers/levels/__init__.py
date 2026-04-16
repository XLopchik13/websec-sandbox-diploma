from fastapi import APIRouter

from app.routers.levels import level1_xss, level2_sqli

router = APIRouter(prefix="/sandbox", tags=["levels"])

router.include_router(level1_xss.router)
router.include_router(level2_sqli.router)
