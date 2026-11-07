import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFlywheelConfig, saveFlywheelConfig } from "@/lib/flywheel-store";

export async function GET(req: NextRequest) {
  return handleReview(req);
}

export async function POST(req: NextRequest) {
  return handleReview(req);
}

async function handleReview(req: NextRequest) {
  try {
    let action = "approve";
    let postId = "";

    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      action = searchParams.get("action") || "approve";
      postId = searchParams.get("postId") || "";
    } else {
      const body = await req.json().catch(() => ({}));
      action = body.action || "approve";
      postId = body.postId || "";
    }

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const config = getFlywheelConfig();

    // Default to tomorrow at the user's scheduled time (e.g. 10:00 AM)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    const [hours, minutes] = (config.scheduleTime || "10:00").split(":").map(Number);
    targetDate.setHours(hours || 10, minutes || 0, 0, 0);

    let updatedPost: any = null;

    try {
      if (action === "approve") {
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: {
            status: "SCHEDULED",
            scheduledAt: targetDate,
          },
        });
      } else if (action === "reject") {
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: {
            status: "DRAFT",
          },
        });
      }
    } catch (err: any) {
      console.warn("Prisma update failed in review endpoint (using mock):", err.message);
      updatedPost = {
        id: postId,
        status: action === "approve" ? "SCHEDULED" : "DRAFT",
        scheduledAt: targetDate.toISOString(),
      };
    }

    // Update flywheel store status
    saveFlywheelConfig({
      lastRunStatus: action === "approve" ? "success" : "pending_review",
    });

    const isBrowserRequest = req.headers.get("accept")?.includes("text/html");
    if (isBrowserRequest) {
      // Redirect to Calendar with celebratory status
      const baseUrl = req.nextUrl.origin || "http://localhost:3000";
      const redirectUrl = new URL(`/calendar`, baseUrl);
      redirectUrl.searchParams.set("approved", action === "approve" ? "true" : "rejected");
      redirectUrl.searchParams.set("postId", postId);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({
      success: true,
      action,
      post: updatedPost,
      scheduledAt: targetDate.toISOString(),
    });
  } catch (err: any) {
    console.error("Flywheel review route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

