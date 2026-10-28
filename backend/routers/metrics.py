"""routers/metrics.py — GET /api/metrics  &  GET /api/metrics/timeseries"""

import logging
import os
from datetime import datetime, timedelta, timezone
from backend.monitoring.request_metrics import request_metrics
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from backend.data.mock_data import generate_current_metrics, generate_timeseries
from backend.models.schemas import MetricsResponse, TimeseriesResponse
import boto3
def get_real_cpu_utilization() -> float:
    """Fetch the latest EC2 CPU utilization from AWS CloudWatch."""

    region = os.getenv("AWS_REGION", "ap-southeast-2")
    instance_id = os.getenv("EC2_INSTANCE_ID")

    if not instance_id:
        raise RuntimeError("EC2_INSTANCE_ID environment variable is not set.")

    # Use the local AWS profile if configured.
    # On EC2, Boto3 can use the attached IAM role automatically.
    profile = os.getenv("AWS_PROFILE")

    if profile:
        session = boto3.Session(
            profile_name=profile,
            region_name=region,
        )
    else:
        session = boto3.Session(region_name=region)

    cloudwatch = session.client("cloudwatch")

    now = datetime.now(timezone.utc)

    response = cloudwatch.get_metric_statistics(
        Namespace="AWS/EC2",
        MetricName="CPUUtilization",
        Dimensions=[
            {
                "Name": "InstanceId",
                "Value": instance_id,
            }
        ],
        StartTime=now - timedelta(hours=1),
        EndTime=now,
        Period=300,
        Statistics=["Average"],
    )

    datapoints = response.get("Datapoints", [])

    if not datapoints:
        raise RuntimeError(
            "No EC2 CPU metrics found in CloudWatch for the last hour."
        )

    latest = max(datapoints, key=lambda point: point["Timestamp"])

    return round(float(latest["Average"]), 2)
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

    metrics = generate_current_metrics()

    # Real CPU utilization from AWS CloudWatch.
    metrics["cpu_utilization"] = get_real_cpu_utilization()

    # Real request statistics from our middleware.
    metrics.update(request_metrics.snapshot())

    return JSONResponse(content=metrics)

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
