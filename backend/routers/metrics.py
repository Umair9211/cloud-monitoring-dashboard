"""routers/metrics.py — GET /api/metrics  &  GET /api/metrics/timeseries"""

import logging

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from backend.data.mock_data import generate_current_metrics, generate_timeseries
from backend.models.schemas import MetricsResponse, TimeseriesResponse

logger = logging.getLogger("Cloud.routers.metrics")
router = APIRouter(tags=["Metrics"])


@router.get(
    "/api/metrics",
    response_model=MetricsResponse,
    summary="Current Metrics Snapshot",
    description="Returns the latest CPU, memory, request-rate, response-time, and error-rate values.",
)
async def current_metrics() -> JSONResponse:
    logger.debug("Current metrics called.")
    return JSONResponse(content=generate_current_metrics())


@router.get(
    "/api/metrics/timeseries",
    response_model=TimeseriesResponse,
    summary="Time-Series Metrics",
    description="Returns hourly time-series data for CPU, memory, request-rate, and response-time.",
)
async def timeseries(
    hours: int = Query(default=24, ge=1, le=168, description="Number of hourly data points to return"),
) -> JSONResponse:
    logger.debug("Timeseries called for %d hours.", hours)
    return JSONResponse(content=generate_timeseries(hours=hours))
