import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId } = body;

    return NextResponse.json({
      success: true,
      accountId,
      syncedAt: new Date().toISOString(),
      status: "completed",
    });
  } catch (err: any) {
    console.error("POST /api/social-accounts/resync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
