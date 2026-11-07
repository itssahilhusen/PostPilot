import { PrismaClient } from "@prisma/client";
import net from "net";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isDbReachable: boolean | null;
  lastDbCheckTime: number;
};

const rawPrisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = rawPrisma;

let isDbReachable: boolean | null = globalForPrisma.isDbReachable ?? null;
let lastCheckTime: number = globalForPrisma.lastDbCheckTime ?? 0;
const CHECK_INTERVAL = 30000; // 30s cache

export async function isDatabaseAvailable(timeoutMs = 80): Promise<boolean> {
  const now = Date.now();
  if (isDbReachable !== null && now - lastCheckTime < CHECK_INTERVAL) {
    return isDbReachable;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  let host = "localhost";
  let port = 5432;
  try {
    const url = new URL(dbUrl.replace(/^postgresql:/, "http:"));
    host = url.hostname || "localhost";
    port = parseInt(url.port || "5432", 10);
  } catch {}

  isDbReachable = await new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ port, host, timeout: timeoutMs }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });

  lastCheckTime = Date.now();
  globalForPrisma.isDbReachable = isDbReachable;
  globalForPrisma.lastDbCheckTime = lastCheckTime;
  return isDbReachable;
}

// Transparent Proxy that intercepts all model calls (e.g. prisma.workspace.findFirst(), prisma.post.findMany(), etc.)
// If DB is offline, immediately throws in 0ms without blocking for 4,000ms TCP timeout.
export const prisma = new Proxy(rawPrisma, {
  get(target: any, prop: string | symbol) {
    const orig = target[prop];
    // Intercept model properties like workspace, post, idea, competitor, brandVoice
    if (typeof prop === "string" && !prop.startsWith("$") && typeof orig === "object" && orig !== null) {
      return new Proxy(orig, {
        get(modelTarget: any, modelProp: string | symbol) {
          const modelMethod = modelTarget[modelProp];
          if (typeof modelMethod === "function") {
            return async (...args: any[]) => {
              const available = await isDatabaseAvailable();
              if (!available) {
                throw new Error("Database offline at localhost:5432 (mock fallback active)");
              }
              return modelMethod.apply(modelTarget, args);
            };
          }
          return modelMethod;
        },
      });
    }

    if (typeof orig === "function") {
      return async (...args: any[]) => {
        const available = await isDatabaseAvailable();
        if (!available) {
          throw new Error("Database offline at localhost:5432 (mock fallback active)");
        }
        return orig.apply(target, args);
      };
    }

    return orig;
  },
}) as PrismaClient;
