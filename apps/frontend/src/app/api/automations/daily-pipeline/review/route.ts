import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rawPrisma } from "@/lib/prisma";
import { getPostWorkspace, postInput } from "@/lib/post-api";
import { resolveDestinations, schedulingError } from "@/lib/destinations";

export function GET(req: NextRequest) {
  return NextResponse.redirect(new URL("/calendar?review=1", req.url));
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Workspace authentication required" }, { status: 401 });
    const input = postInput.extend({ action: z.enum(["approve", "reject"]), postId: z.string().min(1) }).safeParse(await req.json());
    if (!input.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });
    const { postId, action, content, mediaUrls = [], channelIds, scheduledAt } = input.data;
    const where = { id: postId, workspaceId, status: { in: ["PENDING_APPROVAL", "PENDING_REVIEW"] } };
    if (action === "reject") {
      const rejected = await rawPrisma.post.updateMany({ where, data: { status: "DRAFT", scheduledAt: null } });
      return NextResponse.json({ success: !!rejected.count }, { status: rejected.count ? 200 : 409 });
    }
    if (!scheduledAt || Date.parse(scheduledAt) <= Date.now() || !content?.trim()) return NextResponse.json({ error: "Choose a future time and caption" }, { status: 400 });
    const channels = await resolveDestinations(workspaceId, channelIds, undefined, "SCHEDULED", mediaUrls);
    const changed = await rawPrisma.$transaction(async tx => {
      const updated = await tx.post.updateMany({ where, data: { content, mediaUrls: JSON.stringify(mediaUrls), platforms: JSON.stringify([...new Set(channels.map(c => c.provider))]), status: "SCHEDULED", scheduledAt } });
      if (!updated.count) return false;
      await tx.postChannel.deleteMany({ where: { postId, workspaceId, status: "PENDING" } });
      await tx.postChannel.createMany({ data: channels.map(c => ({ postId, workspaceId, accountId: c.id, scheduledAt })) });
      return true;
    });
    return NextResponse.json(changed ? { success: true } : { error: "Draft already reviewed or unavailable" }, { status: changed ? 200 : 409 });
  } catch (error) { return schedulingError(error) || NextResponse.json({ error: "Could not save review" }, { status: 500 }); }
}
