Feature List — Employer-Scoped Job Listing API (FastAPI + JWT)

Goal: A secure, scalable, employer-scoped Job Listing API where employers can manage job postings, applicants, and shortlists, and applicants can apply publicly.

1. 🧱 Core System Features
🔹 Employer-Scoped Architecture

Every resource (Job, Applicant, Application, Shortlist) is scoped by employer_id.

Employers are isolated at:

JWT claim level (employer_id in token),

Database level (employer_id field + enforced filters),

API access level (RBAC dependencies per route).

Support for multiple employers using the same backend securely.

🔹 OpenAPI-First Contract

Versioned API under /v1.

All endpoints documented via OpenAPI 3.1 (openapi.yaml).

Uses Problem+JSON for error responses.

🔹 JWT Authentication

Asymmetric JWT (RS256/ES256) — short-lived tokens (5–15 min).

JWKS endpoint caching with key rotation support.

Token claims: sub, employer_id, roles, exp, aud, iss.

Supports RBAC roles:

employer_admin

recruiter

viewer

applicant

🔹 RBAC & Employer Scoping

Middleware & dependencies automatically inject employer_id from JWT claims.

Role-based route decorators (require_roles("employer_admin", "recruiter")).

No data leakage between employers (enforced at query and ORM level).

2. 💼 Job Management Features
🔸 CRUD Operations

Employers can:

Create new job listings (POST /v1/jobs)

Edit/Update job details (PATCH /v1/jobs/{id})

Delete job listings (DELETE /v1/jobs/{id})

List all jobs by employer (GET /v1/jobs)

View job details (GET /v1/jobs/{id})

🔸 Publishing Workflow

Jobs have states: draft, published, closed.

Actions:

POST /v1/jobs/{id}:publish

POST /v1/jobs/{id}:close

🔸 Job Search & Filtering

Public and internal endpoints with:

Full-text query (q)

Filters: department, language, location, status

Pagination via opaque cursor tokens (no page numbers).

🔸 Taxonomy (Filters)

Endpoints:

/v1/taxonomy/departments

/v1/taxonomy/languages

/v1/taxonomy/locations

Used for filter dropdowns (mirrors job portals like Job-Maldives and Jobsicle).

3. 👤 Applicant & Application Management
🔸 Applicants

CRUD operations for applicants (employer-scoped).

Fields: name, email, phone, skills, languages, cv_url, consent, links.

Search & filters by skills or language.

/v1/applicants (list/create), /v1/applicants/{id} (view/update/delete).

🔸 Applications

Public endpoint for job applications:

POST /v1/public/jobs/{id}/apply

Validates against job status (published only).

Rate-limited + CAPTCHA or attestation support.

Internal endpoints:

GET /v1/jobs/{id}/applications (list)

GET /v1/applications/{id} (detail)

PATCH /v1/applications/{id} (update status, add notes)

Application workflow statuses:
new → screening → interview → offer → hired/rejected

🔸 Shortlisting

Each job can maintain a shortlist of preferred applicants.

Endpoints:

GET /v1/jobs/{id}/shortlist

PUT /v1/jobs/{id}/shortlist

POST /v1/jobs/{id}/shortlist/entries

DELETE /v1/jobs/{id}/shortlist/entries/{applicantId}

Shortlist entry includes score and notes.

4. 📥 Media & Uploads
🔹 Pre-Signed Uploads

POST /v1/uploads:presign

Returns pre-signed S3 URL and fields.

Supports cv and cover_letter.

Validates file type and size (max configurable).

S3-side encryption (SSE-S3 or KMS).

5. 🔔 Webhooks & Integrations
🔹 Webhook Subscriptions

Employers can register webhook endpoints:

GET /v1/webhooks/subscriptions

POST /v1/webhooks/subscriptions

DELETE /v1/webhooks/subscriptions/{id}

Event types:

job.published

application.created

application.status.changed

Payloads signed with employer-specific secrets.

