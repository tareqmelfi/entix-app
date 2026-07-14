import "server-only";

import { headers } from "next/headers";

import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";
import type { AuthContext } from "@/server/auth-guard";
import {
  resolveAuthContext,
  shouldUseDevFallback,
  devFallbackContext
} from "@/server/auth-guard";

/**
 * Resolves the auth context for a server component / route handler.
 * Returns the AuthContext or null if unauthenticated.
 * In dev fallback mode (no auth configured), returns a dev context.
 */
export async function getPageAuthContext(): Promise<AuthContext | null> {
  if (shouldUseDevFallback()) {
    return devFallbackContext();
  }

  if (!isAuthConfigured() && !isDevelopmentRuntime()) {
    return null;
  }

  if (!isAuthConfigured()) {
    return null;
  }

  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: headers() });

  if (!session) return null;

  try {
    return await resolveAuthContext(session.user.id, session.user.email);
  } catch {
    return null;
  }
}
