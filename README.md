# JobSMV - Multi-Employer Job Platform

A production-ready job listing platform where multiple employers can post and manage their job listings. Built with Next.js 16 and FastAPI.

## Tech Stack

- **Frontend**: Next.js 16.0.2, TypeScript, Tailwind CSS 4, UI-TripleD components
- **Backend**: FastAPI 0.121.1, Python 3.12, SQLAlchemy 2.0, PostgreSQL 16
- **Infrastructure**: Docker Compose, Redis
- **Package Manager**: npm workspaces

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Python 3.12 (for local development)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd jobsmv
```

2. Copy environment variables:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

3. Start the entire system:
```bash
npm run dev
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- FastAPI backend on port 8000
- Next.js frontend on port 3000

### Seed Database

After starting the services, run the seed script to populate sample data:

```bash
docker compose -f infra/docker-compose.yml exec api python -m app.scripts.seed
```

Or use the helper script:
```bash
./infra/scripts/seed.sh
```

## Development

### Workspace Scripts

Run scripts across all workspaces:
- `npm run dev` - Start all services via Docker Compose
- `npm run build` - Build all workspaces
- `npm run lint` - Lint all workspaces
- `npm run type-check` - Type check all workspaces
- `npm run format` - Format all code with Prettier

### Individual Workspaces

Each workspace (`apps/web`, `apps/api`, `packages/*`) has its own scripts:
- `dev` - Start development server
- `build` - Build for production
- `lint` - Run linters
- `type-check` - Run type checker
- `format` - Format code

## Project Structure

```
jobsmv/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # FastAPI backend
├── packages/
│   ├── ui-tripled/   # UI-TripleD component wrappers
│   ├── config/       # Shared configs (Tailwind, ESLint, TypeScript)
│   ├── eslint-config/
│   ├── tsconfig/
│   └── types/
├── infra/            # Docker Compose and infrastructure scripts
└── dev/docs/         # Architecture and API documentation
```

## API Documentation

Once the backend is running, visit:
- API docs: http://localhost:8000/docs
- OpenAPI spec: http://localhost:8000/openapi.json

## Environment Variables

See `.env.example` for required environment variables. Each app has its own `.env.example` file with app-specific variables.

## Testing

### Backend Tests
```bash
cd apps/api
pytest
```

### Frontend Tests
```bash
cd apps/web
npm test
```

## License

Private - All rights reserved

