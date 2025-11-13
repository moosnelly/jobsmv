import hashlib
import json
from typing import Optional
import redis.asyncio as redis
import structlog

from app.core.config import settings

logger = structlog.get_logger(__name__)

redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """Get Redis client instance."""
    global redis_client
    if redis_client is None:
        redis_client = await redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def check_idempotency_key(
    key: str, employer_id: str
) -> Optional[tuple[int, dict]]:
    """Check if idempotency key exists and return cached response."""
    r = await get_redis()
    cache_key = f"idempotency:{employer_id}:{key}"
    cached = await r.get(cache_key)
    if cached:
        data = json.loads(cached)
        return data.get("status_code"), data.get("response")
    return None


async def store_idempotency_key(
    key: str, employer_id: str, status_code: int, response: dict, ttl: int = 3600
) -> None:
    """Store idempotency key with response."""
    r = await get_redis()
    cache_key = f"idempotency:{employer_id}:{key}"
    data = json.dumps({"status_code": status_code, "response": response})
    await r.setex(cache_key, ttl, data)

