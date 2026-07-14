import {
  DocumentStatus,
  RequirementArea,
  RequirementSeverity,
  RequirementStatus
} from "@prisma/client";

import { isDatabaseConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getEntixIoBridgeStatus } from "@/server/entix-io";

export type ModuleProgress = {
  key: string;
  label: string;
  value: number;
  status: "good" | "warning" | "danger";
};

export type MissingRequirement = {
  title: string;
  area: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export type DocumentRow = {
  title: string;
  status: "VALID" | "EXPIRING_SOON" | "MISSING" | "REVIEW_REQUIRED";
  ageLabel: string;
};

export type DashboardData = {
  source: "database" | "baseline";
  company: {
    legalName: string;
    tradeName?: string | null;
    healthScore: number;
    profileCompletion: number;
  };
  summary: {
    urgent: number;
    dueSoon: number;
    completed: number;
  };
  modules: ModuleProgress[];
  missingRequirements: MissingRequirement[];
  documents: DocumentRow[];
  entixIo: {
    status: string;
    message: string;
  };
};

const areaLabels: Record<RequirementArea, string> = {
  BASIC_INFO: "المعلومات الأساسية",
  LEGAL_REGISTRATION: "القانونية والتسجيل",
  GOVERNANCE: "الحوكمة",
  FINANCE: "المالية",
  OPERATIONS: "العمليات",
  TECHNOLOGY: "التكنولوجيا",
  COMPLIANCE_RISK: "الامتثال والمخاطر"
};

const targetProgress: Record<RequirementArea, number> = {
  BASIC_INFO: 85,
  LEGAL_REGISTRATION: 60,
  GOVERNANCE: 40,
  FINANCE: 20,
  OPERATIONS: 70,
  TECHNOLOGY: 30,
  COMPLIANCE_RISK: 10
};

export async function getCompanyDashboard(companyId?: string): Promise<DashboardData> {
  if (!isDatabaseConfigured()) {
    return getBaselineDashboard();
  }

  try {
    const company = await prisma.company.findFirst({
      where: companyId ? { id: companyId } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        requirements: true,
        documents: {
          orderBy: { updatedAt: "desc" },
          take: 8
        },
        accountingConnections: true
      }
    });

    if (!company) {
      return getBaselineDashboard();
    }

    const missingRequirements = company.requirements
      .filter((requirement) => requirement.status !== RequirementStatus.COMPLETE)
      .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))
      .slice(0, 6)
      .map((requirement) => ({
        title: requirement.title,
        area: areaLabels[requirement.area],
        severity: requirement.severity
      }));

    const modules = Object.values(RequirementArea).map((area) => {
      const scoped = company.requirements.filter((requirement) => requirement.area === area);
      const complete = scoped.filter(
        (requirement) => requirement.status === RequirementStatus.COMPLETE
      ).length;
      const computed = scoped.length
        ? Math.round((complete / scoped.length) * 100)
        : targetProgress[area];

      return {
        key: area,
        label: areaLabels[area],
        value: computed,
        status: progressStatus(computed)
      };
    });

    const urgent = company.requirements.filter(
      (requirement) =>
        requirement.status !== RequirementStatus.COMPLETE &&
        (requirement.severity === RequirementSeverity.HIGH ||
          requirement.severity === RequirementSeverity.CRITICAL)
    ).length;

    const documents = company.documents.map((document) => ({
      title: document.title,
      status: document.status,
      ageLabel: document.updatedAt ? formatRelativeDays(document.updatedAt) : "غير محدد"
    }));

    const entixIo = await getEntixIoBridgeStatus();

    return {
      source: "database",
      company: {
        legalName: company.legalName,
        tradeName: company.tradeName,
        healthScore: company.healthScore,
        profileCompletion: company.profileCompletion
      },
      summary: {
        urgent,
        dueSoon: company.documents.filter((document) => document.status === DocumentStatus.EXPIRING_SOON)
          .length,
        completed: company.requirements.filter(
          (requirement) => requirement.status === RequirementStatus.COMPLETE
        ).length
      },
      modules,
      missingRequirements,
      documents,
      entixIo: {
        status: entixIo.status,
        message: entixIo.message
      }
    };
  } catch {
    return getBaselineDashboard();
  }
}

function getBaselineDashboard(): DashboardData {
  return {
    source: "baseline",
    company: {
      legalName: "Demo Operating Company LLC",
      tradeName: "DemoCo",
      healthScore: 73,
      profileCompletion: 45
    },
    summary: {
      urgent: 1,
      dueSoon: 1,
      completed: 3
    },
    modules: [
      { key: "BASIC_INFO", label: "المعلومات الأساسية", value: 85, status: "good" },
      { key: "LEGAL_REGISTRATION", label: "القانونية والتسجيل", value: 60, status: "warning" },
      { key: "GOVERNANCE", label: "الحوكمة", value: 40, status: "warning" },
      { key: "FINANCE", label: "المالية", value: 20, status: "danger" },
      { key: "OPERATIONS", label: "العمليات", value: 70, status: "good" },
      { key: "TECHNOLOGY", label: "التكنولوجيا", value: 30, status: "danger" },
      { key: "COMPLIANCE_RISK", label: "الامتثال والمخاطر", value: 10, status: "danger" }
    ],
    missingRequirements: [
      {
        title: "السجل التجاري",
        area: "القانونية والتسجيل",
        severity: "CRITICAL"
      },
      {
        title: "الرقم الضريبي",
        area: "القانونية والتسجيل",
        severity: "HIGH"
      },
      {
        title: "خطة الامتثال والمخاطر",
        area: "الامتثال والمخاطر",
        severity: "HIGH"
      }
    ],
    documents: [
      { title: "السجل التجاري", status: "MISSING", ageLabel: "غير مرفوع" },
      { title: "شهادة الرقم الضريبي", status: "REVIEW_REQUIRED", ageLabel: "منذ 28 يوم" },
      { title: "عقد التأسيس", status: "VALID", ageLabel: "منذ 143 يوم" },
      { title: "شهادة الغرفة التجارية", status: "VALID", ageLabel: "منذ 342 يوم" }
    ],
    entixIo: {
      status: "not_configured",
      message: "ENTIX_IO_API_URL is not configured."
    }
  };
}

function progressStatus(value: number): ModuleProgress["status"] {
  if (value >= 70) return "good";
  if (value >= 40) return "warning";
  return "danger";
}

function severityWeight(severity: RequirementSeverity) {
  const weights: Record<RequirementSeverity, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  return weights[severity];
}

function formatRelativeDays(date: Date) {
  const days = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (days === 0) return "اليوم";
  if (days === 1) return "منذ يوم";
  return `منذ ${days} يوم`;
}
