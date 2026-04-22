from fastapi import APIRouter

from app.routers.levels import (
    level1_xss,
    level2_sqli,
    level3_idor,
    level4_jwt,
    level5_ssrf,
    level6_path_traversal,
    level7_misconfig,
    level8_crypto,
    level9_cmdi,
    level10_csrf,
    levels_catalog,
)

router = APIRouter(prefix="/sandbox", tags=["levels"])

router.include_router(levels_catalog.router)
router.include_router(level1_xss.router)
router.include_router(level2_sqli.router)
router.include_router(level3_idor.router)
router.include_router(level4_jwt.router)
router.include_router(level5_ssrf.router)
router.include_router(level6_path_traversal.router)
router.include_router(level7_misconfig.router)
router.include_router(level8_crypto.router)
router.include_router(level9_cmdi.router)
router.include_router(level10_csrf.router)
