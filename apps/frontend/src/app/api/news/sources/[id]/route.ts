import { NextRequest, NextResponse } from "next/server";
import { NewsSourcesService } from "@/lib/news-sources-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const source = NewsSourcesService.getSourceById(params.id);
    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    const allArticles = NewsSourcesService.getArticles();
    const sourceArticles = allArticles.filter((a) => a.source_id === source.id);
    const allLogs = NewsSourcesService.getLogs();
    const sourceLogs = allLogs.filter((l) => l.source_id === source.id).slice(0, 20);

    return NextResponse.json({
      source,
      articles_count: sourceArticles.length,
      recent_articles: sourceArticles.slice(0, 10),
      logs: sourceLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = NewsSourcesService.updateSource(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }
    return NextResponse.json({ source: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

