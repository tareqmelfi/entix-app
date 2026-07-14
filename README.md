# Entix.app — منصة إدارة الشركات

Entix.app هو منصة إدارة الشركات للعمليات المنظمة، المستندات، الفريق، المهام، الحوكمة، والامتثال.

## التقنية

- **Next.js 14** App Router + React 18 + TypeScript strict
- **Tailwind CSS** مع نظام تصميم ENSIDEX موحّد (RTL/عربي)
- **Prisma 6** مع PostgreSQL متعدد المخططات (`auth`, `app`, `content`, `automation`, `audit`)
- **Better Auth 1.2** — تسجيل دخول Google فقط، دعوات بموجب
- **Docker** متعدد المراحل للنشر على Coolify VPS

## القيود

- Frontend لا يصل PostgreSQL مباشرة — عبر server-side فقط.
- أدوار DB: `entix_app_core_app` (runtime), `entix_app_core_migrator` (migrations), `entix_app_core_n8n` (مؤجل).
- التسجيل invite_only إلا بموافقة المدير.
- لا Logto. Google login عبر backend فقط.

## التطوير المحلي

```bash
# 1. تثبيت الحزم
pnpm install

# 2. إعداد .env (انسخ من .env.example واملأ القيم)
cp .env.example .env
# أو استخدم القيم من EN-SECRETS-MASTER.env

# 3. توليد Prisma client
pnpm prisma:generate

# 4. تشغيل migrations (يتطلب MIGRATION_DATABASE_URL)
pnpm prisma:migrate:dev --name init

# 5. تشغيل السيرفر
pnpm dev

# 6. فحص الأنواع
pnpm typecheck

# 7. الفحص
pnpm lint

# 8. الاختبارات
pnpm test:e2e    # Playwright
pnpm test:unit   # Vitest
```

## Docker محلي

```bash
docker compose -f docker/docker-compose.yml up -d
```

## النشر (Coolify)

1. اربط المستودع بـ Coolify.
2. أضف متغيرات البيئة (DATABASE_URL, MIGRATION_DATABASE_URL, BETTER_AUTH_*, GOOGLE_*).
3. Coolify سينفذ Dockerfile تلقائياً (multi-stage build).
4. الـ entrypoint ينفذ `prisma migrate deploy` ثم يشغل `node server.js`.

## المخططات (Schemas)

| Schema | المحتوى |
|--------|---------|
| `auth` | User, Session, Account, Verification (Better Auth) |
| `app` | Organization, Membership, InviteAllowlist, Company |
| `content` | CompanyDocument |
| `automation` | OperationTask, AccountingConnection, AccountingSnapshot, IntegrationSyncRun |
| `audit` | AuditEvent |

## الوحدات

- **لوحة التحكم** — صحة الكيان، المقاييس، المتطلبات، المستندات
- **ملف الشركة** — البيانات الأساسية، التسجيل، المتطلبات
- **المستندات** — مستودع المستندات والشهادات
- **الفريق** — الأعضاء، الأدوار، الدعوات
- **المهام** — لوحة Kanban للعمليات
- **الحوكمة** — سجل الأحداث وأدلة الامتثال
- **المحاسبة** — ربط Entix Books (قراءة فقط)

## جسر Entix Books

Entix.app يقرأ ملخصات مالية من Entix Books عبر API ولا يكتب فواتير أو قيود محاسبية.
الربط سيُفعّل لاحقاً عند جاهزية entix.io.
