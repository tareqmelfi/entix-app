import { isAuthConfigured, isDatabaseConfigured, isGoogleAuthConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getEntixIoBridgeStatus } from "@/server/entix-io";

export async function getSystemHealth() {
  const checkedAt = new Date().toISOString();
  let database: {
    configured: boolean;
    reachable: boolean;
    message: string;
  } = {
    configured: isDatabaseConfigured(),
    reachable: false,
    message: "DATABASE_URL is not configured."
  };

  if (isDatabaseConfigured()) {
    try {
      await prisma.$queryRaw`select 1`;
      database = {
        configured: true,
        reachable: true,
        message: "Database is reachable."
      };
    } catch (error) {
      database = {
        configured: true,
        reachable: false,
        message: error instanceof Error ? error.message : "Unknown database error."
      };
    }
  }

  return {
    ok: database.reachable || !database.configured,
    checkedAt,
    app: {
      name: "Entix.app",
      database: "entix_app_core"
    },
    database,
    auth: {
      configured: isAuthConfigured(),
      googleConfigured: isGoogleAuthConfigured(),
      provider: "better-auth/google"
    },
    entixIo: await getEntixIoBridgeStatus()
  };
}
