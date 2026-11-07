import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username = "alex_creator", comment = "Can you send the guide?" } = body;

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const automations = await prisma.automation.findMany({
      where: { workspaceId: workspace.id, active: true },
    });

    let matched = null;
    for (const a of automations) {
      if (a.keywords === "All DMs") {
        matched = a;
        break;
      }
      const kwList = a.keywords.toLowerCase().split(",").map((k) => k.trim());
      if (kwList.some((k) => comment.toLowerCase().includes(k))) {
        matched = a;
        break;
      }
    }

    if (!matched && automations.length > 0) {
      matched = automations[0];
    }

    if (!matched) {
      return NextResponse.json({
        matched: false,
        message: "No active automation matched this input.",
      });
    }

    const replyVariants = JSON.parse(matched.replyVariants || "[]");
    const chosenReply = replyVariants[Math.floor(Math.random() * replyVariants.length)] || "Sent you a DM!";
    const publicCommentReply = chosenReply.replace(/\{\{username\}\}/g, `@${username}`);
    const dmMessage = matched.dmContent.replace(/\{\{username\}\}/g, username);

    // Increment sent count
    await prisma.automation.update({
      where: { id: matched.id },
      data: { sentCount: { increment: 1 } },
    });

    return NextResponse.json({
      matched: true,
      automationName: matched.name,
      publicCommentReply,
      dmMessage,
      buttonLabel: matched.buttonLabel,
      buttonUrl: matched.buttonUrl,
      requireFollow: matched.requireFollow,
      followGateText: matched.followGateText,
    });
  } catch (err: any) {
    console.error("POST /api/automations/test error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
