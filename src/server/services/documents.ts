import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";

export type DocumentRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  expiresAt: Date | null;
  storageKey: string | null;
  issuedAt: Date | null;
  updatedAt: Date;
};

const categoryLabels: Record<string, string> = {
  COMMERCIAL_REGISTRATION: "سجل تجاري",
  TAX_CERTIFICATE: "شهادة ضريبية",
  ARTICLES_OF_ASSOCIATION: "عقد التأسيس",
  BOARD_RESOLUTION: "قرار مجلس الإدارة",
  BANK_LETTER: "خطاب بنكي",
  NATIONAL_ADDRESS: "العنوان الوطني",
  OTHER: "أخرى"
};

export async function getDocuments(
  ctx: AuthContext,
  companyId: string,
  filters?: { category?: string; status?: string; search?: string }
): Promise<DocumentRow[]> {
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) return [];

  const documents = await prisma.companyDocument.findMany({
    where: {
      companyId,
      ...(filters?.category && { category: filters.category as never }),
      ...(filters?.status && { status: filters.status as never }),
      ...(filters?.search && {
        title: { contains: filters.search, mode: "insensitive" }
      })
    },
    orderBy: { updatedAt: "desc" }
  });

  return documents.map((d) => ({
    id: d.id,
    title: d.title,
    category: categoryLabels[d.category] ?? d.category,
    status: d.status,
    expiresAt: d.expiresAt ?? null,
    storageKey: d.storageKey ?? null,
    issuedAt: d.issuedAt ?? null,
    updatedAt: d.updatedAt
  }));
}

export async function createDocument(
  ctx: AuthContext,
  companyId: string,
  data: {
    title: string;
    category: string;
    status?: string;
    expiresAt?: Date | null;
    storageKey?: string | null;
  }
) {
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) {
    throw new Error("Company not found or access denied.");
  }

  return prisma.companyDocument.create({
    data: {
      companyId,
      title: data.title,
      category: data.category as never,
      status: (data.status ?? "MISSING") as never,
      expiresAt: data.expiresAt ?? null,
      storageKey: data.storageKey ?? null
    }
  });
}

export async function updateDocumentStatus(
  ctx: AuthContext,
  documentId: string,
  status: string
) {
  if (!isDatabaseConfigured()) return;

  return prisma.companyDocument.update({
    where: { id: documentId },
    data: { status: status as never }
  });
}
