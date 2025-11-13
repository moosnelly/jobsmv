"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create employers table
    op.create_table(
        "employers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("contact_info", postgresql.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_employers_email", "employers", ["email"])

    # Create categories table
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
    )
    op.create_index("ix_categories_name", "categories", ["name"])

    # Create jobs table
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("employer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description_md", sa.Text, nullable=False),
        sa.Column("requirements_md", sa.Text, nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("salary_min", sa.Integer, nullable=True),
        sa.Column("salary_max", sa.Integer, nullable=True),
        sa.Column(
            "status",
            sa.Enum("draft", "published", "closed", name="job_status"),
            nullable=False,
        ),
        sa.Column("tags", postgresql.ARRAY(sa.String), nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(["employer_id"], ["employers.id"]),
    )
    op.create_index("ix_jobs_employer_id", "jobs", ["employer_id"])
    op.create_index("ix_jobs_title", "jobs", ["title"])
    op.create_index("ix_jobs_location", "jobs", ["location"])
    op.create_index("ix_jobs_status", "jobs", ["status"])

    # Create job_categories table
    op.create_table(
        "job_categories",
        sa.Column("job_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
    )

    # Create applications table
    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("employer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("applicant_name", sa.String(255), nullable=False),
        sa.Column("applicant_email", sa.String(255), nullable=False),
        sa.Column("resume_url", sa.String(500), nullable=True),
        sa.Column("cover_letter_md", sa.Text, nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "new",
                "screening",
                "interview",
                "offer",
                "hired",
                "rejected",
                name="application_status",
            ),
            nullable=False,
        ),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(["employer_id"], ["employers.id"]),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
    )
    op.create_index("ix_applications_employer_id", "applications", ["employer_id"])
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_applicant_email", "applications", ["applicant_email"])
    op.create_index("ix_applications_status", "applications", ["status"])


def downgrade() -> None:
    op.drop_index("ix_applications_status", table_name="applications")
    op.drop_index("ix_applications_applicant_email", table_name="applications")
    op.drop_index("ix_applications_job_id", table_name="applications")
    op.drop_index("ix_applications_employer_id", table_name="applications")
    op.drop_table("applications")
    op.drop_table("job_categories")
    op.drop_index("ix_jobs_status", table_name="jobs")
    op.drop_index("ix_jobs_location", table_name="jobs")
    op.drop_index("ix_jobs_title", table_name="jobs")
    op.drop_index("ix_jobs_employer_id", table_name="jobs")
    op.drop_table("jobs")
    op.drop_index("ix_categories_name", table_name="categories")
    op.drop_table("categories")
    op.drop_index("ix_employers_email", table_name="employers")
    op.drop_table("employers")
    op.execute("DROP TYPE IF EXISTS job_status")
    op.execute("DROP TYPE IF EXISTS application_status")

