"""Seed script for populating sample data."""
import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.db.models import Employer, Job, Category, JobCategory
from app.core.security import get_password_hash
import uuid


async def seed():
    """Seed database with sample data."""
    async with AsyncSessionLocal() as db:
        # Create sample employer
        result = await db.execute(select(Employer).where(Employer.email == "demo@example.com"))
        employer = result.scalar_one_or_none()

        if not employer:
            employer = Employer(
                id=uuid.uuid4(),
                company_name="Demo Company",
                email="demo@example.com",
                password_hash=get_password_hash("demo123"),
                contact_info={"phone": "+1234567890"},
            )
            db.add(employer)
            await db.flush()
            print(f"Created employer: {employer.company_name}")

        # Create categories
        categories_data = [
            {"name": "Engineering", "description": "Software engineering and development"},
            {"name": "Design", "description": "UI/UX and graphic design"},
            {"name": "Marketing", "description": "Marketing and communications"},
            {"name": "Sales", "description": "Sales and business development"},
        ]

        categories = {}
        for cat_data in categories_data:
            result = await db.execute(select(Category).where(Category.name == cat_data["name"]))
            category = result.scalar_one_or_none()
            if not category:
                category = Category(
                    id=uuid.uuid4(),
                    name=cat_data["name"],
                    description=cat_data["description"],
                )
                db.add(category)
                await db.flush()
            categories[cat_data["name"]] = category
            print(f"Created/Found category: {category.name}")

        # Create sample jobs
        jobs_data = [
            {
                "title": "Senior Software Engineer",
                "description_md": "We are looking for an experienced software engineer...",
                "requirements_md": "- 5+ years of experience\n- Python/FastAPI knowledge",
                "location": "Remote",
                "salary_min": 100000,
                "salary_max": 150000,
                "status": "published",
                "tags": ["python", "fastapi", "remote"],
                "category": "Engineering",
            },
            {
                "title": "UI/UX Designer",
                "description_md": "Join our design team...",
                "requirements_md": "- 3+ years of design experience\n- Portfolio required",
                "location": "New York, NY",
                "salary_min": 80000,
                "salary_max": 120000,
                "status": "published",
                "tags": ["design", "ui", "ux"],
                "category": "Design",
            },
            {
                "title": "Marketing Manager",
                "description_md": "Lead our marketing efforts...",
                "requirements_md": "- 5+ years marketing experience\n- Digital marketing expertise",
                "location": "San Francisco, CA",
                "salary_min": 90000,
                "salary_max": 130000,
                "status": "draft",
                "tags": ["marketing", "digital"],
                "category": "Marketing",
            },
        ]

        for job_data in jobs_data:
            result = await db.execute(
                select(Job).where(
                    Job.title == job_data["title"], Job.employer_id == employer.id
                )
            )
            job = result.scalar_one_or_none()

            if not job:
                job = Job(
                    id=uuid.uuid4(),
                    employer_id=employer.id,
                    title=job_data["title"],
                    description_md=job_data["description_md"],
                    requirements_md=job_data["requirements_md"],
                    location=job_data["location"],
                    salary_min=job_data["salary_min"],
                    salary_max=job_data["salary_max"],
                    status=job_data["status"],
                    tags=job_data["tags"],
                )
                db.add(job)
                await db.flush()

                # Link category
                category = categories[job_data["category"]]
                job_category = JobCategory(job_id=job.id, category_id=category.id)
                db.add(job_category)
                print(f"Created job: {job.title}")

        await db.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())

