from typing import Optional
import redis.asyncio as redis
import structlog
from datetime import timedelta

from app.core.config import settings

logger = structlog.get_logger(__name__)


async def check_rate_limit(
    identifier: str, limit: int = 100, window_seconds: int = 60
) -> tuple[bool, int]:
    """
    Check rate limit using sliding window log algorithm.
    Returns (is_allowed, remaining_requests).
    """
    r = await get_redis()
    key = f"rate_limit:{identifier}"
    now = timedelta(seconds=window_seconds)

    # Remove old entries
    await r.zremrangebyscore(key, 0, f"-{window_seconds}")

    # Count current requests
    current = await r.zcard(key)

    if current >= limit:
        return False, 0

    # Add current request
    await r.zadd(key, {str(now.total_seconds()): now.total_seconds()})
    await r.expire(key, window_seconds)

    remaining = limit - current - 1
    return True, remaining

