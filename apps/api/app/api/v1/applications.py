from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.employer import get_current_employer
from app.db.session import get_db
from app.db.models import Application, Job, Employer
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.schemas.common import CursorPage
from app.utils.pagination import get_cursor_paginated_results
from app.utils.rate_limit import check_rate_limit

router = APIRouter()


async def create_public_application(
    job_id: uuid.UUID,
    data: ApplicationCreate,
    request: Request,
    db: AsyncSession,
) -> ApplicationResponse:
    """Create an application for a job (public endpoint)."""
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    allowed, _ = await check_rate_limit(f"apply:{client_ip}", limit=5, window_seconds=300)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many application attempts",
        )

    # Verify job exists and is published
    result = await db.execute(
        select(Job).where(and_(Job.id == job_id, Job.status == "published"))
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not published",
        )

    # Create application
    application = Application(
        employer_id=job.employer_id,
        job_id=job_id,
        applicant_name=data.applicant_name,
        applicant_email=data.applicant_email,
        resume_url=data.resume_url,
        cover_letter_md=data.cover_letter_md,
        status="new",
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    return ApplicationResponse.model_validate(application)


@router.get("/jobs/{job_id}/applications", response_model=CursorPage[ApplicationResponse])
async def list_job_applications(
    job_id: uuid.UUID,
    cursor: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """List applications for a job."""
    # Verify job belongs to employer
    job_result = await db.execute(
        select(Job).where(and_(Job.id == job_id, Job.employer_id == employer.id))
    )
    job = job_result.scalar_one_or_none()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    query = select(Application).where(Application.job_id == job_id)

    if status_filter:
        query = query.where(Application.status == status_filter)

    # Apply ordering
    query = query.order_by(Application.created_at.desc())

    # Cursor pagination
    applications, next_cursor = await get_cursor_paginated_results(
        db=db,
        query=query,
        cursor=cursor,
        page_size=20,
        id_field=Application.id,
    )

    items = [ApplicationResponse.model_validate(app) for app in applications]

    return CursorPage(items=items, next_cursor=next_cursor)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: uuid.UUID,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Get an application by ID."""
    result = await db.execute(
        select(Application).where(
            and_(Application.id == application_id, Application.employer_id == employer.id)
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    return ApplicationResponse.model_validate(application)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: uuid.UUID,
    data: ApplicationUpdate,
    employer: Employer = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db),
):
    """Update an application."""
    result = await db.execute(
        select(Application).where(
            and_(Application.id == application_id, Application.employer_id == employer.id)
        )
    )
    application = result.scalar_one_or_none()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Update fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(application, key, value)

    await db.commit()
    await db.refresh(application)

    return ApplicationResponse.model_validate(application)

