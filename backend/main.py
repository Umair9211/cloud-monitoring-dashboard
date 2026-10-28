"""
main.py — Cloud Monitoring Dashboard API (v2)

Run:  uvicorn backend.main:app --reload --port 8000
"""

import logging
import logging.config
import time
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.config import settings
from backend.routers import errors as errors_router
from backend.routers import health, metrics, services

# ── Logging ──────────────────────────────────────────────────────────────────

LOGGING_CONFIG: dict[str, Any] = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        }
    },
    "root": {"level": "INFO", "handlers": ["console"]},
    "loggers": {
        "Cloud": {"level": "DEBUG", "handlers": ["console"], "propagate": False},
        "uvicorn.access": {"level": "WARNING", "handlers": ["console"], "propagate": False},
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("Cloud.main")

# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info(
        "Starting %s v%s [env=%s]",
        settings.app_name,
        settings.app_version,
        settings.environment,
    )
    yield
    logger.info("Shutting down %s.", settings.app_name)


# ── Access-log middleware ─────────────────────────────────────────────────────

access_logger = logging.getLogger("Cloud.access")


async def _access_log_middleware(request: Request, call_next):
    from backend.monitoring.request_metrics import request_metrics

    start = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = round(
            (time.perf_counter() - start) * 1000, 2
        )

        if not request.url.path.startswith("/api/metrics"):
            request_metrics.record(500, elapsed_ms)

        raise

    elapsed_ms = round(
        (time.perf_counter() - start) * 1000, 2
    )

    # Don't count dashboard polling as normal application traffic.
    if not request.url.path.startswith("/api/metrics"):
        request_metrics.record(response.status_code, elapsed_ms)

    access_logger.info(
        "%s %s → %d (%.2f ms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )

    response.headers["X-Process-Time-Ms"] = str(elapsed_ms)

    return response

# ── Status → error code map ───────────────────────────────────────────────────

_STATUS_MAP: dict[int, str] = {
    400: "bad_request", 401: "unauthorized", 403: "forbidden",
    404: "not_found", 405: "method_not_allowed", 422: "unprocessable_entity",
    429: "too_many_requests", 500: "internal_server_error",
    502: "bad_gateway", 503: "service_unavailable",
}


def _code(status: int) -> str:
    return _STATUS_MAP.get(status, f"http_{status}")


# ── App factory ───────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "Production-style Cloud Monitoring Dashboard API. "
            "Exposes health, metrics, service-status, error-log, and activity-feed endpoints. "
            "Structured to consume real AWS CloudWatch data in production."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # CORS — allow the React dev server and any configured origins.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.middleware("http")(_access_log_middleware)

    # ── Exception handlers ────────────────────────────────────────────────────

    @app.exception_handler(StarletteHTTPException)
    async def http_exc_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        logger.warning("HTTP %d on %s %s — %s", exc.status_code, request.method, request.url.path, exc.detail)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": _code(exc.status_code), "detail": str(exc.detail), "status_code": exc.status_code},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exc_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.warning("Validation error on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=422,
            content={"error": "validation_error", "detail": exc.errors(), "status_code": 422},
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(health.router)
    app.include_router(metrics.router)
    app.include_router(services.router)
    app.include_router(errors_router.router)

    return app


app = create_app()
