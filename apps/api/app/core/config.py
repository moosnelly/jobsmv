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

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def convert_database_url(cls, v: str) -> str:
        """Convert postgresql:// to postgresql+asyncpg:// for async support."""
        if v and v.startswith("postgresql://"):
            url = v.replace("postgresql://", "postgresql+asyncpg://", 1)
            # asyncpg doesn't support sslmode parameter, remove it while preserving other params
            # SSL is negotiated automatically by asyncpg
            import re
            url = re.sub(r'[?&]sslmode=[^&]*', '', url)
            # Clean up any double & or trailing ?
            url = re.sub(r'\?&', '?', url)
            url = re.sub(r'\?$', '', url)
            return url
        return v

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

    # JWT Configuration
    # WARNING: JWT keys should NEVER be committed to version control
    # Use environment variables JWKS_PRIVATE_KEY_PATH and JWKS_PUBLIC_KEY_PATH
    # to specify secure key locations in production
    JWT_AUD: str = "jobsmv-api"
    JWT_ISS: str = "jobsmv-auth"
    JWT_ALGORITHM: str = "RS256"

    # JWT Key Paths - Can be overridden via environment variables
    # In production, use secure key management services (AWS KMS, HashiCorp Vault, etc.)
    # Default paths are relative to project root, keys auto-generate if missing
    JWKS_PRIVATE_KEY_PATH: str = "apps/api/keys/jwt-private.pem"  # File permissions: 600
    JWKS_PUBLIC_KEY_PATH: str = "apps/api/keys/jwt-public.pem"    # File permissions: 644
    JWKS_KID: str = "jobsmv-key-1"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

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

