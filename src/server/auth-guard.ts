import "server-only";

import { APIError } from "better-auth/api";

import type { MembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";

export type AuthContext = {
  userId: string;
  email: string;
  organizationId: string;
  role: MembershipRole;
  companyIds: string[];
};

/**
 * Returns the active membership for the given session user.
 * Throws APIError if no active membership exists.
 *
 * NOTE: This is a server-side helper that must be called from a
 * route/page that already resolved a Better Auth session.
 */
export async function resolveAuthContext(
  userId: string,
  email: string
): Promise<AuthContext> {
  const membership = await prisma.membership.findFirst({
    where: { userId, status: "ACTIVE" },
    select: {
      organizationId: true,
      role: true,
      organization: {
        select: {
          companies: { select: { id: true } }
        }
      }
    }
  });

  if (!membership) {
    throw new APIError("FORBIDDEN", {
      message: "No active membership found for this user."
    });
  }

  return {
    userId,
    email,
    organizationId: membership.organizationId,
    role: membership.role,
    companyIds: membership.organization.companies.map((c) => c.id)
  };
}

const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  PLATFORM_ADMIN: 100,
  ORGANIZATION_ADMIN: 80,
  OPERATIONS_MANAGER: 60,
  OPERATIONS_MEMBER: 40,
  FINANCE_VIEWER: 30,
  AUDITOR_READONLY: 20
};

export function hasRole(ctx: AuthContext, ...allowed: MembershipRole[]): boolean {
  return allowed.some((role) => ctx.role === role);
}

export function isAdmin(ctx: AuthContext): boolean {
  return hasRole(ctx, "PLATFORM_ADMIN", "ORGANIZATION_ADMIN");
}

export function canWrite(ctx: AuthContext): boolean {
  return hasRole(
    ctx,
    "PLATFORM_ADMIN",
    "ORGANIZATION_ADMIN",
    "OPERATIONS_MANAGER",
    "OPERATIONS_MEMBER"
  );
}

export function canReadFinance(ctx: AuthContext): boolean {
  return hasRole(
    ctx,
    "PLATFORM_ADMIN",
    "ORGANIZATION_ADMIN",
    "FINANCE_VIEWER",
    "AUDITOR_READONLY"
  );
}

export function assertCanWrite(ctx: AuthContext): void {
  if (!canWrite(ctx)) {
    throw new APIError("FORBIDDEN", {
      message: "You do not have write access."
    });
  }
}

export function assertCanReadFinance(ctx: AuthContext): void {
  if (!canReadFinance(ctx)) {
    throw new APIError("FORBIDDEN", {
      message: "You do not have finance read access."
    });
  }
}

/**
 * Fallback guard for dev runtime when auth is not configured.
 * Returns a dev context with PLATFORM_ADMIN for baseline mode.
 */
export function devFallbackContext(): AuthContext {
  return {
    userId: "dev-user",
    email: "dev@entix.app",
    organizationId: "dev-org",
    role: "PLATFORM_ADMIN",
    companyIds: []
  };
}

export function shouldUseDevFallback(): boolean {
  return isDevelopmentRuntime() && !isAuthConfigured();
}
