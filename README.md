# Entix.app Company Management Platform

Entix.app is the company management platform for structured operations, files, teams, tasks, compliance readiness, and institutional intelligence.

## Current Scope

- Next.js 14 App Router application.
- Server-side API boundary only; the frontend never connects directly to PostgreSQL.
- PostgreSQL Data Core database: `entix_app_core`.
- Runtime role: `entix_app_core_app`.
- Migration role: `entix_app_core_migrator`.
- Google login via Better Auth.
- Public registration is locked by an invite/allowlist gate.

## Local Development

```bash
pnpm install
DATABASE_URL="postgresql://user:pass@host:5432/entix_app_core?schema=app" pnpm prisma:generate
pnpm dev
```

For migrations, set `MIGRATION_DATABASE_URL` and run the migration command from a controlled server or CI job. Do not use the `postgres` admin role for application runtime.

## Architecture Rule

Entix.app and Entix Books (`entix.io`) remain separate products. Accounting data flows through a server-side integration boundary instead of sharing frontend/database access.
