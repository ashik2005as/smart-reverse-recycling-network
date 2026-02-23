"""
Configuration and environment variables.
Copy .env.example to .env and update values.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/smartrecycling",
)

# Redis (for caching route optimisation results)
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# API
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
API_VERSION: str = "1.0.0"

# AI Model paths
BATTERY_MODEL_PATH: str = os.getenv("BATTERY_MODEL_PATH", "../ai_models/battery_health/weights/")
SOLAR_MODEL_PATH:   str = os.getenv("SOLAR_MODEL_PATH",   "../ai_models/solar_degradation/weights/")

# Feature flags
USE_MOCK_DATA: bool = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
