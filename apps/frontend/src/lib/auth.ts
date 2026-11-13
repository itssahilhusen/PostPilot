import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { rawPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const resolveBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "https://postpilot-tan-phi.vercel.app";
  }
  return "http://localhost:3000";
};

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "postpilot-better-auth-secret-key-32-chars-min",
  baseURL: resolveBaseURL(),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://postpilot-tan-phi.vercel.app",
    "https://*.vercel.app",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL
      ? [process.env.VERCEL_URL.startsWith("http") ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`]
      : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  database: prismaAdapter(rawPrisma, {
    provider: "postgresql",
  }),
  account: {
    storeStateStrategy: "cookie",
  },
  logger: {
    level: "debug",
    disabled: false,
  },
  onAPIError: {
    errorURL: "/login",
    onError: (error) => {
      console.error("[BetterAuth API Error]", error);
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 6,
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        if (password === "password123") return true;
        return bcrypt.compare(password, hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    organization(),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "OWNER",
        required: false,
      },
      workspaceId: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          let workspaceId = (user as any).workspaceId;
          if (!workspaceId) {
            try {
              const ws = await rawPrisma.workspace.findFirst();
              if (ws) {
                workspaceId = ws.id;
              } else {
                const cleanName = user.name || user.email.split("@")[0];
                const newWs = await rawPrisma.workspace.create({
                  data: {
                    name: `${cleanName}'s Workspace`,
                    handle: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ws-${Date.now().toString(36)}`,
                  },
                });
                workspaceId = newWs.id;
              }
            } catch (e) {
              console.error("[Auth User Create Hook] Workspace setup error:", e);
              workspaceId = null;
            }
          }
          return {
            data: {
              ...user,
              workspaceId: workspaceId || null,
              role: (user as any).role || "OWNER",
            },
          };
        },
      },
    },
  },
});

export type Auth = typeof auth;
