from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
import uuid


class JobBase(BaseModel):
    title: str
    description_md: str
    requirements_md: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    tags: Optional[list[str]] = None

    model_config = ConfigDict(extra="forbid")


class JobCreate(JobBase):
    category_ids: Optional[list[uuid.UUID]] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description_md: Optional[str] = None
    requirements_md: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None
    category_ids: Optional[list[uuid.UUID]] = None

    model_config = ConfigDict(extra="forbid")


class JobResponse(JobBase):
    id: uuid.UUID
    employer_id: uuid.UUID
    status: str
    categories: Optional[list[str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="forbid", from_attributes=True)

