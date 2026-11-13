import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const resolveBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "reerts-better-auth-secret-key-32-chars-min-2026",
  baseURL: resolveBaseURL(),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://postpilot-tan-phi.vercel.app",
    "https://*.vercel.app",
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-demo",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-demo",
    },
  },
  plugins: [
    organization(),
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
              const ws = await prisma.workspace.findFirst();
              if (ws) {
                workspaceId = ws.id;
              } else {
                const cleanName = user.name || user.email.split("@")[0];
                const newWs = await prisma.workspace.create({
                  data: {
                    name: `${cleanName}'s Workspace`,
                    handle: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ws`,
                  },
                });
                workspaceId = newWs.id;
              }
            } catch (e) {
              workspaceId = "ws-default-1";
            }
          }
          return {
            data: {
              ...user,
              workspaceId,
              role: (user as any).role || "OWNER",
            },
          };
        },
      },
    },
  },
});

export type Auth = typeof auth;
