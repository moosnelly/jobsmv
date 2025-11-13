from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
import uuid


class ApplicationBase(BaseModel):
    applicant_name: str
    applicant_email: EmailStr
    resume_url: Optional[str] = None
    cover_letter_md: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ApplicationCreate(ApplicationBase):
    job_id: uuid.UUID


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ApplicationResponse(ApplicationBase):
    id: uuid.UUID
    employer_id: uuid.UUID
    job_id: uuid.UUID
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="forbid", from_attributes=True)

