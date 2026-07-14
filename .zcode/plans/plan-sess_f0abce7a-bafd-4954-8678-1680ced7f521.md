# خطة إعادة بناء Entix.app (ENTX-MANG) — إعادة تصميم كاملة + قاعدة بيانات + P1 + نشر

## ملخص الحالة الراهنة
المشروع scaffold منظم (Next.js 14 App Router + React 18 + TS strict + Tailwind + Prisma + Better Auth 1.2) فيه P0 vertical slice حقيقي لكنه **غير مكتمل النضج**: لا migrations، لا git، لا `.env`، لا middleware، الـ access control غير مُفعّل على المسارات، التصميم قديم، لا وحدات P1، ولا حاوية Docker. سنُعيد بناءه بالكامل.

## المراجع المتاحة (بدون طباعة قيم سرية)
- ملف الأسرار: `98_Sensitive/EN-SECRETS-MASTER.env` → فيه: Google OAuth, GitHub PAT, Coolify (base URL + token), Hostinger API, Cloudflare, Resend, Stripe, N8N.
- **غير متوفر**: `DATABASE_URL`/`MIGRATION_DATABASE_URL` (سنُنشئها داخل Coolify)، و`ENTIX_IO_API_URL`/`TOKEN` (يُؤجّل).
- ENSIDEX Design System (Final) في `00_HQ/04_Rules-Standards/Imported-Index/` + مراجع Entix Books design — مرجع الهوية البصرية.

## قرارات مُعتمدة
- **النشر**: Coolify VPS عبر Docker (الأفضل/الأسرع/الموحّد) — مع Postgres مُدار داخل Coolify (database resource موحّد).
- **الـ DB**: إنشاء `entix_app_core` + الأدوار `entix_app_core_app` (runtime) و`entix_app_core_migrator` (migration) و`entix_app_core_n8n` (مُؤجل) مباشرة على Coolify Postgres.
- **جسر Entix Books**: يُترك قابل للتهيئة؛ الـ status adapter يعرض «غير مفعّل» حتى جاهزية entix.io.
- **التصميم**: إعادة تصميم كاملة بنظام تصميم ENSIDEX (RTL/عربي، tokens، مكتبة مكونات).
- **P1**: تنفيذ كل وحدات P1.

---

## الفاز 0 — الأساس والنظافة (Foundation & Hygiene)
**الهدف**: مستودع نظيف، إعادة ترتيب، وإدارة أسرار.

1. **git init** + `.gitignore` نهائي: يتجاهل `.next/`, `.netlify/`, `node_modules/`, `.env*` (ما عدا `.env.example`), `*.tsbuildinfo`, `test-results/`, `coverage/`, `design/screenshots/`, `.DS_Store`, `docker/.env`.
2. **إعادة ترتيب الملفات** (نقل):
   - `Screenshot *.png` → `design/screenshots/`.
   - `tsconfig.tsbuildinfo`, `test-results/`, `.netlify/` → حذف من التتبع (gitignored).
   - `netlify.toml` → `archive/netlify.toml` (لن ننشر على Netlify).
3. **هيكلة المجلدات المستهدفة**:
   ```
   /docker/            (Dockerfile, docker-compose.yml)
   /coolify/           (deploy notes)
   /docs/              (EXECUTION-PLAN, ARCHITECTURE, DESIGN-SYSTEM, API)
   /design/screenshots/
   /prisma/            (schema.prisma, migrations/, seed.ts)
   /scripts/           (db-health.ts, setup-db-roles.sql, seed runner)
   /public/fonts/
   /src/app/(auth)/login, (app)/{dashboard,company,documents,team,tasks,governance,accounting}, api/...
   /src/components/{ui,layout,dashboard,auth,company,documents,team,tasks,governance}/
   /src/lib/ (auth, auth-client, env, prisma, design-tokens, utils)
   /src/server/ (access-control, auth-guard, dashboard, entix-io, health, actions/*, services/*)
   /src/hooks/, /src/types/, /src/styles/
   /tests/{e2e,unit}/
   ```
4. **`.env` محلي**: إنشاؤه من `EN-SECRETS-MASTER.env` (قيم Google OAuth, BETTER_AUTH_SECRET عشوائي 32 بايت, ENTIX_AUTH_MODE=invite_only, ENTIX_ADMIN_EMAILS). `DATABASE_URL`/`MIGRATION_DATABASE_URL` تُملأ بعد إعداد Coolify (الفاز 1). ملف `.env` مُتجاهل في git.
5. **تحديث `package.json`**: إضافة `seed`, `format` (prettier), `test:unit` (vitest), `docker:build`; ترقية سكربتات prisma.
6. **Commit أولي** بعد النظافة.

