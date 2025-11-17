from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator
from enum import Enum
import uuid


class SupportedCurrency(str, Enum):
    MVR = "MVR"
    USD = "USD"


class JobSalaryBase(BaseModel):
    currency: SupportedCurrency
    amount_min: Optional[float] = None
    amount_max: Optional[float] = None

    @field_validator("amount_min", "amount_max")
    @classmethod
    def validate_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError("Amount must be non-negative")
        return v

    @field_validator("amount_max")
    @classmethod
    def validate_amount_range(cls, v, info):
        if v is not None and info.data.get("amount_min") is not None:
            if v < info.data["amount_min"]:
                raise ValueError("amount_max must be greater than or equal to amount_min")
        return v


class JobSalaryCreate(JobSalaryBase):
    pass


class JobSalaryResponse(JobSalaryBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobBase(BaseModel):
    title: str
    description_md: str
    requirements_md: Optional[str] = None
    location: Optional[str] = None
    is_salary_public: bool = True
    salaries: List[JobSalaryCreate] = []
    tags: Optional[list[str]] = None

    model_config = ConfigDict(extra="forbid")


class JobCreate(JobBase):
    category_ids: Optional[list[uuid.UUID]] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description_md: Optional[str] = None
    requirements_md: Optional[str] = None
    location: Optional[str] = None
    is_salary_public: Optional[bool] = None
    salaries: Optional[List[JobSalaryCreate]] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None
    category_ids: Optional[list[uuid.UUID]] = None

    model_config = ConfigDict(extra="forbid")


class JobResponse(JobBase):
    id: uuid.UUID
    employer_id: uuid.UUID
    employer_company_name: Optional[str] = None
    status: str
    categories: Optional[list[str]] = None
    salaries: List[JobSalaryResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="forbid", from_attributes=True)


class JobPublicResponse(BaseModel):
    id: uuid.UUID
    employer_id: uuid.UUID
    employer_company_name: Optional[str] = None
    title: str
    description_md: str
    requirements_md: Optional[str] = None
    location: Optional[str] = None
    is_salary_public: bool
    salary_hidden: Optional[bool] = None
    salaries: List[JobSalaryResponse] = []
    status: str
    categories: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="forbid", from_attributes=True)

