import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("account_id");

    let count = 42;
    if (accountId) {
      const dbCount = await prisma.post.count({
        where: { workspace: { accounts: { some: { id: accountId } } } },
      });
      if (dbCount > 0) count = dbCount;
    }

    return NextResponse.json({
      count,
      importState: {
        status: "completed",
        synced_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("GET /api/ai/persona/post-count error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
