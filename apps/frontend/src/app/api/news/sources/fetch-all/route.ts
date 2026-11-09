import { NextRequest, NextResponse } from "next/server";
import { NewsIngestionEngine } from "@/lib/news-ingestion-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const category = body.category || "all";
    const limit = typeof body.limit === "number" ? body.limit : undefined;

    const report = await NewsIngestionEngine.fetchAllActiveSources({
      category: category === "all" ? undefined : category,
      limit,
      concurrency: 5,
    });

    return NextResponse.json({ report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

