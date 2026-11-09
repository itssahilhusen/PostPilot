import { NextRequest, NextResponse } from "next/server";
import { NewsSourcesService } from "@/lib/news-sources-service";
import { NewsIngestionEngine } from "@/lib/news-ingestion-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const source = NewsSourcesService.getSourceById(params.id);
    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    const result = await NewsIngestionEngine.fetchSource(source);
    const updatedSource = NewsSourcesService.getSourceById(params.id);

    return NextResponse.json({
      success: result.success,
      fetched: result.fetched,
      added: result.added,
      error: result.error,
      source: updatedSource,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

