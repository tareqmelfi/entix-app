import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env, isGoogleAuthConfigured } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { assertSignupAllowed, attachInvitedMembership } from "@/server/access-control";

const socialProviders = isGoogleAuthConfigured()
  ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!
      }
    }
  : {};

function resolveAuthSecret(): string {
  if (env.BETTER_AUTH_SECRET) return env.BETTER_AUTH_SECRET;
  if (env.NODE_ENV === "development") {
    return "dev-only-entix-app-secret-change-before-production";
  }
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

export const auth = betterAuth({
  appName: "Entix.app",
  baseURL: env.BETTER_AUTH_URL,
  secret: resolveAuthSecret(),
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: false
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"]
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          await assertSignupAllowed(user.email);
          return { data: user };
        },
        after: async (user) => {
          await attachInvitedMembership(user.id, user.email);
        }
      }
    }
  }
});
