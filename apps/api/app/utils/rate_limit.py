from typing import Optional
import redis.asyncio as redis
import structlog
import time

from app.core.config import settings
from app.utils.idempotency import get_redis

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
    now = time.time()
    window_start = now - window_seconds

    try:
        # Remove old entries (older than window_seconds ago)
        await r.zremrangebyscore(key, "-inf", window_start)

        # Count current requests in the window
        current = await r.zcard(key)

        if current >= limit:
            return False, 0

        # Add current request with current timestamp as score
        await r.zadd(key, {str(now): now})
        await r.expire(key, window_seconds)

        remaining = limit - current - 1
        return True, remaining
    except Exception as e:
        logger.error("Rate limit check failed", error=str(e), identifier=identifier)
        # Fail open - allow request if Redis is unavailable
        return True, limit