Retries with exponential backoff; dead-letter logging.

🔹 Syndication Support (Optional)

Future-proof for partner/job board integrations (e.g., social sharing, Jobsicle-like multi-channel posting).

6. 🧮 System Infrastructure & Non-Functional Features
🔸 Reliability

Async I/O (FastAPI + async SQLAlchemy 2.0).

Per-request timeouts (2–5s default).

Graceful shutdown and connection cleanup.

Circuit breaker for webhooks & external calls.

Retry policies with jittered backoff.

🔸 Performance

Efficient connection pooling (Postgres + Redis).

Query optimization: prefetch relationships, index hot fields.

Target SLO: p95 < 200ms @ N RPS (configurable).

🔸 Observability

Structured logs via structlog (JSON):

include trace_id, span_id, employer_id, user, latency.

Metrics via prometheus-fastapi-instrumentator:

RPS, latency histograms, error counters.

Tracing via OpenTelemetry (HTTP + DB spans).

Health endpoints:

/healthz (dependencies optional)

/readyz (readiness)

/livez (liveness)

Optional profiling (auth-protected).

7. 🧰 Developer & Security Tooling
🔹 Security

JWT validation with JWKS rotation.

Rate limiting (Redis-based, per-IP + per-token).

Input validation:

Reject unknown fields.

Limit header/body size.

Enforce JSON only.

Strict CORS allow-list.

PII minimization; secrets managed by KMS/Vault.

HTTPS + optional mTLS between internal services.

Audit trail for job and application lifecycle events.

🔹 Idempotency

Idempotency-Key required for POST create endpoints.

Redis or DB-based dedupe store (key → response hash).

Safe for retry & network failure recovery.

🔹 Testing & Quality

Unit tests: business logic, validators, cursor encode/decode, RBAC.

Integration tests: ephemeral Postgres + Redis + httpx AsyncClient.

Contract tests: OpenAPI spec validation.

Fuzzing: with Hypothesis for JSON parsers.

Load tests: k6/Locust (p95 latency threshold).

Linting: Ruff; Type-checking: Mypy strict; Security scan: pip-audit.

🔹 DevOps

Migrations: Alembic.

Containerization: Distroless or slim Python image; non-root, read-only FS.

CI/CD: Lint → Type-check → Unit + Integration → Migrate → Build → SBOM → Sign.

Helm/Kubernetes: HPA, NetworkPolicy, PDB.

Deployment model: Blue/green or canary.

8. 🧩 API Design Standards
Principle	Rule
Versioning	/v1/...
Auth	JWT Bearer only
Error Format	application/problem+json
Pagination	Cursor-based
Validation	extra="forbid"
Idempotency	Header: Idempotency-Key
Rate Limits	Per-IP and per-token
CORS	Strict allow-list
Logs	JSON structured, redact PII
Schema	Pydantic v2
Health	/healthz, /readyz, /livez
Metrics	Prometheus
Tracing	OpenTelemetry
9. 🧱 Example Entities Summary
Entity	Description
Employer	Represents a company. Has branding & settings.
User	Belongs to an employer; has roles (employer_admin, recruiter, etc.).
Job	Listing posted by employer; supports full CRUD and publish/close.
Applicant	Person record, managed internally or created via application.
Application	Links applicant → job, tracks status/stages.
Shortlist	Subset of applicants marked for follow-up; stores scores/notes.
WebhookSubscription	Employer-defined callbacks for system events.
Upload	Tracks uploaded files (CVs, cover letters).
IdempotencyKey	Dedupe mechanism for POST requests.
10. 🚀 Future-Ready Enhancements (Backlog Ideas)

Job analytics dashboard (views, applicants, hire ratio).

Email notifications for status changes (optional integration with Resend/Mailgun).

Multi-language job descriptions (i18n fields).

AI-based applicant scoring (optional ML module).

Team collaboration (comments & assignment system).

Career-page embed widgets (public job board for each employer).