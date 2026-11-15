import { auth } from "@/lib/auth";
import { rawPrisma } from "@/lib/prisma";
import { z } from "zod";

export const postInput = z.object({
  title: z.string().max(300).optional(),
  content: z.string().max(100000).optional(),
  rawThreads: z.array(z.unknown()).optional(),
  mediaUrls: z.array(z.string().url()).max(20).optional(),
  platforms: z.array(z.string().min(1).max(40)).max(20).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PENDING_APPROVAL", "CANCELLED"]).optional(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
}).strict();

const workspaceCache = new Map<string, { workspaceId: string | null; expires: number }>();
const WORKSPACE_TTL_MS = 60_000;

export async function getPostWorkspace(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  const cached = workspaceCache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.workspaceId;
  }
  const user = await rawPrisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true } });
  const workspaceId = user?.workspaceId || null;
  workspaceCache.set(userId, { workspaceId, expires: Date.now() + WORKSPACE_TTL_MS });
  return workspaceId;
}

export function serializePost<T extends { rawThreads: string; mediaUrls: string; platforms: string }>(post: T) {
  return { ...post, rawThreads: JSON.parse(post.rawThreads || "[]"), mediaUrls: JSON.parse(post.mediaUrls || "[]"), platforms: JSON.parse(post.platforms || "[]") };
}
