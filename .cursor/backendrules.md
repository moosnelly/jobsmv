0) Mission & Definition of Done

Mission: Build an employer-scoped Job Listing API where each employer (company) manages jobs, applicants, applications, and shortlists; applicants can apply publicly.

DoD:

API contract lives in openapi.yaml (v3.1), mounted at /v1/*.

Endpoints conform to JWT auth, employer scoping, RBAC, cursor pagination, idempotency, Problem+JSON.

Codebase passes: ruff, mypy (strict-ish), pytest (unit + integration with ephemeral Postgres + Redis), govulncheck-equivalent (pip-audit), and load-test smoke (k6/Locust).

Observability wired (Prometheus metrics, OTel tracing, structured logs), health endpoints ready.

Container hardened (non-root, read-only FS), manifests/chart with resource limits + NetworkPolicy.

1) Tech Stack (pin these choices)

Framework: FastAPI (async) + Uvicorn (ASGI).

Schemas/Validation: Pydantic v2 (+ pydantic-settings). Enforce extra="forbid".

DB: PostgreSQL + SQLAlchemy 2.x (async) + Alembic migrations.

Auth: JWT only (RS256/ES256) using PyJWT; JWKS fetch with TTL cache; short-lived tokens (5–15 min).

Caching/Rate/Idempotency: Redis.

Storage: S3-compatible (boto3) for CV uploads via pre-signed URLs.

Observability: structlog (JSON), prometheus-fastapi-instrumentator, OpenTelemetry (fastapi instrumentation, sdk, exporters).

Security Runtime: TLS; mTLS for internal calls (if any). Secrets via env referencing KMS/Vault (no secrets in images).

Tooling: pytest, pytest-asyncio, httpx AsyncClient, hypothesis (fuzzing), ruff, mypy, pip-audit, docker, make/poetry/uv, k6/Locust.

2) Architecture Principles (apply everywhere)

OpenAPI-first: Update openapi.yaml before handlers. Keep types in sync with models/schemas.

Employer scoping: Every table has employer_id. Enforce at:

JWT → request context (extract employer_id claim),

Scoped session/query helper that always filters by employer_id,

RBAC/ABAC route checks,

Composite unique constraints include employer_id.

RBAC roles: employer_admin, recruiter, viewer, applicant. Default deny; fail closed.

Idempotency: Require Idempotency-Key on POST create; dedupe via Redis (or table) with TTL.

Pagination: Use opaque signed cursors (base64url). Never page numbers for large sets.

Errors: application/problem+json with type, title, status, code (machine-readable), optional detail.

Validation: Reject unknown fields; strict content-type; max header/body sizes.

CORS: Allow-list only. Never * with credentials.

Reliability: timeouts (per-request and clients), graceful shutdown, retry with jitter, circuit breaker.

Data protection: minimize PII; encrypt at rest (DB/S3 SSE); redact secrets; audit trails for state changes.

3) API Surface (contract to generate)

Mount at /v1. Create these groups with request/response examples and Problem+JSON errors.

Public Jobs (no auth)

GET /v1/public/jobs?cursor=&q=&department=&language=&location=

GET /v1/public/jobs/{jobId}

POST /v1/public/jobs/{jobId}/apply

Accepts applicant details + CV/cover letter links (pre-signed).

Protect with rate-limit + captcha attestation (pluggable).

Jobs (employer-scoped, JWT)

GET /v1/jobs?cursor=&q=&department=&language=&location=&status=

POST /v1/jobs (Idempotency-Key)

GET /v1/jobs/{jobId}

PATCH /v1/jobs/{jobId}

DELETE /v1/jobs/{jobId}

POST /v1/jobs/{jobId}:publish

POST /v1/jobs/{jobId}:close

Applicants (employer-scoped)

GET /v1/applicants?cursor=&q=&skill=&language=

POST /v1/applicants

GET /v1/applicants/{applicantId}

PATCH /v1/applicants/{applicantId}

DELETE /v1/applicants/{applicantId}

Applications (employer-scoped)

GET /v1/jobs/{jobId}/applications?cursor=&status=

GET /v1/applications/{applicationId}

PATCH /v1/applications/{applicationId} (status, notes)

Shortlists (employer-scoped)

GET /v1/jobs/{jobId}/shortlist

PUT /v1/jobs/{jobId}/shortlist (replace entries)

POST /v1/jobs/{jobId}/shortlist/entries

DELETE /v1/jobs/{jobId}/shortlist/entries/{applicantId}

Taxonomy (public or JWT as needed)

GET /v1/taxonomy/departments

GET /v1/taxonomy/languages

GET /v1/taxonomy/locations

Media

POST /v1/uploads:presign (kinds: cv, cover_letter) → {url, fields, expires_at}

Webhooks (employer-scoped)

GET /v1/webhooks/subscriptions

POST /v1/webhooks/subscriptions

DELETE /v1/webhooks/subscriptions/{id}

Events: job.published, application.created, application.status.changed

If token issuance is in-scope: POST /v1/auth/token (credentials → JWT). Otherwise verify only.

4) Data Model (SQLAlchemy + Alembic — required tables)

employers(id PK, name, slug UNIQUE, created_at)

users(id PK, employer_id FK, email, roles ARRAY(TEXT), UNIQUE(employer_id, email))

jobs(id PK, employer_id FK, title, description_md, department, location, languages ARRAY(TEXT), employment_type, salary_min, salary_max, status ENUM(draft,published,closed), tags ARRAY(TEXT), published_at, created_at, updated_at)

applicants(id PK, employer_id FK, name, email, phone, cv_url, links JSONB, skills ARRAY(TEXT), languages ARRAY(TEXT), consent JSONB, created_at)

applications(id PK, employer_id FK, job_id FK, applicant_id FK NULL, status ENUM(new,screening,interview,offer,hired,rejected), source, notes, created_at, updated_at, INDEX(employer_id, job_id, status))

application_stages(id PK, application_id FK, status, changed_at, note)

shortlists(id PK, employer_id FK, job_id FK, created_at, updated_at)

shortlist_entries(shortlist_id FK, applicant_id FK, score INT, notes, PRIMARY KEY(shortlist_id, applicant_id))

webhook_subscriptions(id PK, employer_id FK, event_type, target_url, secret, created_at)

uploads(id PK, employer_id FK, kind, path, created_at)

idempotency_keys(id PK, employer_id FK, key UNIQUE WITHIN employer, response_hash, status_code, expires_at)

Rules: all tables include employer_id; indexes for frequent filters; composite uniques to avoid cross-employer collisions.

5) Schemas (Pydantic v2 — enforce)

Create request/response schemas with model_config = ConfigDict(extra="forbid").

Problem (for application/problem+json)

CursorPage[T] (items: list[T], next_cursor: str | None)

Job, JobCreate, JobUpdate

Applicant, ApplicantCreate, ApplicantUpdate

Application, ApplicationCreate (public), ApplicationUpdate

Shortlist, ShortlistEntry, ShortlistUpsert

WebhookSubscription, UploadPresignResponse

6) Middleware & Dependencies (order matters)

Conceptual order (implement with FastAPI middlewares/dependencies):

Request ID + timeout (per-request deadline 2–5s with asyncio.timeout or custom).

Rate limiting (Redis token bucket/sliding window). Fail closed on errors.

JWT verify (PyJWT + JWKS TTL cache; verify exp, nbf, aud, iss, kid).

Employer scope (extract employer_id claim → employer_id; attach to context).

RBAC/ABAC (require_roles(*roles); per-route).

CORS (strict allow-list; credentials off by default).

Metrics + tracing (Prometheus + OTel; propagate W3C trace context).

Input validation (Pydantic models; forbid extra).

Handlers.

Cursor must generate these helpers:

get_db() async session (lifespan managed).

get_current_user() from Authorization: Bearer.

require_roles(*roles).

with_employer_scope() (yields a query helper that injects employer_id filter automatically).

problem_json() (helper to send Problem+JSON).

encode_cursor(state) / decode_cursor(token) (sign + base64url).

presign_upload(kind) using boto3 (content-type & size constraints).

7) Security Requirements (non-negotiable)

JWT only (no OIDC). Asymmetric (RS256/ES256). Short-lived (5–15m).

JWKS cache with TTL; support key rotation and overlapping keys (use kid).

Logs are structured; never log secrets/PII; add trace_id, span_id, employer_id, user.

CORS allow-list only; reject * with credentials.

Body/header limits at ASGI server and in code.

S3 uploads: size/type validation; virus scan hook (extensible); SSE enabled.

Audit trail for state changes (applications, job status).

mTLS recommended for internal service calls; secrets from env are references to KMS/Vault, not raw secrets in the image.

8) Reliability & Performance

Client timeouts (DB/HTTP); retries with jitter for transient errors; circuit breaker around upstreams.

Graceful shutdown with drain.

Connection pooling tuned for Postgres/Redis.

Prepared statements & transactions with context.

Target p95 < 200ms at agreed RPS (document in SLOs).

9) Observability

Logging: structlog (JSON). Include IDs and latency.

Metrics: prometheus-fastapi-instrumentator; counters, histograms (RPS, p95 latency, errors, limiter/circuit metrics).

Tracing: OpenTelemetry for HTTP + DB; export to chosen backend.

Health: /healthz (optionally checks deps), /readyz, /livez.

Profiling: only behind auth/network (e.g., yappi/py-spy trigger endpoints).

10) Code Generation Rules (what Cursor must do on changes)

New/changed endpoint:

Update openapi.yaml (paths/schemas/examples).

Generate/adjust Pydantic schemas & handlers.

Wire middleware dependencies (JWT, employer, RBAC).

Add tests (unit + integration) and doc examples.

POST create: enforce Idempotency-Key; implement dedupe (Redis/table) with TTL; test for retry safety.

Query parameters: whitelist + validate; reject unknown; test filtering & pagination.

DB operations: always use employer-scoped queries; use transactions; add indexes/migrations as needed.

Logging: structured; include correlation IDs; no PII/secrets.

Uploads: presign via S3; validate kind, size, mime.

Webhooks: HMAC signature with per-subscription secret; retries with backoff; dead-letter log.

12) Makefile / Tasks (example targets)

format → ruff format

lint → ruff check . && mypy .

test → pytest -q

integ → dockerized Postgres/Redis + pytest markers

migrate → alembic upgrade head

audit → pip-audit

serve → uvicorn app.main:app --host 0.0.0.0 --port 8080

loadtest → run k6/Locust profile

13) Testing Requirements

Unit: schema validators, cursor encode/decode (fuzz with hypothesis), idempotency store, RBAC checks.

Integration: API flows with ephemeral Postgres + Redis (docker-compose); golden responses for Problem+JSON.

Concurrency: parallel apply/job listing scenarios (async correctness).

Security: JWT verification edge cases (expired, invalid aud/iss, wrong kid).

Load: smoke profile asserting p95 latency threshold.

Employer scoping: ensure no cross-employer data leaks in all queries.

14) Review Checklist (gates before merge)

 openapi.yaml updated & validated (3.1).

 All responses on errors use Problem+JSON with code.

 JWT verification (RS/ES) + JWKS TTL cache; rotation supported (overlapping kid).

 Employer scope enforced end-to-end (claims → deps → queries).

 RBAC per route; default deny.

 Idempotency enforced on POST creates; tests included.

 Cursor pagination implemented; no page numbers for large sets.

 Validation forbids extra fields; body/header limits configured.

 CORS allow-list only; no * with credentials.

 Structured logs (trace/span/employer_id/user) + metrics + tracing present.

 Health routes wired; profiling gated.

 Migrations present; indexes for hot paths.

 Dockerfile hardened (non-root, read-only, drop caps).

 CI: lint, typecheck, test (unit+integ), pip-audit, build, (optional) SBOM/sign.

 Load test smoke meets SLO baseline.

 16) First Sprint — Required Deliverables

Baseline openapi.yaml + Problem schema + all path stubs.

JWT verify (JWKS cache) + employer extraction + RBAC dependencies.

Jobs CRUD (employer-scoped) + public list/get.

Applications: public apply, internal list/get/update status.

Shortlist endpoints.

Cursor pagination + idempotency store (Redis).

Presigned uploads for CV/cover letters.

Observability wiring + health endpoints.

Tests (unit + integration) + CI pipeline.

k6/Locust smoke with SLO thresholds.

17) Trigger Phrases (for natural commands to Cursor)

"Generate openapi.yaml v3.1 for the endpoints listed in cursorrules."

"Scaffold FastAPI modules, models, schemas, and Alembic migrations for employer-scoped jobs/applicants/applications/shortlists."

"Add JWT verify with JWKS TTL cache and employer/RBAC dependencies."

“Implement POST create idempotency with Redis and tests.”

“Implement cursor pagination helpers and integrate on list endpoints.”

“Wire Prometheus metrics + OTel tracing + structured logging.”

“Add presigned S3 uploads for CVs; validate size/mime.”

“Create dockerized integration test setup for Postgres + Redis + pytest.”

“Add Makefile/poetry/uv tasks and GitHub Actions CI per rules.”

“Generate k6/Locust smoke test enforcing p95 < 200ms.”