## الفاز 1 — قاعدة البيانات على Coolify (Postgres + Migrations)
**الهدف**: قاعدة `entix_app_core` حية بالأدوار الصحيحة + migrations مطبّقة.

1. **توفير Postgres في Coolify**: إنشاء database resource (PostgreSQL) داخل Coolify عبر Coolify API (لدينا `COOLIFY_BASE_URL` + `COOLIFY_API_TOKEN`).
2. **سكربت `scripts/setup-db-roles.sql`**: ينشئ القاعدة المنطقية `entix_app_core`، والمخططات `auth/app/content/automation/audit`، والأدوار:
   - `entix_app_core_migrator`: CREATE/ALTER/DROP + grants كاملة على `entix_app_core` (للـ migrate فقط).
   - `entix_app_core_app`: SELECT/INSERT/UPDATE/DELETE فقط على المخططات (runtime).
   - `entix_app_core_n8n`: SELECT محدود (يُفعّل لاحقاً بموافقة workflow).
3. **توليد connection strings** وتعبئة `.env`: `DATABASE_URL` (بصلاحية app) و`MIGRATION_DATABASE_URL` (بصلاحية migrator).
4. **`pnpm prisma:generate`** ثم **`pnpm prisma:migrate:dev --name init`** لإنشاء أول migration من الـ schema الحالي (14 models, 16 enums, 5 schemas).
5. **مراجعة schema.prisma**: تأكيد `@@schema` على كل model، الفهارس (indexes) المفقودة على الحقول الحرجة (`Membership.userId+organizationId` موجود؛ إضافة فهارس على `Company.organizationId`, `CompanyRequirement.companyId+area`, `OperationTask.companyId+status+priority`, `AuditEvent.organizationId+createdAt`).
6. **`pnpm prisma migrate deploy`** (بـ `MIGRATION_DATABASE_URL`) للتطبيق على Coolify.
7. **`pnpm seed`**: إنشاء منظمة أولى + InviteAllowlist للمدير + أول شركة + بيانات أساسية. ربط `prisma db seed` في package.json.
8. **`pnpm db:health`** + تأكيد `/api/health` يعيد DB reachable.

## الفاز 2 — إعادة التصميم الكاملة (ENSIDEX Design System)
**الهدف**: هوية بصرية موحّدة + مكتبة مكونات قابلة لإعادة الاستخدام + RTL/عربي.

