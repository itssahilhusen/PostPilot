import { NextResponse } from "next/server";
import { rawPrisma } from "./prisma";

export const deliverySelection = { select: { accountId: true, status: true, externalPostId: true, failureReason: true } } as const;
class InvalidDestination extends Error {}

export function schedulingError(error: unknown) {
  if (error instanceof InvalidDestination) return NextResponse.json({ error: error.message }, { status: 400 });
  if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
    return NextResponse.json({ error: "This channel already has a post at that time" }, { status: 409 });
  }
}

export async function resolveDestinations(workspaceId: string, ids: string[] | undefined, platforms: string[] | undefined, status: string, assets: string[]) {
  const scheduled = status === "SCHEDULED";
  if (!ids?.length && !scheduled) return [];
  if (!ids?.length && (!platforms?.length || ids)) throw new InvalidDestination("Select at least one connected channel");
  const rows = await rawPrisma.channel.findMany({ where: { workspaceId, status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }], accessToken: { not: null },
    ...(ids ? { id: { in: ids } } : { provider: { in: platforms } }) }, select: { id: true, provider: true } });
  if (ids && rows.length !== new Set(ids).size) throw new InvalidDestination("A selected channel is unavailable");
  if (!ids && platforms?.some(p => rows.filter(c => c.provider === p).length !== 1)) throw new InvalidDestination("Select specific connected channels in Calendar");
  if (scheduled) {
    if (rows.some(c => !["facebook", "instagram", "threads"].includes(c.provider))) throw new InvalidDestination("Select a Facebook, Instagram or Threads channel");
    if (rows.some(c => c.provider === "instagram") && !assets.length) throw new InvalidDestination("Attach an image or video for Instagram");
    if (assets.length > 10 || assets.some(a => !/^https:\/\//i.test(a))) throw new InvalidDestination("Use up to ten public HTTPS media URLs");
    if (rows.some(c => c.provider === "facebook") && assets.length > 1 && assets.some(a => /\.(mp4|mov|webm|m4v)$/i.test(new URL(a).pathname))) throw new InvalidDestination("Facebook supports one video or a set of photos");
  }
  return rows;
}

