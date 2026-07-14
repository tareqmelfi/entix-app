import { headers } from "next/headers";

import { EntixDashboard } from "@/components/dashboard/EntixDashboard";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";
import { getCompanyDashboard } from "@/server/dashboard";
import {
  resolveAuthContext,
  shouldUseDevFallback,
  devFallbackContext
} from "@/server/auth-guard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isAuthConfigured() && !isDevelopmentRuntime()) {
    return <LoginPanel googleConfigured={false} />;
  }

  let companyId: string | undefined;

  if (shouldUseDevFallback()) {
    const ctx = devFallbackContext();
    companyId = ctx.companyIds[0];
  } else if (isAuthConfigured()) {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({ headers: headers() });

    if (!session) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }

    try {
      const ctx = await resolveAuthContext(session!.user.id, session!.user.email);
      companyId = ctx.companyIds[0];
    } catch {
      // No active membership — show dashboard in baseline mode.
    }
  }

  const data = await getCompanyDashboard(companyId);
  return <EntixDashboard data={data} authConfigured={isAuthConfigured()} />;
}
