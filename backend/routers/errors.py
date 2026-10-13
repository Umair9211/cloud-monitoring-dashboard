"""routers/errors.py — GET /api/errors  &  GET /api/activity"""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from backend.data.mock_data import generate_activity, generate_errors
from backend.models.schemas import ActivityResponse, ErrorsResponse

logger = logging.getLogger("Cloud.routers.errors")
router = APIRouter(tags=["Events"])


@router.get(
    "/api/errors",
    response_model=ErrorsResponse,
    summary="Recent Application Errors",
    description="Returns the most recent application errors grouped by level and service.",
)
async def errors() -> JSONResponse:
    logger.debug("Errors endpoint called.")
    errs = generate_errors()
    return JSONResponse(content={"errors": errs, "total": len(errs)})


@router.get(
    "/api/activity",
    response_model=ActivityResponse,
    summary="Recent Activity Feed",
    description="Returns a chronological feed of deployments, alerts, and infrastructure events.",
)
async def activity() -> JSONResponse:
    logger.debug("Activity endpoint called.")
    acts = generate_activity()
    return JSONResponse(content={"activities": acts, "total": len(acts)})
