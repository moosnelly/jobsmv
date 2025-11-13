from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.employer import get_current_employer
from app.db.session import get_db
from app.db.models import Employer
from app.schemas.employer import EmployerResponse

router = APIRouter()


@router.get("/me", response_model=EmployerResponse)
async def get_current_employer_info(
    employer: Employer = Depends(get_current_employer),
):
    """Get current employer information."""
    return EmployerResponse.model_validate(employer)

