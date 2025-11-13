from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
import uuid


class EmployerBase(BaseModel):
    company_name: str
    email: EmailStr
    contact_info: Optional[dict] = None

    model_config = ConfigDict(extra="forbid")


class EmployerCreate(EmployerBase):
    password: str


class EmployerUpdate(BaseModel):
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_info: Optional[dict] = None

    model_config = ConfigDict(extra="forbid")


class EmployerResponse(EmployerBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(extra="forbid", from_attributes=True)

