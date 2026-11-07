import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { instruction } = body;

    const existing = await prisma.persona.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    const currentInstructions = existing.additionalInstructions ?? "";
    const updatedInstructions = currentInstructions
      ? `${currentInstructions}\n\n${instruction}`
      : instruction;

    const updated = await prisma.persona.update({
      where: { id },
      data: { additionalInstructions: updatedInstructions },
    });

    return NextResponse.json({ success: true, persona: updated });
  } catch (err: any) {
    console.error("POST additional-instructions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
