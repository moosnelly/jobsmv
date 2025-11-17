from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

from app.core.security import verify_token, blacklist_token
from app.db.session import AsyncSession, get_db
from app.db.models import Employer

logger = structlog.get_logger(__name__)

security = HTTPBearer()


async def get_current_employer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Employer:
    """Get the current employer from JWT token with enhanced validation."""
    token = credentials.credentials
    is_valid, payload, error_message = verify_token(token)

    if not is_valid or payload is None:
        error_detail = error_message or "Invalid authentication credentials"
        logger.warning("JWT verification failed", error=error_detail, token_prefix=token[:20] + "...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

    employer_id = payload.get("employer_id")
    if not employer_id:
        logger.warning("JWT token missing employer_id claim", sub=payload.get("sub"))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing required employer_id claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate scopes/roles if present
    roles = payload.get("roles", [])
    if "employer_admin" not in roles:
        logger.warning("JWT token missing required role", employer_id=employer_id, roles=roles)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )

    # Fetch employer from database
    from sqlalchemy import select

    result = await db.execute(select(Employer).where(Employer.id == employer_id))
    employer = result.scalar_one_or_none()

    if employer is None:
        logger.warning("JWT token references non-existent employer", employer_id=employer_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Employer account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.debug("Employer authenticated successfully", employer_id=str(employer_id), email=employer.email)
    return employer


def require_roles(*allowed_roles: str):
    """Dependency factory for role-based access control."""
    async def role_checker(
        employer: Employer = Depends(get_current_employer),
    ) -> Employer:
        # For now, all authenticated employers have employer_admin role
        # In a full implementation, roles would be stored in the database
        return employer

    return role_checker

