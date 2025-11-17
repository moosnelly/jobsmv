"""Add multi-currency salary support

Revision ID: 6d82ab3ef914
Revises: 002
Create Date: 2025-11-17 09:50:05.362613

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '6d82ab3ef914'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create supported_currency enum (only if it doesn't exist)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE supported_currency AS ENUM('MVR', 'USD');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Create job_salaries table (only if it doesn't exist)
    op.execute("""
        CREATE TABLE IF NOT EXISTS job_salaries (
            id UUID PRIMARY KEY,
            job_id UUID NOT NULL,
            currency supported_currency NOT NULL,
            amount_min DECIMAL(15,2),
            amount_max DECIMAL(15,2),
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            FOREIGN KEY (job_id) REFERENCES jobs(id)
        );
    """)
    
    # Create index if it doesn't exist
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_job_salaries_job_id ON job_salaries(job_id);
    """)

    # Add is_salary_public column to jobs table (only if it doesn't exist)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE jobs ADD COLUMN is_salary_public BOOLEAN NOT NULL DEFAULT TRUE;
        EXCEPTION
            WHEN duplicate_column THEN null;
        END $$;
    """)

    # Migrate existing salary data to job_salaries table (only if old columns exist and data not already migrated)
    op.execute("""
        DO $$ 
        DECLARE
            col_exists boolean;
        BEGIN
            -- Check if salary_min column exists
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'jobs' AND column_name = 'salary_min'
            ) INTO col_exists;
            
            -- Only migrate if column exists and job_salaries is empty
            IF col_exists AND NOT EXISTS (SELECT 1 FROM job_salaries LIMIT 1) THEN
                INSERT INTO job_salaries (id, job_id, currency, amount_min, amount_max, created_at, updated_at)
                SELECT
                    gen_random_uuid() as id,
                    id as job_id,
                    'MVR'::supported_currency as currency,
                    salary_min::decimal(15,2) as amount_min,
                    salary_max::decimal(15,2) as amount_max,
                    created_at,
                    updated_at
                FROM jobs
                WHERE (salary_min IS NOT NULL OR salary_max IS NOT NULL)
                AND NOT EXISTS (
                    SELECT 1 FROM job_salaries WHERE job_salaries.job_id = jobs.id
                );
            END IF;
        END $$;
    """)

    # Drop old salary columns (only if they exist)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE jobs DROP COLUMN salary_min;
        EXCEPTION
            WHEN undefined_column THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE jobs DROP COLUMN salary_max;
        EXCEPTION
            WHEN undefined_column THEN null;
        END $$;
    """)


def downgrade() -> None:
    # Add back old salary columns
    op.add_column("jobs", sa.Column("salary_min", sa.Integer(), nullable=True))
    op.add_column("jobs", sa.Column("salary_max", sa.Integer(), nullable=True))

    # Migrate data back from job_salaries (only for MVR currency)
    op.execute("""
        UPDATE jobs
        SET salary_min = js.amount_min::integer, salary_max = js.amount_max::integer
        FROM job_salaries js
        WHERE jobs.id = js.job_id AND js.currency = 'MVR'
        AND (js.amount_min IS NOT NULL OR js.amount_max IS NOT NULL)
    """)

    # Drop is_salary_public column
    op.drop_column("jobs", "is_salary_public")

    # Drop job_salaries table
    op.drop_index("ix_job_salaries_job_id", table_name="job_salaries")
    op.drop_table("job_salaries")

    # Drop the enum
    op.execute("DROP TYPE supported_currency")

