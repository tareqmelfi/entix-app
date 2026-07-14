import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";
import { assertCanReadFinance } from "@/server/auth-guard";

export type AccountingConnectionRow = {
  id: string;
  provider: string;
  status: string;
  lastSyncAt: Date | null;
  lastError: string | null;
  companyId: string;
};

export type AccountingSnapshotRow = {
  id: string;
  period: string;
  currency: string;
  revenue: string;
  expenses: string;
  outstandingInvoices: string;
  complianceWarnings: number;
  source: string;
  capturedAt: Date;
};

export type IntegrationSyncRow = {
  id: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  recordsRead: number;
  recordsWritten: number;
  error: string | null;
};

export async function getAccountingConnections(
  ctx: AuthContext,
  companyId: string
): Promise<AccountingConnectionRow[]> {
  assertCanReadFinance(ctx);
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) return [];

  const connections = await prisma.accountingConnection.findMany({
    where: { companyId }
  });

  return connections.map((c) => ({
    id: c.id,
    provider: c.provider,
    status: c.status,
    lastSyncAt: c.lastSyncAt ?? null,
    lastError: c.lastError ?? null,
    companyId: c.companyId
  }));
}

export async function getAccountingSnapshots(
  ctx: AuthContext,
  companyId: string,
  limit = 12
): Promise<AccountingSnapshotRow[]> {
  assertCanReadFinance(ctx);
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) return [];

  const snapshots = await prisma.accountingSnapshot.findMany({
    where: { companyId },
    orderBy: { capturedAt: "desc" },
    take: limit
  });

  return snapshots.map((s) => ({
    id: s.id,
    period: s.period,
    currency: s.currency,
    revenue: s.revenue.toString(),
    expenses: s.expenses.toString(),
    outstandingInvoices: s.outstandingInvoices.toString(),
    complianceWarnings: s.complianceWarnings,
    source: s.source,
    capturedAt: s.capturedAt
  }));
}

export async function getIntegrationSyncRuns(
  ctx: AuthContext,
  companyId: string,
  limit = 10
): Promise<IntegrationSyncRow[]> {
  assertCanReadFinance(ctx);
  if (!isDatabaseConfigured() || !ctx.companyIds.includes(companyId)) return [];

  const connections = await prisma.accountingConnection.findMany({
    where: { companyId },
    select: { id: true }
  });
  const connectionIds = connections.map((c) => c.id);
  if (connectionIds.length === 0) return [];

  const runs = await prisma.integrationSyncRun.findMany({
    where: { connectionId: { in: connectionIds } },
    orderBy: { startedAt: "desc" },
    take: limit
  });

  return runs.map((r) => ({
    id: r.id,
    status: r.status,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt ?? null,
    recordsRead: r.recordsRead,
    recordsWritten: r.recordsWritten,
    error: r.error ?? null
  }));
}
