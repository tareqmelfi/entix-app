# Coolify Deployment Notes — Entix.app

## Prerequisites

1. Coolify instance running (COOLIFY_BASE_URL = https://coolify.fc.sa)
2. PostgreSQL database resource created in Coolify
3. Run `scripts/setup-db-roles.sql` as postgres admin to create roles + schemas

## Environment Variables (Coolify)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | postgresql://entix_app_core_app:PASSWORD@DB_HOST:5432/entix_app_core?schema=app |
| `MIGRATION_DATABASE_URL` | postgresql://entix_app_core_migrator:PASSWORD@DB_HOST:5432/entix_app_core?schema=app |
| `BETTER_AUTH_URL` | https://entix.app |
| `BETTER_AUTH_SECRET` | (32+ char random string) |
| `GOOGLE_CLIENT_ID` | (from EN-SECRETS-MASTER) |
| `GOOGLE_CLIENT_SECRET` | (from EN-SECRETS-MASTER) |
| `ENTIX_AUTH_MODE` | invite_only |
| `ENTIX_ADMIN_EMAILS` | tareq@fc.sa |
| `NEXT_PUBLIC_APP_URL` | https://entix.app |
| `NODE_ENV` | production |

## Deployment Flow

1. Connect GitHub repo to Coolify as a Dockerfile-based service
2. Set all environment variables above
3. Coolify builds via `docker/Dockerfile` (multi-stage, standalone output)
4. `docker/entrypoint.sh` runs `prisma migrate deploy` (migrator role) then starts app (app role)
5. Bind domain `entix.app` via Cloudflare DNS (CNAME to Coolify)
6. SSL is automatic via Coolify/Let's Encrypt

## Google OAuth Redirect URIs

Add these in Google Cloud Console (OAuth client 226036548276-c43hvcp4duabt09a72cg1qpt03s5q7v0):

- Production: `https://entix.app/api/auth/callback/google`
- Local dev: `http://localhost:3000/api/auth/callback/google`

## Postgres Role Setup

After creating the Postgres resource in Coolify, run as admin:

```sql
-- Create the logical database
CREATE DATABASE entix_app_core;

-- Connect to it, then run setup-db-roles.sql
\c entix_app_core
\i scripts/setup-db-roles.sql
```

Or use the Coolify DB exec terminal to paste the SQL.

## Notes

- n8n role (`entix_app_core_n8n`) is created but disabled. Requires explicit workflow-level approval.
- Entix Books bridge (`ENTIX_IO_*`) is deferred until entix.io is ready.
- Webhook receiver is live at `/api/integrations/entix-io/webhook` but inactive until configured.
