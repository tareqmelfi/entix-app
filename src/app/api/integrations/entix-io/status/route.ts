import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { isAuthConfigured, isDevelopmentRuntime } from "@/lib/env";
import { getEntixIoBridgeStatus } from "@/server/entix-io";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthConfigured() && !isDevelopmentRuntime()) {
    return NextResponse.json(
      { error: "Authentication is not configured for this deployment." },
      { status: 503 }
    );
  }

  if (isAuthConfigured()) {
    const { auth } = await import("@/lib/auth");
    const session = await auth.api.getSession({
      headers: headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json(await getEntixIoBridgeStatus());
}
