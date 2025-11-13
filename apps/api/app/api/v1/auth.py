from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.db.session import get_db
from app.db.models import Employer
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.utils.rate_limit import check_rate_limit

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Register a new employer account."""
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    allowed, _ = await check_rate_limit(f"register:{client_ip}", limit=5, window_seconds=300)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts",
        )

    # Check if email already exists
    result = await db.execute(select(Employer).where(Employer.email == data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create employer
    employer = Employer(
        company_name=data.company_name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        contact_info=data.contact_info,
    )
    db.add(employer)
    await db.commit()
    await db.refresh(employer)

    # Create access token
    access_token = create_access_token(
        data={"sub": str(employer.id), "employer_id": str(employer.id), "roles": ["employer_admin"]}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        employer_id=str(employer.id),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Login and get access token."""
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    allowed, _ = await check_rate_limit(f"login:{client_ip}", limit=10, window_seconds=60)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts",
        )

    # Find employer
    result = await db.execute(select(Employer).where(Employer.email == data.email))
    employer = result.scalar_one_or_none()

    if not employer or not verify_password(data.password, employer.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": str(employer.id), "employer_id": str(employer.id), "roles": ["employer_admin"]}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        employer_id=str(employer.id),
    )

