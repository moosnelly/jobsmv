from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.employer import get_current_employer, require_roles
from app.db.session import get_db
from app.db.models import Job, Employer, Category, JobCategory
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.common import CursorPage
from app.utils.pagination import encode_cursor, decode_cursor

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
    query = select(Job).where(Job.employer_id == employer.id)

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

    # Cursor pagination
    if cursor:
        cursor_data = decode_cursor(cursor)
        if cursor_data and "last_id" in cursor_data:
            query = query.where(Job.id > uuid.UUID(cursor_data["last_id"]))

    query = query.order_by(Job.created_at.desc()).limit(21)

    result = await db.execute(query)
    jobs = result.scalars().all()

    # Load categories
    for job in jobs:
        cat_result = await db.execute(
            select(Category)
            .join(JobCategory)
            .where(JobCategory.job_id == job.id)
        )
        job.categories = [cat.name for cat in cat_result.scalars().all()]

    has_more = len(jobs) > 20
    items = [JobResponse.model_validate(job) for job in jobs[:20]]

    next_cursor = None
    if has_more and items:
        next_cursor = encode_cursor({"last_id": str(items[-1].id)})

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
    await db.refresh(job)

    # Load categories
    cat_result = await db.execute(
        select(Category)
        .join(JobCategory)
        .where(JobCategory.job_id == job.id)
    )
    job.categories = [cat.name for cat in cat_result.scalars().all()]

    return JobResponse.model_validate(job)


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Get a job by ID."""
    result = await db.execute(
        select(Job).where(and_(Job.id == job_id, Job.employer_id == employer.id))
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
        select(Job).where(and_(Job.id == job_id, Job.employer_id == employer.id))
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
    await db.refresh(job)

    # Load categories
    cat_result = await db.execute(
        select(Category)
        .join(JobCategory)
        .where(JobCategory.job_id == job.id)
    )
    job.categories = [cat.name for cat in cat_result.scalars().all()]

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

