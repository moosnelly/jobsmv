from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_VERSION: str = "1.0.0"
    APP_NAME: str = "JobSMV API"

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS - parse from comma-separated string or JSON
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return ["http://localhost:3000"]

    # JWT
    JWT_AUD: str = "jobsmv-api"
    JWT_ISS: str = "jobsmv-auth"
    JWT_ALGORITHM: str = "RS256"
    JWKS_PRIVATE_KEY_PATH: str = "/app/keys/jwt-private.pem"
    JWKS_PUBLIC_KEY_PATH: str = "/app/keys/jwt-public.pem"
    JWKS_KID: str = "jobsmv-key-1"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    # Security
    SECRET_KEY: str = "change-me-in-production"
    BCRYPT_ROUNDS: int = 12

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()

