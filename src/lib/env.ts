import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1).optional(),
  MIGRATION_DATABASE_URL: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(24).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  ENTIX_AUTH_MODE: z.enum(["invite_only", "admin_only", "open"]).default("invite_only"),
  ENTIX_ADMIN_EMAILS: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ENTIX_IO_API_URL: z.string().url().or(z.literal("")).optional(),
  ENTIX_IO_API_TOKEN: z.string().optional(),
  ENTIX_IO_WEBHOOK_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);

export function parseEmailList(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}

export function isGoogleAuthConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function isAuthConfigured() {
  return Boolean(env.BETTER_AUTH_SECRET && env.BETTER_AUTH_URL && isGoogleAuthConfigured());
}

export function isDevelopmentRuntime() {
  return env.NODE_ENV === "development";
}
