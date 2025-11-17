from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import uuid

from app.core.employer import get_current_employer, require_roles
from app.db.session import get_db
from app.db.models import Job, Employer, Category, JobCategory
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.common import CursorPage
from app.utils.pagination import get_cursor_paginated_results

router = APIRouter()


@router.get("", response_model=CursorPage[JobResponse])
async def list_jobs(
    cursor: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """List jobs for the current employer."""
    query = select(Job).options(selectinload(Job.employer)).where(Job.employer_id == employer.id)

    if q:
        query = query.where(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.description_md.ilike(f"%{q}%"),
            )
        )

    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))

    if status:
        query = query.where(Job.status == status)

    # Apply ordering
    query = query.order_by(Job.created_at.desc())

    # Cursor pagination
    jobs, next_cursor = await get_cursor_paginated_results(
        db=db,
        query=query,
        cursor=cursor,
        page_size=20,
        id_field=Job.id,
    )

    # Load categories and set employer company name
    for job in jobs:
        cat_result = await db.execute(
            select(Category)
            .join(JobCategory)
            .where(JobCategory.job_id == job.id)
        )
        job.categories = [cat.name for cat in cat_result.scalars().all()]
        # Set employer company name for response
        if job.employer:
            job.employer_company_name = job.employer.company_name

    items = [JobResponse.model_validate(job) for job in jobs]

    return CursorPage(items=items, next_cursor=next_cursor)


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    data: JobCreate,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Create a new job."""
    job = Job(
        employer_id=employer.id,
        title=data.title,
        description_md=data.description_md,
        requirements_md=data.requirements_md,
        location=data.location,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        currency=data.currency,
        tags=data.tags,
        status="draft",
    )
    db.add(job)
    await db.flush()

    # Add categories
    if data.category_ids:
        for cat_id in data.category_ids:
            job_category = JobCategory(job_id=job.id, category_id=cat_id)
            db.add(job_category)

    await db.commit()
    await db.refresh(job, ["employer"])

    # Load categories
    cat_result = await db.execute(
        select(Category)
        .join(JobCategory)
        .where(JobCategory.job_id == job.id)
    )
    job.categories = [cat.name for cat in cat_result.scalars().all()]
    
    # Set employer company name for response
    if job.employer:
        job.employer_company_name = job.employer.company_name

    return JobResponse.model_validate(job)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Get a job by ID."""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.employer))
        .where(and_(Job.id == job_id, Job.employer_id == employer.id))
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Load categories
    cat_result = await db.execute(
        select(Category)
        .join(JobCategory)
        .where(JobCategory.job_id == job.id)
    )
    job.categories = [cat.name for cat in cat_result.scalars().all()]
    
    # Set employer company name for response (employer already loaded via selectinload)
    if job.employer:
        job.employer_company_name = job.employer.company_name

    return JobResponse.model_validate(job)


@router.patch("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: uuid.UUID,
    data: JobUpdate,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Update a job."""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.employer))
        .where(and_(Job.id == job_id, Job.employer_id == employer.id))
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True, exclude={"category_ids"})
    for key, value in update_data.items():
        setattr(job, key, value)

    # Update categories if provided
    if data.category_ids is not None:
        # Remove existing categories
        await db.execute(
            select(JobCategory).where(JobCategory.job_id == job.id)
        )
        # Add new categories
        for cat_id in data.category_ids:
            job_category = JobCategory(job_id=job.id, category_id=cat_id)
            db.add(job_category)

    await db.commit()
    await db.refresh(job, ["employer"])

    # Load categories
    cat_result = await db.execute(
        select(Category)
        .join(JobCategory)
        .where(JobCategory.job_id == job.id)
    )
    job.categories = [cat.name for cat in cat_result.scalars().all()]
    
    # Set employer company name for response (employer already loaded via selectinload)
    if job.employer:
        job.employer_company_name = job.employer.company_name

    return JobResponse.model_validate(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: uuid.UUID,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Delete a job."""
    result = await db.execute(
        select(Job).where(and_(Job.id == job_id, Job.employer_id == employer.id))
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    await db.delete(job)
    await db.commit()

