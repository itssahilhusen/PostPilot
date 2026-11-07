import { NextRequest, NextResponse } from "next/server";
import { getSavedBrandKit, saveBrandKit, DEFAULT_BRAND_KIT } from "@/lib/brand-kit-store";

export async function GET() {
  try {
    const kit = getSavedBrandKit() || DEFAULT_BRAND_KIT;
    return NextResponse.json({ brandKit: kit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveBrandKit(body);
    return NextResponse.json({ brandKit: updated, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
