import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";
import { assertCanWrite } from "@/server/auth-guard";

export type CompanyProfile = {
  id: string;
  legalName: string;
  tradeName: string | null;
  jurisdiction: string;
  registrationNumber: string | null;
  taxNumber: string | null;
  status: string;
  healthScore: number;
  profileCompletion: number;
  organizationId: string;
  accountingExternalId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyRequirementRow = {
  id: string;
  title: string;
  area: string;
  status: string;
  severity: string;
  description: string | null;
};

const areaLabels: Record<string, string> = {
  BASIC_INFO: "المعلومات الأساسية",
  LEGAL_REGISTRATION: "القانونية والتسجيل",
  GOVERNANCE: "الحوكمة",
  FINANCE: "المالية",
  OPERATIONS: "العمليات",
  TECHNOLOGY: "التكنولوجيا",
  COMPLIANCE_RISK: "الامتثال والمخاطر"
};

export async function getCompanyById(
  ctx: AuthContext,
  companyId: string
): Promise<CompanyProfile | null> {
  if (!isDatabaseConfigured()) return null;
  if (!ctx.companyIds.includes(companyId)) return null;

  const company = await prisma.company.findUnique({
    where: { id: companyId }
  });

  if (!company) return null;
  return {
    ...company,
    registrationNumber: company.registrationNumber ?? null,
    taxNumber: company.taxNumber ?? null,
    accountingExternalId: company.accountingExternalId ?? null
  };
}

export async function getCompanyRequirements(
  ctx: AuthContext,
  companyId: string
): Promise<CompanyRequirementRow[]> {
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) return [];

  const requirements = await prisma.companyRequirement.findMany({
    where: { companyId },
    orderBy: [{ severity: "desc" }, { area: "asc" }]
  });

  return requirements.map((r) => ({
    id: r.id,
    title: r.title,
    area: areaLabels[r.area] ?? r.area,
    status: r.status,
    severity: r.severity,
    description: r.description ?? null
  }));
}

export async function updateCompany(
  ctx: AuthContext,
  companyId: string,
  data: {
    legalName?: string;
    tradeName?: string | null;
    jurisdiction?: string;
    registrationNumber?: string | null;
    taxNumber?: string | null;
  }
) {
  assertCanWrite(ctx);
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) {
    throw new Error("Company not found or access denied.");
  }

  return prisma.company.update({
    where: { id: companyId },
    data: {
      legalName: data.legalName,
      tradeName: data.tradeName,
      jurisdiction: data.jurisdiction,
      registrationNumber: data.registrationNumber,
      taxNumber: data.taxNumber
    }
  });
}
