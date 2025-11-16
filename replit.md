# JobSMV - Multi-Employer Job Platform

## Overview

JobSMV is a production-ready job listing platform that enables multiple employers to post and manage job listings while providing a public-facing interface for job seekers to browse and apply to positions. The system follows a modern full-stack architecture with a FastAPI backend and Next.js frontend, emphasizing security, scalability, and developer experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses **npm workspaces** to organize code into logical packages:

- **apps/api**: FastAPI backend service (Python 3.12)
- **apps/web**: Next.js 16 frontend application (TypeScript)
- **packages/types**: Shared TypeScript type definitions
- **packages/ui-tripled**: Reusable React UI components
- **packages/config**: Shared configuration (ESLint, TypeScript)
- **packages/tsconfig**: TypeScript configuration presets
- **packages/eslint-config**: ESLint rules

This structure promotes code reuse and maintains clear separation of concerns while enabling shared types between frontend and backend.

### Frontend Architecture (Next.js 16)

**Technology Choices:**
- **Next.js 16.0.2** with App Router for modern React features and file-based routing
- **TypeScript** for type safety across the application
- **Tailwind CSS v4** using the new `@theme` directive for design system tokens
- **Lucide React** for consistent iconography

**Routing Structure:**
- `(public)` route group: Public-facing job listings and application forms
- `(auth)` route group: Login and registration pages
- `(dashboard)` route group: Protected employer dashboard for job management

**Design System:**
The application implements a comprehensive design system with:
- Custom CSS variables for semantic theming (light/dark mode support)
- JobSMV brand colors including accent cards (peach, mint, lilac, soft blue)
- Typography hierarchy using Orkney for display text and Inter for body content
- Pre-built component classes for consistent UI patterns
- Documented in `design/design system.json` and `design.json`

**State Management:**
Client-side state management uses React hooks with a centralized API client (`lib/api-client.ts`) for all backend communication. Authentication state is managed through `lib/auth.ts` with JWT tokens stored in localStorage (noted as a simplification - production should use httpOnly cookies).

### Backend Architecture (FastAPI)

**Core Design Principles:**
- **Employer-scoped multi-tenancy**: Every resource (Job, Application) is scoped by `employer_id` to ensure data isolation
- **OpenAPI-first**: API contract defined and documented via FastAPI's automatic OpenAPI generation
- **Async-first**: All database operations use SQLAlchemy 2.0 async engine with asyncpg driver
- **Security-focused**: JWT authentication with RS256 asymmetric signing, rate limiting, and idempotency keys

**API Versioning:**
All endpoints are versioned under `/api/v1` to support future API evolution without breaking existing clients.

**Authentication & Authorization:**
- **JWT tokens** with RS256 algorithm using RSA key pairs
- Keys stored in `apps/api/keys/` (generated on startup if missing)
- Token payload includes: `employer_id`, `sub` (email), `roles`, `exp`, `aud`, `iss`
- JWKS endpoint at `/.well-known/jwks.json` for public key distribution
- Role-based access control (RBAC) with dependency injection pattern

**Security Considerations:**
- JWT keys may be compromised if found in version control (see `SECURITY_WARNING.md`)
- Production deployments should use environment-based key management or key vault services
- Default `SECRET_KEY` must be changed before production deployment

**Database Design:**
- **PostgreSQL 16** as primary data store
- **SQLAlchemy 2.0** ORM with async support (asyncpg driver)
- **Alembic** for database migrations
- Schema includes: employers, jobs, categories, job_categories (many-to-many), applications, shortlists

**Key Models:**
- `Employer`: Company accounts with authentication credentials
- `Job`: Job postings with markdown description/requirements, status enum (draft/published/closed)
- `Application`: Job applications linked to both employer and job
- `Category`: Job categories for filtering and organization

**Pagination Strategy:**
Cursor-based pagination using base64-encoded cursors to support efficient pagination at scale, avoiding offset-based performance issues.

**Rate Limiting & Idempotency:**
- Redis-based sliding window rate limiting for sensitive endpoints (login, register, apply)
- Idempotency key support for create operations to prevent duplicate submissions
- Configurable limits per endpoint (e.g., 5 applications per 5 minutes per IP)

**API Route Organization:**
- `auth.py`: Registration and login endpoints
- `employers.py`: Employer profile management
- `jobs.py`: Protected job CRUD operations (employer-scoped)
- `public.py`: Public job browsing and application submission
- `applications.py`: Application management
- `categories.py`: Category listing
- `health.py`: Health check endpoints (livez, readyz, healthz)
- `jwks.py`: JWKS endpoint for JWT public key distribution

