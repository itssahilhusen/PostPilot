import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const current = await prisma.automation.findUnique({
      where: { id },
    });

    if (!current) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    const updated = await prisma.automation.update({
      where: { id },
      data: { active: !current.active },
    });

    return NextResponse.json({
      automation: {
        ...updated,
        replyVariants: JSON.parse(updated.replyVariants || "[]"),
      },
    });
  } catch (err: any) {
    console.error("POST /api/automations/[id]/toggle error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
