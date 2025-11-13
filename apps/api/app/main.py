import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import structlog

from app.core.config import settings
from app.core.logging import setup_logging
from app.db.session import init_db
from app.api.v1 import auth, employers, jobs, categories, public, health, jwks
from app.api.v1.applications import router as applications_router

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting application", version=settings.APP_VERSION)
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down application")


app = FastAPI(
    title="JobSMV API",
    description="Multi-employer job listing platform API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Setup logging
setup_logging()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(jwks.router, prefix="/api/v1", tags=["jwks"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(public.router, prefix="/api/v1/public", tags=["public"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(employers.router, prefix="/api/v1/employers", tags=["employers"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(
    applications_router, prefix="/api/v1/applications", tags=["applications"]
)


@app.get("/")
async def root():
    return {"message": "JobSMV API", "version": settings.APP_VERSION}

