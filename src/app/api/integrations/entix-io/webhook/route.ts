import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Webhook receiver for Entix Books (entix.io) events.
 * Verifies the ENTIX_IO_WEBHOOK_SECRET header.
 *
 * NOTE: This endpoint is active but will not receive events until
 * Entix Books is configured and sends webhooks. For now it accepts
 * and acknowledges valid requests silently.
 */
export async function POST(request: NextRequest) {
  if (!env.ENTIX_IO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "");

  if (providedSecret !== env.ENTIX_IO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // TODO: When Entix Books is ready, process the webhook payload:
    // - Update AccountingSnapshot
    // - Update AccountingConnection.lastSyncAt
    // - Create IntegrationSyncRun record
    // - Record AuditEvent

    return NextResponse.json({
      received: true,
      event: body?.event ?? "unknown",
      message: "Webhook acknowledged (processing deferred until entix.io is live)."
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Webhook receiver is ready. Entix Books events will be processed when configured."
  });
}
