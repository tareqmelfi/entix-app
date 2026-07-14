warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "automation";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "content";

-- CreateEnum
CREATE TYPE "app"."OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "app"."MembershipRole" AS ENUM ('PLATFORM_ADMIN', 'ORGANIZATION_ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS_MEMBER', 'FINANCE_VIEWER', 'AUDITOR_READONLY');

-- CreateEnum
CREATE TYPE "app"."MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "app"."InviteStatus" AS ENUM ('ACTIVE', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "app"."CompanyStatus" AS ENUM ('ACTIVE', 'ONBOARDING', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "app"."RequirementArea" AS ENUM ('BASIC_INFO', 'LEGAL_REGISTRATION', 'GOVERNANCE', 'FINANCE', 'OPERATIONS', 'TECHNOLOGY', 'COMPLIANCE_RISK');

-- CreateEnum
CREATE TYPE "app"."RequirementStatus" AS ENUM ('COMPLETE', 'IN_PROGRESS', 'MISSING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "app"."RequirementSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "content"."DocumentCategory" AS ENUM ('COMMERCIAL_REGISTRATION', 'TAX_CERTIFICATE', 'ARTICLES_OF_ASSOCIATION', 'BOARD_RESOLUTION', 'BANK_LETTER', 'NATIONAL_ADDRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "content"."DocumentStatus" AS ENUM ('VALID', 'EXPIRING_SOON', 'MISSING', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "automation"."OperationModule" AS ENUM ('COMPANY_PROFILE', 'DOCUMENTS', 'TEAM', 'GOVERNANCE', 'FINANCE', 'OPERATIONS', 'TECHNOLOGY', 'COMPLIANCE', 'INTEGRATIONS');

-- CreateEnum
CREATE TYPE "automation"."TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "automation"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "automation"."AccountingProvider" AS ENUM ('ENTIX_IO', 'MANUAL');

-- CreateEnum
CREATE TYPE "automation"."IntegrationStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'NEEDS_REAUTH', 'ERROR');

-- CreateEnum
CREATE TYPE "automation"."IntegrationRunStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "auth"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "app"."OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "countryCode" TEXT NOT NULL DEFAULT 'SA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Membership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "role" "app"."MembershipRole" NOT NULL DEFAULT 'OPERATIONS_MEMBER',
    "status" "app"."MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."InviteAllowlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "organizationId" UUID,
    "role" "app"."MembershipRole" NOT NULL DEFAULT 'OPERATIONS_MEMBER',
    "status" "app"."InviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteAllowlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."Company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "jurisdiction" TEXT NOT NULL DEFAULT 'SA',
    "registrationNumber" TEXT,
    "taxNumber" TEXT,
    "status" "app"."CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "healthScore" INTEGER NOT NULL DEFAULT 0,
    "profileCompletion" INTEGER NOT NULL DEFAULT 0,
    "accountingExternalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."CompanyRequirement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "area" "app"."RequirementArea" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "app"."RequirementStatus" NOT NULL DEFAULT 'MISSING',
    "severity" "app"."RequirementSeverity" NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content"."CompanyDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" "content"."DocumentCategory" NOT NULL,
    "status" "content"."DocumentStatus" NOT NULL DEFAULT 'MISSING',
    "storageKey" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "pageCount" INTEGER,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation"."OperationTask" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "module" "automation"."OperationModule" NOT NULL,
    "status" "automation"."TaskStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "automation"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "ownerUserId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation"."AccountingConnection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "provider" "automation"."AccountingProvider" NOT NULL DEFAULT 'ENTIX_IO',
    "externalTenantId" TEXT,
    "status" "automation"."IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountingConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation"."AccountingSnapshot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "revenue" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "outstandingInvoices" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "complianceWarnings" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'entix.io',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation"."IntegrationSyncRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connectionId" UUID NOT NULL,
    "status" "automation"."IntegrationRunStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "recordsRead" INTEGER NOT NULL DEFAULT 0,
    "recordsWritten" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "IntegrationSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."AuditEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "auth"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "auth"."session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "auth"."session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "auth"."account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "app"."Organization"("slug");

-- CreateIndex
CREATE INDEX "Membership_organizationId_role_idx" ON "app"."Membership"("organizationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_key" ON "app"."Membership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteAllowlist_email_key" ON "app"."InviteAllowlist"("email");

-- CreateIndex
CREATE INDEX "InviteAllowlist_organizationId_status_idx" ON "app"."InviteAllowlist"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Company_organizationId_status_idx" ON "app"."Company"("organizationId", "status");

-- CreateIndex
CREATE INDEX "CompanyRequirement_companyId_area_status_idx" ON "app"."CompanyRequirement"("companyId", "area", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRequirement_companyId_area_title_key" ON "app"."CompanyRequirement"("companyId", "area", "title");

-- CreateIndex
CREATE INDEX "CompanyDocument_companyId_category_status_idx" ON "content"."CompanyDocument"("companyId", "category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyDocument_companyId_category_title_key" ON "content"."CompanyDocument"("companyId", "category", "title");

-- CreateIndex
CREATE INDEX "OperationTask_companyId_module_status_idx" ON "automation"."OperationTask"("companyId", "module", "status");

-- CreateIndex
CREATE INDEX "AccountingConnection_companyId_status_idx" ON "automation"."AccountingConnection"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingConnection_companyId_provider_key" ON "automation"."AccountingConnection"("companyId", "provider");

-- CreateIndex
CREATE INDEX "AccountingSnapshot_companyId_capturedAt_idx" ON "automation"."AccountingSnapshot"("companyId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingSnapshot_companyId_period_source_key" ON "automation"."AccountingSnapshot"("companyId", "period", "source");

-- CreateIndex
CREATE INDEX "IntegrationSyncRun_connectionId_startedAt_idx" ON "automation"."IntegrationSyncRun"("connectionId", "startedAt");

-- CreateIndex
CREATE INDEX "AuditEvent_organizationId_createdAt_idx" ON "audit"."AuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "audit"."AuditEvent"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."InviteAllowlist" ADD CONSTRAINT "InviteAllowlist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."Company" ADD CONSTRAINT "Company_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."CompanyRequirement" ADD CONSTRAINT "CompanyRequirement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "app"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content"."CompanyDocument" ADD CONSTRAINT "CompanyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "app"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation"."OperationTask" ADD CONSTRAINT "OperationTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "app"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation"."AccountingConnection" ADD CONSTRAINT "AccountingConnection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "app"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation"."AccountingSnapshot" ADD CONSTRAINT "AccountingSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "app"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation"."IntegrationSyncRun" ADD CONSTRAINT "IntegrationSyncRun_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "automation"."AccountingConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."AuditEvent" ADD CONSTRAINT "AuditEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "app"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.3 -> 7.8.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

