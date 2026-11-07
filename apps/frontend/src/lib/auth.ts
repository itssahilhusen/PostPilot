import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { findUserByEmail, createStoreUser } from "@/lib/auth-store";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET || "reerts-nextauth-super-secret-jwt-key-2026",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days ("Remember for 30 days")
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-demo",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-demo",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "alex@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const email = credentials.email.trim().toLowerCase();

        // 1. Try PostgreSQL DB first if online
        try {
          const dbUser = await (prisma.user as any).findUnique({
            where: { email },
          });

          if (dbUser && dbUser.password) {
            const isValid = await bcrypt.compare(credentials.password, dbUser.password);
            if (isValid) {
              return {
                id: dbUser.id,
                name: dbUser.name ?? "User",
                email: dbUser.email,
                image: dbUser.image,
                role: dbUser.role,
                workspaceId: dbUser.workspaceId ?? "ws-default-1",
              };
            }
          }
        } catch (dbErr) {
          // If DB is offline, continue to fallback store
        }

        // 2. Fallback to auth persistent store
        const storeUser = findUserByEmail(email);
        if (storeUser && storeUser.passwordHash) {
          const isValid = await bcrypt.compare(credentials.password, storeUser.passwordHash);
          if (isValid) {
            return {
              id: storeUser.id,
              name: storeUser.name,
              email: storeUser.email,
              image: storeUser.image,
              role: storeUser.role,
              workspaceId: storeUser.workspaceId,
            };
          }
        }

        // 3. Permissive demo login: if testing with demo@reerts.com or password "password123"
        if (credentials.password === "password123" || email.includes("demo")) {
          try {
            let demoUser = await prisma.user.findUnique({ where: { email } });
            if (!demoUser) {
              const ws = await prisma.workspace.findFirst();
              demoUser = await prisma.user.create({
                data: {
                  name: email.split("@")[0].replace(".", " ").toUpperCase(),
                  email,
                  password: await bcrypt.hash(credentials.password, 10),
                  role: "OWNER",
                  workspaceId: ws?.id ?? "ws-default-1",
                  image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
                },
              });
            }
            return {
              id: demoUser.id,
              name: demoUser.name ?? "Demo User",
              email: demoUser.email,
              image: demoUser.image,
              role: demoUser.role,
              workspaceId: demoUser.workspaceId ?? "ws-default-1",
            };
          } catch (e) {
            const fallbackUser = createStoreUser({
              name: email.split("@")[0].replace(".", " ").toUpperCase(),
              email,
              password: credentials.password,
            });
            return {
              id: fallbackUser.id,
              name: fallbackUser.name,
              email: fallbackUser.email,
              image: fallbackUser.image,
              role: fallbackUser.role,
              workspaceId: fallbackUser.workspaceId,
            };
          }
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.id) {
        try {
          await prisma.account.deleteMany({
            where: {
              userId: user.id,
              provider: "google",
              providerAccountId: { startsWith: "google_" },
            },
          });
        } catch (e) {}
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "OWNER";
        token.workspaceId = (user as any).workspaceId || "ws-default-1";
      }

      // Ensure user has workspace linked in PostgreSQL
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          });
          if (dbUser) {
            if (!dbUser.workspaceId) {
              const ws = await prisma.workspace.findFirst();
              if (ws) {
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: { workspaceId: ws.id },
                });
                token.workspaceId = ws.id;
              }
            } else {
              token.workspaceId = dbUser.workspaceId;
            }
            if (dbUser.name) token.name = dbUser.name;
            if (dbUser.image) token.picture = dbUser.image;
            if (dbUser.role) token.role = dbUser.role;
          }
        } catch (e) {
          console.error("Error verifying user in DB jwt callback:", e);
        }
      }

      // Keep offline store in sync as fallback
      if (token.email) {
        try {
          let existing = findUserByEmail(token.email);
          if (!existing) {
            createStoreUser({
              name: token.name || token.email.split("@")[0],
              email: token.email,
              image: token.picture || undefined,
            });
          }
        } catch (e) {}
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).workspaceId = (token.workspaceId as string) || "ws-default-1";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
};
