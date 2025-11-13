from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Category
from app.schemas.category import CategoryResponse
from app.schemas.common import CursorPage

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """List all categories."""
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(cat) for cat in categories]