### Data Flow Patterns

**Job Creation Flow:**
1. Employer authenticates → receives JWT token
2. Frontend makes POST to `/api/v1/jobs` with JWT in Authorization header
3. Backend validates token, extracts `employer_id`, enforces employer scoping
4. Job created with `employer_id` association
5. Categories linked via `JobCategory` join table

**Public Job Application Flow:**
1. Applicant browses public jobs at `/jobs`
2. Clicks apply → redirected to `/apply/{job_id}`
3. Submits application form (POST to `/api/v1/public/jobs/{job_id}/apply`)
4. Rate limiting enforced by IP address
5. Application created with reference to both job and employer
6. Success confirmation displayed

**Employer Job Management Flow:**
1. Employer logs in → JWT stored client-side
2. Dashboard loads jobs via `/api/v1/jobs` (automatically filtered by `employer_id`)
3. Can create, update, delete jobs (all scoped to their employer account)
4. Can view and manage applications for their jobs only

### Infrastructure & Deployment

**Docker Compose Setup:**
The `infra/docker-compose.yml` orchestrates the complete development environment:
- PostgreSQL 16 container (port 5432)
- Redis container (port 6379)
- FastAPI backend container (port 8000)
- Next.js frontend container (port 3000)

**Environment Configuration:**
- Backend: `apps/api/.env` (DATABASE_URL, REDIS_URL, JWT settings, CORS)
- Frontend: `apps/web/.env.local` (NEXT_PUBLIC_API_URL)
- Docker network enables service-to-service communication

**Observability:**
- **Structured logging** via structlog (JSON format)
- **Prometheus metrics** via prometheus-fastapi-instrumentator
- **OpenTelemetry** instrumentation for distributed tracing
- Health check endpoints for Kubernetes/container orchestration

### Migration from Vercel to Replit

The project was migrated from Vercel to Replit with specific adaptations:
- Database URL automatically provided by Replit
- Manual JWT key generation on startup
- CORS configuration updated for Replit domains
- Special handling in `apps/web/scripts/postinstall.js` to manage `lucide-react` dependency hoisting
- Documentation in `README_REPLIT.md` for Replit-specific setup

## External Dependencies

### Frontend Dependencies
- **next** (16.0.2): React framework with App Router
- **react** (18.2.0): UI library
- **lucide-react** (0.553.0): Icon library
- **tailwindcss** (4.0.0): Utility-first CSS framework
- **@tailwindcss/postcss** (4.0.0): PostCSS plugin for Tailwind v4

### Backend Dependencies
- **fastapi** (0.121.1): Modern async web framework
- **uvicorn[standard]** (0.30.1): ASGI server
- **sqlalchemy[asyncio]** (2.0.36): Async ORM
- **asyncpg** (0.29.0): PostgreSQL async driver
- **alembic** (1.13.2): Database migration tool
- **pydantic** (2.9.2): Data validation using Python type hints
- **pydantic-settings** (2.5.2): Settings management
- **python-jose[cryptography]** (3.3.0): JWT implementation
- **passlib[bcrypt]** (1.7.4): Password hashing
- **redis** (5.2.0): Redis client for caching and rate limiting
- **structlog** (24.4.0): Structured logging
- **prometheus-fastapi-instrumentator** (7.0.0): Metrics collection
- **opentelemetry-*** packages: Distributed tracing support
- **httpx** (0.28.1): Async HTTP client
- **pytest** (8.3.3): Testing framework
- **pytest-asyncio** (0.24.0): Async test support

### Infrastructure Services
- **PostgreSQL 16**: Primary relational database
  - Connection via asyncpg driver
  - URL format: `postgresql+asyncpg://user:pass@host:port/db`
  - Note: asyncpg doesn't use sslmode parameter; SSL negotiated automatically

- **Redis**: In-memory data store
  - Used for rate limiting (sliding window algorithm)
  - Idempotency key storage (TTL-based)
  - Potential future use for session storage and caching

### Development Tools
- **Docker & Docker Compose**: Container orchestration
- **prettier** (3.2.5): Code formatting
- **ruff**: Python linting and formatting
- **mypy**: Python static type checking
- **ESLint** (9.0.0): JavaScript/TypeScript linting

### Design System Assets
The design system references external fonts:
- **Orkney**: Display font for headings and numeric content
- **Inter**: Body text and UI elements
- Font loading strategy should be implemented in production (e.g., via Next.js font optimization)