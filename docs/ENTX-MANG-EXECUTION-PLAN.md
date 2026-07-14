# ENTX-MANG Execution Plan

## Objective

Make Entix.app a working company management platform with backend/API authentication, a real PostgreSQL data model, readiness indicators, and a safe server-side bridge to Entix Books.

## Current Inventory

- The official folder had no repo, package manifest, Prisma schema, or git metadata before this scaffold.
- Existing evidence consisted of two dashboard/landing screenshots from June 2, 2026.
- Data Core handoff confirms the database resource `en-os-data-db-postgres-main` and logical database `entix_app_core`.

## Architecture Decision

Keep Entix.app and Entix Books separate products connected through server-side APIs.

Reasoning:
- Entix.app owns company operations, files, governance, tasks, readiness, and institutional intelligence.
- Entix Books owns accounting, tax, invoicing, and ZATCA-specific compliance.
- Accounting has stricter compliance and domain logic, so merging too early increases blast radius.
- A bridge keeps one user experience possible later without coupling databases or release cycles now.

## P0 Vertical Slice

1. Better Auth Google login through `/api/auth/[...all]`.
2. Invite/allowlist signup gate checked on the server before user creation.
3. Prisma schema split across `auth`, `app`, `content`, `automation`, and `audit`.
4. Dashboard API returning company health, missing requirements, document status, and module readiness.
5. Entix Books status adapter using `ENTIX_IO_API_URL` and server-side token only.

## P1 Modules

- Company profile and entity registry.
- Required information checklist.
- Document vault metadata.
- Team and role assignments.
- Task and operations board.
- Governance/compliance evidence log.
- Accounting snapshot sync from Entix Books.

## Integration Contract With Entix Books

Entix.app should request summarized accounting state from Entix Books:

- Accounting connection status.
- Last successful sync.
- Receivables/payables snapshot.
- Invoice exceptions and compliance warnings.
- Period-level financial summary.

Entix.app should not write invoices directly until an approved accounting workflow exists.

## Production Readiness Checklist

- Configure Google OAuth redirect URLs.
- Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, and `MIGRATION_DATABASE_URL`.
- Run Prisma migrations using `entix_app_core_migrator`.
- Run application with `entix_app_core_app`.
- Seed initial organization, admin allowlist, and first company.
- Confirm `/api/health` shows database reachable.
- Confirm `/api/integrations/entix-io/status` sees Entix Books when configured.
- Enable deployment logs and audit event capture.
