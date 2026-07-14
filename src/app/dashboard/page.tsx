import { headers } from "next/headers";

import { LoginPanel } from "@/components/auth/LoginPanel";
import { EntixDashboard } from "@/components/dashboard/EntixDashboard";
import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";
import { getCompanyDashboard } from "@/server/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isAuthConfigured() && !isDevelopmentRuntime()) {
    return <LoginPanel googleConfigured={false} />;
  }

  if (isAuthConfigured()) {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({
      headers: headers()
    });

    if (!session) {
      const { redirect } = await import("next/navigation");
      redirect("/login");
    }
  }

  const data = await getCompanyDashboard();

  return <EntixDashboard data={data} authConfigured={isAuthConfigured()} />;
}
