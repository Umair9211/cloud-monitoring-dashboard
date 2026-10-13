"""
models/schemas.py — Pydantic response schemas for every API endpoint.
"""

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


# ── /api/health ──────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = Field(..., description="'healthy' | 'degraded' | 'unhealthy'")
    timestamp: str = Field(..., description="ISO-8601 UTC timestamp")
    uptime_seconds: float
    version: str
    environment: str


# ── /api/metrics ──────────────────────────────────────────────────────────────

class MetricsResponse(BaseModel):
    cpu_utilization: float = Field(..., ge=0, le=100, description="CPU %")
    memory_usage: float = Field(..., ge=0, le=100, description="Memory %")
    request_rate: int = Field(..., ge=0, description="Requests per minute")
    avg_response_time_ms: float = Field(..., ge=0, description="Mean response time (ms)")
    error_rate: float = Field(..., ge=0, description="Error %")
    total_requests: int = Field(..., ge=0)
    failed_requests: int = Field(..., ge=0)
    timestamp: str


# ── /api/metrics/timeseries ───────────────────────────────────────────────────

class TimeseriesResponse(BaseModel):
    labels: List[str]
    cpu: List[float]
    memory: List[float]
    requests: List[int]
    response_time: List[float]


# ── /api/services ─────────────────────────────────────────────────────────────

class ServiceItem(BaseModel):
    id: str
    name: str
    type: str
    region: str
    status: str = Field(..., description="'healthy' | 'degraded' | 'offline'")
    latency_ms: int
    uptime_percent: float
    last_checked: str


class ServicesResponse(BaseModel):
    services: List[ServiceItem]
    total: int
    healthy: int
    degraded: int
    offline: int


# ── /api/errors ───────────────────────────────────────────────────────────────

class ErrorItem(BaseModel):
    id: str
    level: str = Field(..., description="'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO'")
    service: str
    message: str
    count: int
    first_seen: str
    last_seen: str


class ErrorsResponse(BaseModel):
    errors: List[ErrorItem]
    total: int


# ── /api/activity ─────────────────────────────────────────────────────────────

class ActivityItem(BaseModel):
    id: str
    type: str = Field(..., description="'deployment' | 'alert' | 'scale' | 'security' | 'info'")
    title: str
    description: str
    actor: str
    timestamp: str
    minutes_ago: int


class ActivityResponse(BaseModel):
    activities: List[ActivityItem]
    total: int


# ── Error envelope ────────────────────────────────────────────────────────────

class ErrorEnvelope(BaseModel):
    error: str
    detail: Any
    status_code: int
