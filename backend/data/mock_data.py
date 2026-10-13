"""
data/mock_data.py
-----------------
Generates realistic mock AWS CloudWatch-style metrics.
All generators are pure functions with controlled randomness so the data
looks plausible in charts without external dependencies.
"""

import random
from datetime import datetime, timedelta, timezone
from typing import Any

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _cpu(hour: int) -> float:
    """Simulate diurnal CPU pattern — peaks at midday business hours."""
    base = 18.0
    if 9 <= hour <= 17:
        peak = 1.0 - abs((hour - 13) / 8.0)
        base += 52.0 * peak
    elif 6 <= hour < 9:
        base += 15.0 * ((hour - 6) / 3.0)
    elif 17 < hour <= 21:
        base += 15.0 * ((21 - hour) / 4.0)
    return round(max(5.0, min(95.0, base + random.gauss(0, 3.0))), 1)


def _memory(hour: int) -> float:
    """Memory drifts upward through the day; drops at GC hours (4, 8, 12 …)."""
    base = 48.0 + (hour / 24.0) * 18.0
    gc_drop = -9.0 if hour % 4 == 0 else 0.0
    return round(max(30.0, min(92.0, base + gc_drop + random.gauss(0, 1.5))), 1)


def _requests(hour: int) -> int:
    """Request rate (req/min) follows business-hours pattern."""
    if hour <= 5:
        return random.randint(10, 35)
    if 6 <= hour <= 8:
        return random.randint(55, 115)
    if 9 <= hour <= 11:
        return random.randint(175, 280)
    if 12 <= hour <= 13:
        return random.randint(220, 330)
    if 14 <= hour <= 17:
        return random.randint(155, 265)
    if 18 <= hour <= 20:
        return random.randint(75, 145)
    return random.randint(25, 65)


def _response_time(cpu: float, reqs: int) -> float:
    base = 75.0 + (cpu / 100.0) * 160.0 + (reqs / 300.0) * 90.0
    return round(max(40.0, min(2500.0, base + random.gauss(0, 12.0))), 1)


# ──────────────────────────────────────────────────────────────────────────────
# Public generators
# ──────────────────────────────────────────────────────────────────────────────

def generate_timeseries(hours: int = 24) -> dict[str, Any]:
    now = datetime.now(tz=timezone.utc)
    labels, cpu_d, mem_d, req_d, resp_d = [], [], [], [], []

    for i in range(hours):
        ts = now - timedelta(hours=(hours - 1 - i))
        h = ts.hour
        c = _cpu(h)
        m = _memory(h)
        r = _requests(h)
        rt = _response_time(c, r)

        labels.append(ts.strftime("%H:%M"))
        cpu_d.append(c)
        mem_d.append(m)
        req_d.append(r)
        resp_d.append(rt)

    return {
        "labels": labels,
        "cpu": cpu_d,
        "memory": mem_d,
        "requests": req_d,
        "response_time": resp_d,
    }


def generate_current_metrics() -> dict[str, Any]:
    now = datetime.now(tz=timezone.utc)
    h = now.hour
    cpu = _cpu(h)
    mem = _memory(h)
    reqs = _requests(h)
    resp = _response_time(cpu, reqs)
    total = 127_840 + random.randint(-800, 3_000)
    error_rate = round(random.uniform(0.15, 2.8), 2)

    return {
        "cpu_utilization": cpu,
        "memory_usage": mem,
        "request_rate": reqs,
        "avg_response_time_ms": resp,
        "error_rate": error_rate,
        "total_requests": total,
        "failed_requests": int(total * error_rate / 100),
        "timestamp": now.isoformat(),
    }


# ──────────────────────────────────────────────────────────────────────────────
# Static datasets (with runtime jitter applied in generators below)
# ──────────────────────────────────────────────────────────────────────────────

_SERVICES: list[dict[str, Any]] = [
    {"id": "svc_001", "name": "API Gateway",       "type": "AWS API Gateway",    "region": "us-east-1", "status": "healthy",  "latency_ms": 42,   "uptime_percent": 99.97},
    {"id": "svc_002", "name": "Auth Service",       "type": "ECS Fargate",        "region": "us-east-1", "status": "healthy",  "latency_ms": 78,   "uptime_percent": 99.91},
    {"id": "svc_003", "name": "Data Processor",     "type": "Lambda",             "region": "us-east-1", "status": "degraded", "latency_ms": 1240, "uptime_percent": 98.5},
    {"id": "svc_004", "name": "Cache Layer",        "type": "ElastiCache Redis",  "region": "us-east-1", "status": "healthy",  "latency_ms": 3,    "uptime_percent": 99.99},
    {"id": "svc_005", "name": "Message Queue",      "type": "Amazon SQS",         "region": "us-east-1", "status": "healthy",  "latency_ms": 18,   "uptime_percent": 99.95},
    {"id": "svc_006", "name": "Primary Database",   "type": "RDS PostgreSQL",     "region": "us-east-1", "status": "healthy",  "latency_ms": 12,   "uptime_percent": 99.98},
    {"id": "svc_007", "name": "Object Storage",     "type": "Amazon S3",          "region": "us-east-1", "status": "healthy",  "latency_ms": 55,   "uptime_percent": 100.0},
    {"id": "svc_008", "name": "Search Engine",      "type": "OpenSearch",         "region": "us-east-1", "status": "offline",  "latency_ms": 0,    "uptime_percent": 95.2},
    {"id": "svc_009", "name": "CDN",                "type": "CloudFront",         "region": "global",    "status": "healthy",  "latency_ms": 8,    "uptime_percent": 99.99},
    {"id": "svc_010", "name": "Load Balancer",      "type": "ALB",                "region": "us-east-1", "status": "healthy",  "latency_ms": 4,    "uptime_percent": 100.0},
]

