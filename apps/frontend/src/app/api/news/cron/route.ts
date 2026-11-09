import { NextRequest, NextResponse } from "next/server";
import { NewsIngestionEngine } from "@/lib/news-ingestion-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is defined, verify bearer token
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[NewsCron] Starting scheduled 30-minute news ingestion batch...");
    const report = await NewsIngestionEngine.fetchAllActiveSources({
      concurrency: 5,
    });

    console.log(
      `[NewsCron] Ingestion finished. Attempted: ${report.total_sources_attempted}, Success: ${report.successful_sources}, Added: ${report.new_articles_added} in ${report.duration_ms}ms`
    );

    return NextResponse.json({
      status: "success",
      report,
    });
  } catch (err: any) {
    console.error("[NewsCron] Ingestion error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

