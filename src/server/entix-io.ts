import { env } from "@/lib/env";

export type EntixIoBridgeStatus = {
  status: "not_configured" | "connected" | "unhealthy" | "error";
  apiUrl?: string;
  checkedAt: string;
  message: string;
};

export async function getEntixIoBridgeStatus(): Promise<EntixIoBridgeStatus> {
  const checkedAt = new Date().toISOString();

  if (!env.ENTIX_IO_API_URL) {
    return {
      status: "not_configured",
      checkedAt,
      message: "ENTIX_IO_API_URL is not configured."
    };
  }

  try {
    const response = await fetch(new URL("/health", env.ENTIX_IO_API_URL), {
      headers: env.ENTIX_IO_API_TOKEN
        ? {
            Authorization: `Bearer ${env.ENTIX_IO_API_TOKEN}`
          }
        : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });

    return {
      status: response.ok ? "connected" : "unhealthy",
      apiUrl: env.ENTIX_IO_API_URL,
      checkedAt,
      message: response.ok
        ? "Entix Books API is reachable."
        : `Entix Books API returned HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      status: "error",
      apiUrl: env.ENTIX_IO_API_URL,
      checkedAt,
      message: error instanceof Error ? error.message : "Unknown Entix Books bridge error."
    };
  }
}
