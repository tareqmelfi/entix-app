import { NextResponse } from "next/server";

import { getSystemHealth } from "@/server/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getSystemHealth();
  return NextResponse.json(health, {
    status: health.database.configured && !health.database.reachable ? 503 : 200
  });
}
