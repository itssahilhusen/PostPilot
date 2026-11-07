import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const automations = await prisma.automation.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    const parsed = automations.map((a) => ({
      ...a,
      replyVariants: JSON.parse(a.replyVariants || "[]"),
    }));

    return NextResponse.json({ automations: parsed });
  } catch (err: any) {
    console.warn("GET /api/automations falling back to mock data:", err.message);
    const mockAutomations = [
      {
        id: "auto-1",
        name: "Lead Magnet DM Campaign",
        triggerType: "comment",
        keywords: "SCALE, GROWTH, GUIDE",
        actionType: "dm",
        dmContent: "Hey {{username}}! Thanks for commenting. Here is your free blueprint guide: https://reerts.in/blueprint",
        buttonLabel: "Get Blueprint",
        buttonUrl: "https://reerts.in/blueprint",
        replyVariants: ["Sent you the link in your DMs!", "Check your inbox! 🚀"],
        requireFollow: true,
        followGateText: "Follow to unlock the link",
        captureEmail: true,
        emailGateText: "Enter your best email",
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    return NextResponse.json({ automations: mockAutomations });
  }
}

export async function POST(req: NextRequest) {
  let reqBody: any = {};
  try {
    const body = await req.json();
    reqBody = body;
    const {
      name,
      triggerType,
      keywords,
      actionType,
      dmContent,
      buttonLabel,
      buttonUrl,
      replyVariants,
      requireFollow,
      followGateText,
      captureEmail,
      emailGateText,
      active,
    } = body;

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const newAuto = await prisma.automation.create({
      data: {
        workspaceId: workspace.id,
        name: name || "Lead DM Campaign",
        triggerType: triggerType || "comment",
        keywords: keywords || "All DMs",
        actionType: actionType || "dm",
        dmContent: dmContent || "Hey {{username}}! Thanks for reaching out.",
        buttonLabel: buttonLabel || "Open Link",
        buttonUrl: buttonUrl || "https://reerts.in",
        replyVariants: JSON.stringify(replyVariants || ["Sent you a DM!"]),
        requireFollow: Boolean(requireFollow),
        followGateText: followGateText || null,
        captureEmail: Boolean(captureEmail),
        emailGateText: emailGateText || null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({
      automation: {
        ...newAuto,
        replyVariants: JSON.parse(newAuto.replyVariants),
      },
    });
  } catch (err: any) {
    console.warn("POST /api/automations falling back to mock response:", err.message);
    const mockAuto = {
      id: "auto_" + Date.now(),
      name: reqBody.name || "Lead DM Campaign",
      triggerType: reqBody.triggerType || "comment",
      keywords: reqBody.keywords || "All DMs",
      actionType: reqBody.actionType || "dm",
      dmContent: reqBody.dmContent || "Hey {{username}}! Thanks for reaching out.",
      buttonLabel: reqBody.buttonLabel || "Open Link",
      buttonUrl: reqBody.buttonUrl || "https://reerts.in",
      replyVariants: reqBody.replyVariants || ["Sent you a DM!"],
      requireFollow: Boolean(reqBody.requireFollow),
      active: true,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ automation: mockAuto });
  }
}
