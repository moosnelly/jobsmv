from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.employer import get_current_employer
from app.db.session import get_db
from app.db.models import Employer
from app.schemas.employer import EmployerResponse, EmployerUpdate

router = APIRouter()


@router.get("/me", response_model=EmployerResponse)
async def get_current_employer_info(
    employer: Employer = Depends(get_current_employer),
):
    """Get current employer information."""
    return EmployerResponse.model_validate(employer)


@router.patch("/me", response_model=EmployerResponse)
async def update_current_employer(
    data: EmployerUpdate,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Update current employer information."""
    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employer, key, value)

    await db.commit()
    await db.refresh(employer)

    return EmployerResponse.model_validate(employer)