1. **`docs/DESIGN-SYSTEM.md`**: توثيق tokens (color, spacing, radius, shadow, typography IBM Plex Sans Arabic)، قواعد RTL، حالة الألوان (good/warning/danger)، أيقونات lucide.
2. **`src/lib/design-tokens.ts`** + تحديث `tailwind.config.ts`: لوحة ENSIDEX موحّدة (ink/navy/violet #7c3aed/mint/amber/danger/surface/canvas)، radius، shadows، خطوط، breakpoints.
3. **`src/app/globals.css`**: CSS variables للـ tokens، دعم الوضع الليلي (dark أولي — منصة إدارة)، RTL، focus-ring، scrollbar.
4. **مكتبة مكونات `src/components/ui/`**: `Button`, `Card`, `Badge`, `StatusPill`, `Progress`, `Table`, `Input`, `Textarea`, `Select`, `Modal`, `Tabs`, `EmptyState`, `Skeleton`, `Avatar`, `Tooltip`, `Sheet` (mobile drawer). كلها TS strict + accessible (aria) + RTL.
5. **`src/components/layout/AppShell`**: شريط جانبي collapsible + Topbar (بحث، إشعارات، قائمة المستخدم) + منطقة محتوى + `MobileDrawer`. استبدال الـ inline nav في `EntixDashboard`.
6. **تصميم الصفحات الجديد** (server components + client islands):
   - `/login`: بطاقة وسطى، شعار، زر Google، حالة env واضحة.
   - `/dashboard`: Hero بصحة الكيان + metrics (عاجلة/قريبة/مكتملة) + شبكة الوحدات (progress) + المستندات + ربط Entix Books + تنبيهات.
   - كل صفحات P1 بتصميم موحّد (cards, tables, empty states, loading skeletons).
7. **`loading.tsx` / `error.tsx` / `not-found.tsx`** على مستوى root و`(app)`.
8. **`ThemeProvider`** + إدارة الوضع (dark default).
9. **Screenshot diff**: مقارنة بـ `design/screenshots/` القديمة وتوثيق التطوير.

## الفاز 3 — المصادقة والتحكم في الوصول (Auth & Access Control)
**الهدف**: أمان موحّد عبر middleware + تطبيق صلاحيات حسب المنظمة/الدور.

1. **`src/middleware.ts`**: حماية `/dashboard` وكل مسارات `(app)` و`/api/*` (ما عدا `/api/auth` و`/api/health`) عبر `auth.api.getSession` (Better Auth cookie). إعادة توجيه غير المُسجّل إلى `/login`.
2. **`src/server/auth-guard.ts`**: helper موحّد يجلب الجلسة + العضوية النشطة (Membership) + الدور، ويُرمي `APIError` عند الرفض. استبدال الـ inline checks المتكررة.
3. **`src/server/access-control.ts`** (ترقية): تطبيق `MembershipRole` على كل مسار/فعل:
   - PLATFORM_ADMIN, ORGANIZATION_ADMIN: كل شيء.
   - OPERATIONS_MANAGER, OPERATIONS_MEMBER: قراءة/كتابة العمليات والمستندات.
   - FINANCE_VIEWER: قراءة الـ accounting snapshot فقط.
   - AUDITOR_READONLY: قراءة شاملة دون كتابة.
4. **تصحيح `/api/company/current`**: تحديد الشركة حسب `organizationId` للمستخدم النشط (لا `findFirst` عشوائي) + دعم تبديل الشركة (company switcher) لاحقاً.
5. **Google OAuth**: ضبط redirect URIs لمجال entix.app (إنتاج) وCoolify preview. تأكيد `account.accountLinking` للمزود الموثوق Google فقط.
6. **Invite gate**: إبقاء `ENTIX_AUTH_MODE=invite_only` افتراضياً + لوحة إدارة دعوات (P1 ضمن team).
7. **أمان secret**: فشل صريح في الإنتاج إذا `BETTER_AUTH_SECRET` غير مضبوط (لا fallback hardcoded).

## الفاز 4 — وحدات P1 (كل الوحدات)
**الهدف**: CRUD كامل + server actions + UI لكل وحدة. كل المسارات تمر عبر `auth-guard` و`access-control`.

1. **ملف الشركة (Company Profile)** — `(app)/company` + `api/company/*` + `actions/company.ts`:
   - عرض/تعديل بيانات الشركة (legal/trade name, type, registration, tax ID, address, status).
   - سجل المتطلبات (CompanyRequirement) حسب RequirementArea (7 مجالات) مع readiness.
2. **مستودع المستندات (Document Vault)** — `(app)/documents` + `api/documents/*`:
   - بيانات المستندات (CompanyDocument) مع DocumentCategory (7) وDocumentStatus.
   - رفع metadata (لا تخزين ملفات ثنائية في DB — placeholder لربط تخزين لاحق).
   - جدول + فلاتر + بحث + badges حالة (ساري/ينتهي قريباً/مفقود/مراجعة).
3. **الفريق والأدوار (Team & Roles)** — `(app)/team` + `api/team/*`:
   - إدارة Memberships وأدوارها وحالتها.
   - لوحة دعوات InviteAllowlist (إنشاء/قبول/إلغاء) — مرتبطة بـ invite gate.
4. **لوحة المهام والعمليات (Tasks & Operations Board)** — `(app)/tasks` + `api/tasks/*`:
   - OperationTask حسب OperationModule (9) مع TaskStatus وTaskPriority.
   - عرض Kanban مبسّط + قائمة + فلاتر + إسناد.
5. **الحوكمة والامتثال (Governance & Compliance Log)** — `(app)/governance` + `api/governance/*`:
   - AuditEvent: سجل أحداث قابل للتصفية (النوع/المستخدم/التاريخ).
   - أدلة الامتثال (evidence log) من CompanyDocument/CompanyRequirement.
6. **snapshot محاسبي من Entix Books (Accounting Snapshot)** — `(app)/accounting` + `api/accounting/*`:
   - AccountingConnection + AccountingSnapshot + IntegrationSyncRun (نماذج جاهزة).
   - عرض القراءة فقط مع تخصيص «الربط بعدين» — يعرض placeholder الحالة + قاعدة القرار (لا كتابة فواتير/قيود).
7. **client data hooks** (`src/hooks/`): SWR أو react-query لجلب البيانات + cache + revalidation بعد server actions.
8. **البحث العام**: بحث عبر الشركات/المستندات/المهام في Topbar (يستخدم endpoints مُحوّطة).

## الفاز 5 — جسر Entix Books (مُهيأ، مؤجّل التفعيل)
**الهدف**: البنية جاهزة تعمل فور توفر entix.io دون إعادة كتابة.

1. إبقاء `src/server/entix-io.ts` + `/api/integrations/entix-io/status` مع تحسينات (timeout, retry, structured errors).
2. إضافة webhook receiver route `api/integrations/entix-io/webhook` يتحقق `ENTIX_IO_WEBHOOK_SECRET` (المفتاح موجود في env لكن غير مستخدم حالياً) — يُفعّل لاحقاً.
3. تحويل الـ bridge إلى خدمة `src/server/services/entix-io.ts` مع نوعة `AccountingSnapshot` جاهزة.
4. التوثيق: متى يُفعّل، وما القيم المطلوبة.

## الفاز 6 — النشر على Coolify + التحقق النهائي
**الهدف**: entix.app حيّ على VPS بأفضل صورة.

1. **`docker/Dockerfile`**: متعدد المراحل (deps → build → runtime) مع `pnpm`, Prisma generate, Next.js standalone output، تشغيل بصلاحية non-root.
2. **`docker/docker-compose.yml`**: للبناء/التشغيل محلياً (اختياري) + خدمة Postgres للتطوير المحلي (fallback فقط).
3. **`next.config.mjs`**: تفعيل `output: "standalone"` + `experimental.serverActions` + تحسين images.
4. **متغيرات البيئة في Coolify**: تعيين `DATABASE_URL` (app role), `MIGRATION_DATABASE_URL` (مستخدمة فقط في خطوة migration داخل الـ build)، `BETTER_AUTH_*`, `GOOGLE_*`, `NEXT_PUBLIC_APP_URL=https://entix.app`, `ENTIX_AUTH_MODE`, `ENTIX_ADMIN_EMAILS`.
5. **Coolify deployment**: إنشاء مشروع + service من Dockerfile/Git repo، ربط مجال `entix.app` عبر Cloudflare DNS (لدينا `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`)، إصدار SSL تلقائي.
6. **Migration step في النشر**: تنفيذ `prisma migrate deploy` (بصلاحية migrator) قبل بدء التطبيق — عبر entrypoint script يفصل migrator عن app role.
7. **GitHub remote**: إنشاء repo عبر `gh` بـ `GITHUB_PAT` (اسم مقترح: `ensidex/entix-app`), ربط Coolify بالـ repo webhook للنشر التلقائي.
8. **التحقق النهائي**:
   - `pnpm typecheck` + `pnpm lint` + `pnpm test:unit` (vitest) + `pnpm test:e2e` (Playwright).
   - `pnpm build` ناجح.
   - `/api/health` يعيد DB reachable + auth flags + entix-io «غير مفعّل».
   - `/login` يعرض زر Google يعمل.
   - `/dashboard` وكل صفحات P1 تعمل بعد تسجيل الدخول.
   - audit events تُسجّل للأفعال الحرجة.
   - Production Readiness Checklist من `docs/ENTX-MANG-EXECUTION-PLAN.md` مكتمل.
9. **التوثيق النهائي**: تحديث `README.md` (setup, env, deploy)، `docs/ARCHITECTURE.md`, `docs/API.md`.

## القيود المُلتزم بها (من AGENTS.md)
- Entix.app ≠ Entix Books ≠ Vita. Google login عبر backend فقط. signup invite-only. Frontend لا يصل Postgres مباشرة. لا Logto. أدوار DB: app/migrator/n8n. Prisma migrations فقط. Better Auth 1.2. PostgreSQL `entix_app_core`.
- لا كتابة في `_Codex_Projects`. كل الكود داخل مسار المشروع الرسمي فقط.
- لا طباعة/إيداع قيم سرية في git؛ `.env` محلي فقط.

## ترتيب التنفيذ المُقترح
الفاز 0 → 1 → 3 (موازٍ مع 2) → 2 → 4 → 5 → 6.
(نبدأ بالنظافة وgit، ثم DB، ثم الأمان والتصميم، ثم P1، ثم الجسر، ثم النشر والتحقق.)

## ملاحظات مخاطر
- قد تتطلب Coolify API صلاحيات إضافية على التوكين — سأتحقق وأطلب إن نقص.
- إن لم يتوفر Postgres resource في Coolify، البديل: تشغيل Postgres كحاوية Docker على نفس الخادم (docker-compose) — نفس الأدوار.
- Google OAuth يحتاج إضافة redirect URIs في Google Cloud Console (يمكنني إرشادك أو استخدام بيانات الـ OAuth المتاحة لتحديثها).
- أي قيم مفقودة (مثل redirect URI النهائي) سأطلبها عند الحاجة.