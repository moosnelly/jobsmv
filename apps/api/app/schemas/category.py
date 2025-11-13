from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: uuid.UUID

    model_config = ConfigDict(extra="forbid", from_attributes=True)

