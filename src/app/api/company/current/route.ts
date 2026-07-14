import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";
import { getCompanyDashboard } from "@/server/dashboard";
import { resolveAuthContext, shouldUseDevFallback, devFallbackContext } from "@/server/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthConfigured() && !isDevelopmentRuntime()) {
    return NextResponse.json(
      { error: "Authentication is not configured for this deployment." },
      { status: 503 }
    );
  }

  let companyIds: string[] = [];

  if (shouldUseDevFallback()) {
    const ctx = devFallbackContext();
    companyIds = ctx.companyIds;
  } else if (isAuthConfigured()) {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const ctx = await resolveAuthContext(session.user.id, session.user.email);
      companyIds = ctx.companyIds;
    } catch {
      return NextResponse.json({ error: "No active membership" }, { status: 403 });
    }
  }

  // Pass companyIds to scope the dashboard query (falls back to baseline if empty).
  const data = await getCompanyDashboard(companyIds[0]);
  return NextResponse.json(data);
}
