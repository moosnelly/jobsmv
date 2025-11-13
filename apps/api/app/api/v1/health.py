from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

router = APIRouter()


@router.get("/livez")
async def liveness():
    """Liveness probe endpoint."""
    return {"status": "alive"}


@router.get("/readyz")
async def readiness(db: AsyncSession = Depends(get_db)):
    """Readiness probe endpoint."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception:
        return {"status": "not ready"}, 503


@router.get("/healthz")
async def health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}, 503

