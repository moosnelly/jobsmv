from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

from app.core.security import verify_token
from app.db.session import AsyncSession, get_db
from app.db.models import Employer

logger = structlog.get_logger(__name__)

security = HTTPBearer()


async def get_current_employer(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Employer:
    """Get the current employer from JWT token."""
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    employer_id = payload.get("employer_id")
    if not employer_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing employer_id claim",
        )

    # Fetch employer from database
    from sqlalchemy import select

    result = await db.execute(select(Employer).where(Employer.id == employer_id))
    employer = result.scalar_one_or_none()

    if employer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer not found",
        )

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

