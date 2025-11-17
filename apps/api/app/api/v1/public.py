from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.db.session import get_db
from app.db.models import Job, Category, JobCategory, Employer, JobSalary
from sqlalchemy.orm import selectinload
from app.schemas.job import JobResponse, JobPublicResponse
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.schemas.location import AtollResponse, LocationResponse
from app.schemas.common import CursorPage
from app.utils.pagination import get_cursor_paginated_results

router = APIRouter()


def job_to_public_response(job: Job) -> JobPublicResponse:
    """Convert a Job model to JobPublicResponse, respecting salary visibility."""
    salaries = []
    salary_hidden = None

    if job.is_salary_public:
        # Include salaries if public
        salaries = job.salaries if hasattr(job, 'salaries') else []
        salary_hidden = False
    else:
        # Hide salaries if not public
        salaries = []
        salary_hidden = True

    return JobPublicResponse(
        id=job.id,
        employer_id=job.employer_id,
        employer_company_name=getattr(job, 'employer_company_name', getattr(job.employer, 'company_name', None)),
        title=job.title,
        description_md=job.description_md,
        requirements_md=job.requirements_md,
        location=job.location,
        is_salary_public=job.is_salary_public,
        salary_hidden=salary_hidden,
        salaries=salaries,
        status=job.status,
        categories=getattr(job, 'categories', []),
        tags=job.tags,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )

# Maldives locations data - all 26 atolls with major inhabited islands
MALDIVES_LOCATIONS = [
    {
        "atoll": "Haa Alifu",
        "islands": ["Dhiddhoo", "Hoarafushi", "Ihavandhoo", "Maarandhoo", "Muraidhoo"]
    },
    {
        "atoll": "Haa Dhaalu",
        "islands": ["Kulhudhuffushi", "Neykurendhoo", "Nolhivaranfaru", "Kurumba", "Hanimaadhoo"]
    },
    {
        "atoll": "Shaviyani",
        "islands": ["Funadhoo", "Bileefahi", "Feeva", "Maroshi", "Lhaimagu"]
    },
    {
        "atoll": "Noonu",
        "islands": ["Manadhoo", "Lhoss", "Maafaru", "Magoodhoo", "Henbadhoo"]
    },
    {
        "atoll": "Raa",
        "islands": ["Ugoofaaru", "Alifushi", "Rasmaadhoo", "Kinolhas", "Vaadhoo"]
    },
    {
        "atoll": "Baa",
        "islands": ["Eydhafushi", "Thulhaadhoo", "Dharavandhoo", "Kihaadhoo", "Kamadhoo"]
    },
    {
        "atoll": "Lhaviyani",
        "islands": ["Naifaru", "Hinnavaru", "Kurumba", "Olhuvelifushi", "Maafilaafushi"]
    },
    {
        "atoll": "Kaafu",
        "islands": ["Male", "Hulhumale", "Thulusdhoo", "Maafushi", "Himmafushi"]
    },
    {
        "atoll": "Alifu Alifu",
        "islands": ["Rasdhukuramathi", "Maduvvari", "Feridhoo", "Maalhos", "Dhigurah"]
    },
    {
        "atoll": "Alifu Dhaalu",
        "islands": ["Mahibadhoo", "Kendhoo", "Dhiddhoo", "Rangali", "Omadhoo"]
    },
    {
        "atoll": "Vaavu",
        "islands": ["Felidhoo", "Thinadhoo", "Fulidhoo", "Keyodhoo"]
    },
    {
        "atoll": "Meemu",
        "islands": ["Mulaku", "Muli", "Kolhufushi", "Naalaafushi"]
    },
    {
        "atoll": "Faafu",
        "islands": ["Nilandhoo", "Dharanboodhoo", "Magoodhoo", "Kolamaafushi"]
    },
    {
        "atoll": "Dhaalu",
        "islands": ["Kudahuvadhoo", "Maaeboodhoo", "Meedhoo", "Rinbudhoo", "Hudhufushi"]
    },
    {
        "atoll": "Thaa",
        "islands": ["Veymandoo", "Buruni", "Thimarafushi", "Madifushi", "Guraidhoo"]
    },
    {
        "atoll": "Laamu",
        "islands": ["Fonadhoo", "Maabaidhoo", "Isdhoo", "Hithadhoo"]
    },
    {
        "atoll": "Gaafu Alifu",
        "islands": ["Vilingili", "Dhaandhoo", "Nilandhoo", "Rathafandhoo"]
    },
    {
        "atoll": "Gaafu Dhaalu",
        "islands": ["Thinadhoo", "Nadellaa", "Fares-Maathoda"]
    },
    {
        "atoll": "Gnaviyani (Fuvahmulah)",
        "islands": ["Fuvahmulah"]
    },
    {
        "atoll": "Seenu (Addu Atoll)",
        "islands": ["Hithadhoo", "Maradhoo", "Feydhoo", "Hulhudhoo", "Meedhoo"]
    },
    {
        "atoll": "Kolhumadulu",
        "islands": ["Hadhdhunmathi", "Thakandhoo", "Gaadhiffushi", "Maakurathu", "Finey"]
    },
    {
        "atoll": "Maalhosmadulu Uthuru",
        "islands": ["Himmafushi", "Naifaru", "Kurumba", "Dhiffushi"]
    },
    {
        "atoll": "Maalhosmadulu Dhekunu",
        "islands": ["Gulhi", "Maafushi", "Gaafaru", "Guraidhoo"]
    },
    {
        "atoll": "Matheerata",
        "islands": ["Makunudhoo", "Milaidhoo", "Naalaafushi"]
    },
    {
        "atoll": "Mulaku",
        "islands": ["Mulaku"]
    },
    {
        "atoll": "Nilandhe Atholhu Uthuru",
        "islands": ["Fohdhoo", "Maafaru", "Himmafushi"]
    },
    {
        "atoll": "Nilandhe Atholhu Dhekunu",
        "islands": ["Goidhoo", "Meedhoo", "Rakkeeboodhoo"]
    }
]


