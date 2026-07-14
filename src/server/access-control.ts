import { APIError } from "better-auth/api";

import { env, parseEmailList } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const adminEmails = parseEmailList(env.ENTIX_ADMIN_EMAILS);

export async function assertSignupAllowed(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (adminEmails.has(normalizedEmail)) {
    return;
  }

  if (env.ENTIX_AUTH_MODE === "admin_only") {
    throw new APIError("FORBIDDEN", {
      message: "Entix.app access is restricted to approved admins."
    });
  }

  if (env.ENTIX_AUTH_MODE === "open") {
    return;
  }

  const invite = await prisma.inviteAllowlist.findUnique({
    where: { email: normalizedEmail },
    select: {
      status: true,
      expiresAt: true
    }
  });

  const isInviteActive =
    invite?.status === "ACTIVE" && (!invite.expiresAt || invite.expiresAt > new Date());

  if (!isInviteActive) {
    throw new APIError("FORBIDDEN", {
      message: "Entix.app signup is invite-only."
    });
  }
}

export async function attachInvitedMembership(userId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const invite = await prisma.inviteAllowlist.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      organizationId: true,
      role: true,
      status: true
    }
  });

  if (!invite?.organizationId || invite.status !== "ACTIVE") {
    return;
  }

  await prisma.$transaction([
    prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId,
          organizationId: invite.organizationId
        }
      },
      update: {
        role: invite.role,
        status: "ACTIVE"
      },
      create: {
        userId,
        organizationId: invite.organizationId,
        role: invite.role
      }
    }),
    prisma.inviteAllowlist.update({
      where: { id: invite.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date()
      }
    })
  ]);
}
