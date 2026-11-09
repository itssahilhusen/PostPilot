import { NextRequest, NextResponse } from "next/server";
import { NewsSourcesService } from "@/lib/news-sources-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = NewsSourcesService.getStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

