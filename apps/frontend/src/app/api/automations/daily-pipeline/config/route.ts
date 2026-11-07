import { NextRequest, NextResponse } from "next/server";
import { getFlywheelConfig, saveFlywheelConfig } from "@/lib/flywheel-store";

export async function GET() {
  try {
    const config = getFlywheelConfig();
    return NextResponse.json({ config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveFlywheelConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