@router.get("/locations", response_model=LocationResponse)
async def get_locations():
    """Get all Maldives atolls and their inhabited islands."""
    return {"locations": MALDIVES_LOCATIONS}


@router.get("/jobs", response_model=CursorPage[JobPublicResponse])
async def list_public_jobs(
    cursor: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    salary_min: Optional[float] = Query(None),
    salary_max: Optional[float] = Query(None),
    salary_currency: Optional[str] = Query(None, regex="^(MVR|USD)$"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all published jobs (public endpoint).

    Filtering behavior:
    - Currency filtering: If salary_currency is provided, shows only jobs that have at least one salary in that currency
    - Salary range filtering: If salary_min/salary_max are provided, further filters to show only jobs where salaries fall within the range
    - Combined: When both currency and range are specified, shows jobs that have salaries in the specified currency AND within the specified range
    - No filters: Shows all jobs regardless of currency or salary
    """
    query = select(Job).options(selectinload(Job.employer), selectinload(Job.salaries)).where(Job.status == "published")

    if q:
        query = query.where(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.description_md.ilike(f"%{q}%"),
            )
        )

    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))

    # Currency filtering: if currency is specified, only show jobs that have salaries in that currency
    if salary_currency:
        # Find jobs that have salaries in the selected currency
        jobs_with_currency_subquery = select(JobSalary.job_id).where(
            JobSalary.currency == salary_currency
        ).distinct()
        query = query.where(Job.id.in_(select(jobs_with_currency_subquery.c.job_id)))

    # Salary range filtering: if range is specified, further filter jobs where salaries fall within the range
    if salary_min is not None and salary_max is not None:
        # For currency-specific filtering, check salaries in the selected currency (or all currencies if no currency selected)
        currency_filter = JobSalary.currency == salary_currency if salary_currency else True

        # Subquery to find jobs that have salaries that DON'T match the range
        non_matching_salaries_subquery = select(JobSalary.job_id).where(
            and_(
                currency_filter,
                # Either amount_min is less than salary_min OR amount_max is greater than salary_max
                # OR amount_min/amount_max are NULL (which we consider as not matching)
                or_(
                    JobSalary.amount_min < salary_min,
                    JobSalary.amount_max > salary_max,
                    JobSalary.amount_min.is_(None),
                    JobSalary.amount_max.is_(None)
                )
            )
        ).subquery()

        # Exclude jobs that have any non-matching salaries
        query = query.where(
            ~Job.id.in_(select(non_matching_salaries_subquery.c.job_id))
        )

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

    items = [job_to_public_response(job) for job in jobs]

    return CursorPage(items=items, next_cursor=next_cursor)


@router.get("/jobs/{job_id}", response_model=JobPublicResponse)
async def get_public_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a published job by ID (public endpoint)."""
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.employer), selectinload(Job.salaries))
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

    return job_to_public_response(job)


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