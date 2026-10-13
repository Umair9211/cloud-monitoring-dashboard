"""
config.py — Application settings sourced from environment variables.
"""
import os
from typing import List


class Settings:
    app_name: str
    app_version: str
    environment: str
    cors_origins: List[str]

    def __init__(self) -> None:
        self.app_name = "Cloud Monitoring Dashboard"
        self.app_version = os.getenv("APP_VERSION", "2.0.0")
        self.environment = os.getenv("APP_ENV", "development")
        raw = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://localhost:4173",
        )
        self.cors_origins = [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()
