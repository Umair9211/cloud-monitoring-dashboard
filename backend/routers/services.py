"""routers/services.py — GET /api/services"""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from backend.data.mock_data import generate_services
from backend.models.schemas import ServicesResponse

logger = logging.getLogger("Cloud.routers.services")
router = APIRouter(tags=["Services"])


@router.get(
    "/api/services",
    response_model=ServicesResponse,
    summary="Service Health Overview",
    description="Returns the health, latency, and uptime of all monitored AWS services.",
)
async def services() -> JSONResponse:
    logger.debug("Services endpoint called.")
    svcs = generate_services()
    return JSONResponse(
        content={
            "services": svcs,
            "total": len(svcs),
            "healthy": sum(1 for s in svcs if s["status"] == "healthy"),
            "degraded": sum(1 for s in svcs if s["status"] == "degraded"),
            "offline": sum(1 for s in svcs if s["status"] == "offline"),
        }
    )