_ERRORS: list[dict[str, Any]] = [
    {"id": "err_001", "level": "CRITICAL", "service": "Search Engine",    "message": "Service unavailable: all OpenSearch nodes unreachable",                  "count": 1,   "ago_last": 8,   "ago_first": 95},
    {"id": "err_002", "level": "ERROR",    "service": "Data Processor",   "message": "Lambda execution timeout exceeded 15 s cold-start limit",                "count": 12,  "ago_last": 4,   "ago_first": 130},
    {"id": "err_003", "level": "ERROR",    "service": "Search Engine",    "message": "Connection refused: OpenSearch cluster health is yellow",                 "count": 234, "ago_last": 2,   "ago_first": 92},
    {"id": "err_004", "level": "ERROR",    "service": "Auth Service",     "message": "JWT validation failure: certificate rotation mismatch detected",          "count": 5,   "ago_last": 22,  "ago_first": 78},
    {"id": "err_005", "level": "WARNING",  "service": "API Gateway",      "message": "Throttling: rate limit exceeded for /api/v2/ingest (429 responses)",      "count": 47,  "ago_last": 1,   "ago_first": 55},
    {"id": "err_006", "level": "WARNING",  "service": "Primary Database", "message": "Slow query: SELECT on orders table exceeded 2 000 ms execution time",     "count": 8,   "ago_last": 14,  "ago_first": 200},
    {"id": "err_007", "level": "WARNING",  "service": "Cache Layer",      "message": "Cache eviction rate elevated: 12 % above rolling-average baseline",       "count": 3,   "ago_last": 40,  "ago_first": 320},
    {"id": "err_008", "level": "INFO",     "service": "Load Balancer",    "message": "Health check failed for instance i-0abc123 (replaced by ASG)",            "count": 1,   "ago_last": 72,  "ago_first": 90},
]

_ACTIVITIES: list[dict[str, Any]] = [
    {"id": "act_001", "type": "deployment", "title": "New deployment completed",       "description": "v2.4.1 → production (API Gateway, Auth Service, Data Processor)",  "actor": "GitHub Actions",          "ago": 15},
    {"id": "act_002", "type": "alert",      "title": "Alert: OpenSearch cluster down", "description": "Search Engine went offline — PagerDuty incident #4821 opened",       "actor": "CloudWatch Alarms",       "ago": 32},
    {"id": "act_003", "type": "scale",      "title": "Auto-scaling triggered",          "description": "ECS task count scaled 4 → 8 (CPU > 75 % threshold breached)",        "actor": "Auto Scaling Group",      "ago": 58},
    {"id": "act_004", "type": "deployment", "title": "Database migration applied",      "description": "RDS schema v45 applied successfully with zero-downtime blue/green",  "actor": "Flyway / CI Pipeline",    "ago": 95},
    {"id": "act_005", "type": "security",   "title": "SSL certificate renewed",         "description": "Wildcard *.Cloud.io renewed for 365 days via ACM",                "actor": "AWS Certificate Manager", "ago": 142},
    {"id": "act_006", "type": "info",       "title": "Daily backup completed",          "description": "RDS snapshot finished — 847 GB archived to S3 Glacier IR",           "actor": "AWS Backup",              "ago": 210},
    {"id": "act_007", "type": "alert",      "title": "Alert resolved: Lambda timeouts", "description": "Data Processor timeout rate returned to normal baseline (< 0.1 %)", "actor": "CloudWatch Alarms",       "ago": 285},
    {"id": "act_008", "type": "scale",      "title": "Scale-in completed",              "description": "ECS task count scaled 8 → 4 as load subsided below 40 % CPU",        "actor": "Auto Scaling Group",      "ago": 360},
]


def generate_services() -> list[dict[str, Any]]:
    now = datetime.now(tz=timezone.utc)
    result = []
    for s in _SERVICES:
        svc = s.copy()
        if svc["status"] != "offline":
            svc["latency_ms"] = max(1, svc["latency_ms"] + random.randint(-5, 12))
        svc["last_checked"] = now.isoformat()
        result.append(svc)
    return result


def generate_errors() -> list[dict[str, Any]]:
    now = datetime.now(tz=timezone.utc)
    result = []
    for e in _ERRORS:
        err = {k: v for k, v in e.items() if k not in ("ago_last", "ago_first")}
        err["last_seen"] = (now - timedelta(minutes=e["ago_last"])).isoformat()
        err["first_seen"] = (now - timedelta(minutes=e["ago_first"])).isoformat()
        result.append(err)
    return result


def generate_activity() -> list[dict[str, Any]]:
    now = datetime.now(tz=timezone.utc)
    result = []
    for a in _ACTIVITIES:
        act = {k: v for k, v in a.items() if k != "ago"}
        act["timestamp"] = (now - timedelta(minutes=a["ago"])).isoformat()
        act["minutes_ago"] = a["ago"]
        result.append(act)
    return result
