"""routers/health.py — GET /api/health"""

import logging
import time
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.models.schemas import HealthResponse

logger = logging.getLogger("Cloud.routers.health")
router = APIRouter(tags=["Observability"])

_start_time = time.monotonic()


@router.get(
    "/api/health",
    response_model=HealthResponse,
    summary="Application Health",
    description="Liveness probe — confirms the process is responsive and returns uptime.",
)
async def health() -> JSONResponse:
    logger.debug("Health check called.")
    return JSONResponse(
        content={
            "status": "healthy",
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "uptime_seconds": round(time.monotonic() - _start_time, 2),
            "version": settings.app_version,
            "environment": settings.environment,
        }
    )
