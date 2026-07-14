import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";
import { assertCanWrite } from "@/server/auth-guard";

export type TeamMemberRow = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: Date;
};

export type InviteRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
};

export async function getTeamMembers(ctx: AuthContext): Promise<TeamMemberRow[]> {
  if (!isDatabaseConfigured()) return [];

  const memberships = await prisma.membership.findMany({
    where: { organizationId: ctx.organizationId },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" }
  });

  return memberships.map((m) => ({
    id: m.id,
    userId: m.userId,
    email: m.user.email,
    name: m.user.name ?? null,
    role: m.role,
    status: m.status,
    createdAt: m.createdAt
  }));
}

export async function getInvites(ctx: AuthContext): Promise<InviteRow[]> {
  if (!isDatabaseConfigured()) return [];

  const invites = await prisma.inviteAllowlist.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { createdAt: "desc" }
  });

  return invites.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    status: i.status,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt ?? null
  }));
}

export async function createInvite(
  ctx: AuthContext,
  email: string,
  role: string
) {
  assertCanWrite(ctx);
  if (!isDatabaseConfigured()) return null;

  return prisma.inviteAllowlist.create({
    data: {
      email: email.trim().toLowerCase(),
      organizationId: ctx.organizationId,
      role: role as never,
      status: "ACTIVE"
    }
  });
}

export async function revokeInvite(ctx: AuthContext, inviteId: string) {
  assertCanWrite(ctx);
  if (!isDatabaseConfigured()) return;

  return prisma.inviteAllowlist.update({
    where: { id: inviteId },
    data: { status: "REVOKED" }
  });
}
