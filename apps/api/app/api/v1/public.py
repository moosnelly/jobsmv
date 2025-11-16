from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.session import get_db
from app.db.models import Job, Category, JobCategory, Employer
from sqlalchemy.orm import selectinload
from app.schemas.job import JobResponse
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.schemas.common import CursorPage
from app.utils.pagination import get_cursor_paginated_results

router = APIRouter()


@router.get("/jobs", response_model=CursorPage[JobResponse])
async def list_public_jobs(
    cursor: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all published jobs (public endpoint)."""
    query = select(Job).options(selectinload(Job.employer)).where(Job.status == "published")

    if q:
        query = query.where(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.description_md.ilike(f"%{q}%"),
            )
        )

    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))

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


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_public_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a published job by ID (public endpoint)."""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.employer))
        .where(and_(Job.id == job_id, Job.status == "published"))
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
    
    # Set employer company name for response
    if job.employer:
        job.employer_company_name = job.employer.company_name

    return JobResponse.model_validate(job)


@router.post("/jobs/{job_id}/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: uuid.UUID,
    data: ApplicationCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Apply to a job (public endpoint)."""
    from app.api.v1.applications import create_public_application
    # Override job_id from path parameter (ignore job_id in request body for security)
    application_data = ApplicationCreate(
        applicant_name=data.applicant_name,
        applicant_email=data.applicant_email,
        resume_url=data.resume_url,
        cover_letter_md=data.cover_letter_md,
        job_id=job_id,
    )
    return await create_public_application(job_id, application_data, request, db)

