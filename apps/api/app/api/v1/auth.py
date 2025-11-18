from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime, timezone

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_refresh_token,
    verify_token,
    blacklist_token,
)
from app.core.config import settings
from app.db.session import get_db
from app.db.models import Employer, RefreshToken
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest, LogoutRequest
from app.core.employer import get_current_employer
from app.utils.rate_limit import check_rate_limit
import structlog

logger = structlog.get_logger(__name__)

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

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(employer.id), "employer_id": str(employer.id), "roles": ["employer_admin"]}
    )

    # Create and store refresh token
    refresh_token_plain = create_refresh_token()
    refresh_token_hash = hash_refresh_token(refresh_token_plain)

    refresh_token_db = RefreshToken(
        employer_id=employer.id,
        token_hash=refresh_token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token_db)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_plain,
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

    # Create and store refresh token
    refresh_token_plain = create_refresh_token()
    refresh_token_hash = hash_refresh_token(refresh_token_plain)

    refresh_token_db = RefreshToken(
        employer_id=employer.id,
        token_hash=refresh_token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(refresh_token_db)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_plain,
        token_type="bearer",
        employer_id=str(employer.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token.

    This endpoint provides token rotation for enhanced security:
    - Validates the provided refresh token
    - Issues a new access token
    - Issues a new refresh token (rotation)
    - Revokes the old refresh token
    """
    # Find all non-expired, non-revoked refresh tokens for verification
    now = datetime.utcnow()
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.expires_at > now,
            RefreshToken.revoked == 0
        )
    )
    all_tokens = result.scalars().all()

    # Find the token that matches the provided refresh token
    refresh_token_db = None
    for token in all_tokens:
        if verify_refresh_token(data.refresh_token, token.token_hash):
            refresh_token_db = token
            break

    if not refresh_token_db:
        logger.warning("Invalid refresh token provided", employer_id=refresh_token_db.employer_id if refresh_token_db else None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Get employer
    result = await db.execute(
        select(Employer).where(Employer.id == refresh_token_db.employer_id)
    )
    employer = result.scalar_one_or_none()

    if not employer:
        logger.warning("Refresh token for non-existent employer", employer_id=refresh_token_db.employer_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Employer not found",
        )

    logger.info("Refresh token successfully validated", employer_id=str(employer.id), email=employer.email)

    # Create new access token
    access_token = create_access_token(
        data={"sub": str(employer.id), "employer_id": str(employer.id), "roles": ["employer_admin"]}
    )

    # Rotate refresh token for security (optional but recommended)
    new_refresh_token_plain = create_refresh_token()
    new_refresh_token_hash = hash_refresh_token(new_refresh_token_plain)

    # Revoke old token and create new one
    refresh_token_db.revoked = 1

    new_refresh_token_db = RefreshToken(
        employer_id=employer.id,
        token_hash=new_refresh_token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
    )

    db.add(new_refresh_token_db)
    await db.commit()

    # Update last used timestamp for old token
    refresh_token_db.last_used_at = datetime.utcnow()
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token_plain,
        token_type="bearer",
        employer_id=str(employer.id),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    logout_data: LogoutRequest = None,  # Optional body for future extensions
    employer: Employer = Depends(get_current_employer),
):
    """
    Logout by blacklisting the current access token.

    This prevents the token from being used again until it expires.
    Refresh tokens remain valid until they expire or are explicitly revoked.
    """
    # Extract token from Authorization header
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = auth_header[7:]  # Remove "Bearer " prefix

    # Verify token and extract JTI for blacklisting
    is_valid, payload, error_message = verify_token(token)
    if not is_valid or payload is None:
        # Token is already invalid, but we'll still return success
        logger.info("Logout attempted with invalid token", employer_id=str(employer.id))
        return

    jti = payload.get("jti")
    if jti:
        blacklist_token(jti)
        logger.info("Token successfully blacklisted", employer_id=str(employer.id), jti=jti)
    else:
        logger.warning("Token missing JTI claim during logout", employer_id=str(employer.id))

    # Note: In production, you might also want to revoke associated refresh tokens

