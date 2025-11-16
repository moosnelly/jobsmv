# JobsMV - Replit Setup Guide

This project has been successfully migrated from Vercel to Replit. Below are important notes about the configuration and security settings.

## ⚠️ IMPORTANT: Read SECURITY_WARNING.md First!

**Before running this application, please read `SECURITY_WARNING.md` for critical security information about JWT keys that may be in version control.**

## Important Security Notes

### 1. SECRET_KEY (CRITICAL)
The `SECRET_KEY` environment variable is currently set to a default value. **You MUST change this before deploying to production!**

To set a secure secret key:
1. Open the Secrets tool in Replit
2. Add a new secret named `SECRET_KEY`
3. Generate a secure random string (at least 32 characters)
   - You can use: `openssl rand -hex 32`
4. Save the secret

### 2. JWT Keys (IMPORTANT)
JWT RSA keys are automatically generated on startup and stored in `apps/api/keys/`.

**SECURITY NOTE:** If you cloned this project and JWT keys exist in the `apps/api/keys/` directory:
1. Delete them immediately: `rm apps/api/keys/*.pem`
2. Let the startup script regenerate new keys
3. These keys should be considered compromised and NEVER used in production

For production:
- Use persistent secret management
- Rotate keys regularly
- Consider using environment-based key management or a key vault service

### 3. CORS Configuration
The `CORS_ORIGINS` environment variable should be set to your Replit domain(s).
Current default: `https://d66df6fa-fc0c-4f12-a333-3633f99dc56e-00-tbbfcpfimna0.picard.replit.dev`

Update this in Secrets if your domain changes.

### 4. Redis
Redis is running locally on port 6379. For production deployments, consider using:
- A hosted Redis service
- Update the `REDIS_URL` secret with your hosted Redis connection string

## Environment Variables

### Required (Already Set by Replit)
- `DATABASE_URL` - PostgreSQL database connection (automatically provided by Replit)

### Optional (Have Defaults)
- `SECRET_KEY` - **CHANGE THIS!** Application secret key (default: insecure placeholder)
- `CORS_ORIGINS` - Allowed CORS origins (default: Replit domain)
- `REDIS_URL` - Redis connection string (default: localhost:6379)
- `JWKS_PRIVATE_KEY_PATH` - Path to JWT private key (default: auto-generated)
- `JWKS_PUBLIC_KEY_PATH` - Path to JWT public key (default: auto-generated)

## Project Structure

```
jobsmv/
├── apps/
│   ├── api/          # FastAPI backend (Python)
│   │   ├── app/      # Application code
│   │   ├── alembic/  # Database migrations
│   │   ├── keys/     # JWT keys (auto-generated, not in git)
│   │   └── scripts/  # Utility scripts
│   └── web/          # Next.js frontend
│       └── src/      # Frontend code
└── packages/         # Shared packages
    ├── types/        # TypeScript types
    └── ui-tripled/   # UI components
```

## Running the Application

The application runs automatically in Replit with two workflows:

1. **Frontend** (Port 5000) - Next.js dev server
   - Command: `cd apps/web && npm run dev`
   - Accessible via the webview

2. **Backend** (Port 8000) - FastAPI server
   - Command: `bash apps/api/scripts/generate_keys.sh && redis-server --daemonize yes && cd apps/api && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
   - API docs available at: `http://localhost:8000/docs`

## Database Migrations

Database migrations are managed by Alembic:

```bash
# Run migrations
cd apps/api && alembic upgrade head

# Create a new migration
cd apps/api && alembic revision --autogenerate -m "Description"
```

## Next Steps

1. **Set a secure SECRET_KEY** in Replit Secrets
2. Review and update CORS_ORIGINS for your domain
3. Consider using a hosted Redis service for production
4. Test all authentication flows
5. Review security settings before deploying

## Support

For Replit-specific issues, contact Replit support.
For application issues, refer to the main project documentation.
