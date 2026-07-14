import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";
import { assertCanWrite } from "@/server/auth-guard";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  module: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  ownerUserId: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

const moduleLabels: Record<string, string> = {
  COMPANY_PROFILE: "ملف الشركة",
  DOCUMENTS: "المستندات",
  TEAM: "الفريق",
  GOVERNANCE: "الحوكمة",
  FINANCE: "المالية",
  OPERATIONS: "العمليات",
  TECHNOLOGY: "التكنولوجيا",
  COMPLIANCE: "الامتثال",
  INTEGRATIONS: "التكاملات"
};

const statusLabels: Record<string, string> = {
  OPEN: "مفتوح",
  IN_PROGRESS: "قيد التنفيذ",
  BLOCKED: "محظور",
  DONE: "مكتمل"
};

const priorityLabels: Record<string, string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  URGENT: "عاجلة"
};

export async function getTasks(
  ctx: AuthContext,
  companyId: string,
  filters?: { status?: string; priority?: string; module?: string }
): Promise<TaskRow[]> {
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) return [];

  const tasks = await prisma.operationTask.findMany({
    where: {
      companyId,
      ...(filters?.status && { status: filters.status as never }),
      ...(filters?.priority && { priority: filters.priority as never }),
      ...(filters?.module && { module: filters.module as never })
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }]
  });

  return tasks.map((t) => ({
    ...t,
    description: t.description ?? null,
    module: moduleLabels[t.module] ?? t.module,
    status: statusLabels[t.status] ?? t.status,
    priority: priorityLabels[t.priority] ?? t.priority,
    dueDate: t.dueDate ?? null,
    ownerUserId: t.ownerUserId ?? null
  }));
}

export async function createTask(
  ctx: AuthContext,
  companyId: string,
  data: {
    title: string;
    description?: string;
    module: string;
    priority?: string;
    dueDate?: Date | null;
    ownerUserId?: string | null;
  }
) {
  assertCanWrite(ctx);
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) {
    throw new Error("Company not found or access denied.");
  }

  return prisma.operationTask.create({
    data: {
      companyId,
      title: data.title,
      description: data.description ?? null,
      module: data.module as never,
      priority: (data.priority ?? "MEDIUM") as never,
      status: "OPEN" as never,
      dueDate: data.dueDate ?? null,
      ownerUserId: data.ownerUserId ?? null
    }
  });
}

export async function updateTaskStatus(
  ctx: AuthContext,
  taskId: string,
  status: string
) {
  assertCanWrite(ctx);
  if (!isDatabaseConfigured()) return;

  return prisma.operationTask.update({
    where: { id: taskId },
    data: { status: status as never }
  });
}
