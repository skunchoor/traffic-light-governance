import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App info
    APP_NAME: str = "Traffic Light Governance API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    # Default to /tmp directory if running inside Vercel serverless (read-only filesystem except /tmp)
    _default_db: str = "sqlite+aiosqlite:////tmp/backend_data.db" if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") else "sqlite+aiosqlite:///./backend_data.db"
    DATABASE_URL: str = os.getenv("TURSO_DATABASE_URL", _default_db)
    TURSO_AUTH_TOKEN: str = os.getenv("TURSO_AUTH_TOKEN", "")

    # Authentication
    BACKEND_API_KEYS: str = os.getenv("BACKEND_API_KEY", "tlg_dev_secret_key_12345")

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://*.github.io",
        "https://*.vercel.app",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def api_keys_list(self) -> List[str]:
        return [k.strip() for k in self.BACKEND_API_KEYS.split(",") if k.strip()]


settings = Settings()
