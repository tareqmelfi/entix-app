import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";

export type AuditEventRow = {
  id: string;
  action: string;
  actorUserId: string | null;
  organizationId: string | null;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: Date;
};

export async function getAuditEvents(
  ctx: AuthContext,
  filters?: { action?: string; from?: Date; to?: Date },
  limit = 50
): Promise<AuditEventRow[]> {
  if (!isDatabaseConfigured()) return [];

  const events = await prisma.auditEvent.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(filters?.action && { action: filters.action }),
      ...(filters?.from && { createdAt: { gte: filters.from } }),
      ...(filters?.to && { createdAt: { lte: filters.to } })
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return events.map((e) => ({
    id: e.id,
    action: e.action,
    actorUserId: e.actorUserId ?? null,
    organizationId: e.organizationId ?? null,
    entityType: e.entityType,
    entityId: e.entityId ?? null,
    metadata: e.metadata as unknown,
    createdAt: e.createdAt
  }));
}

export async function recordAuditEvent(
  ctx: AuthContext,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>
) {
  if (!isDatabaseConfigured()) return;

  return prisma.auditEvent.create({
    data: {
      action,
      entityType,
      entityId: entityId ?? null,
      actorUserId: ctx.userId,
      organizationId: ctx.organizationId,
      metadata: (metadata ?? {}) as never
    }
  });
}
