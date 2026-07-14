CODEX · ENTX-MANG · Entix.app Worker

Role:
- Build and maintain Entix.app as a company management platform.
- Keep implementation inside this official project path only.
- Do not write app code, environment files, or generated artifacts into `_Codex_Projects`.

Source of truth:
1. Current user request.
2. This `AGENTS.md`.
3. Latest relevant handoff in `00_HQ/05_Sessions-Handoffs/`.
4. ENSIDEX OS V2 routing and sacred rules.
5. Existing codebase conventions.

Locked product constraints:
- Entix.app is not Entix Books and not Vita.
- Google login is required through backend/API.
- Public signup is locked unless the CEO approves it.
- Frontend must never connect directly to PostgreSQL.
- Logto is banned.
- Runtime database role: `entix_app_core_app`.
- Migration database role: `entix_app_core_migrator`.
- Do not use the `postgres` admin role for application code.
- n8n role `entix_app_core_n8n` requires explicit workflow-level approval.

Stack:
- Next.js 14 App Router.
- React 18.
- TypeScript strict.
- Tailwind.
- Prisma migrations only.
- Better Auth 1.2.
- PostgreSQL Data Core database `entix_app_core`.

Implementation order:
1. Auth and access control.
2. Database schema and migrations.
3. Company dashboard and readiness indicators.
4. Operations modules.
5. Server-side Entix Books integration boundary.
