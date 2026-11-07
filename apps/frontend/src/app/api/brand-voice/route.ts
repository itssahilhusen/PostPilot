import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    let voice = await prisma.brandVoice.findFirst({
      where: { workspaceId: workspace.id, isDefault: true },
    });

    if (!voice) {
      voice = await prisma.brandVoice.create({
        data: {
          workspaceId: workspace.id,
          name: "Alex Rivers - AI Tech Founder",
          formality: 30,
          directness: 85,
          humor: 45,
          targetAudience: "Founders, creators, and engineers looking to scale.",
          bannedWords: "delve, tapestry, synergy, revolutionize, unleash",
          isDefault: true,
        },
      });
    }

    return NextResponse.json({ brandVoice: voice });
  } catch (err: any) {
    console.warn("GET /api/brand-voice falling back to mock data:", err.message);
    const mockVoice = {
      id: "bv-default",
      name: "Alex Rivers - AI Tech Founder",
      formality: 30,
      directness: 85,
      humor: 45,
      targetAudience: "Founders, creators, and engineers looking to scale.",
      bannedWords: "delve, tapestry, synergy, revolutionize, unleash",
      isDefault: true,
    };
    return NextResponse.json({ brandVoice: mockVoice });
  }
}

export async function POST(req: NextRequest) {
  let requestBody: any = {};
  try {
    const body = await req.json();
    requestBody = body;
    const { name, formality, directness, humor, targetAudience, bannedWords } = body;

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const voice = await prisma.brandVoice.findFirst({
      where: { workspaceId: workspace.id, isDefault: true },
    });

    let updated;
    if (voice) {
      updated = await prisma.brandVoice.update({
        where: { id: voice.id },
        data: {
          name: name ?? voice.name,
          formality: formality ?? voice.formality,
          directness: directness ?? voice.directness,
          humor: humor ?? voice.humor,
          targetAudience: targetAudience ?? voice.targetAudience,
          bannedWords: bannedWords ?? voice.bannedWords,
        },
      });
    } else {
      updated = await prisma.brandVoice.create({
        data: {
          workspaceId: workspace.id,
          name: name || "Default Brand Voice",
          formality: formality ?? 30,
          directness: directness ?? 85,
          humor: humor ?? 45,
          targetAudience: targetAudience || "",
          bannedWords: bannedWords || "",
          isDefault: true,
        },
      });
    }

    return NextResponse.json({ brandVoice: updated });
  } catch (err: any) {
    console.warn("POST /api/brand-voice falling back to mock response:", err.message);
    const mockVoice = {
      id: "bv-default",
      name: requestBody.name || "Alex Rivers - AI Tech Founder",
      formality: requestBody.formality ?? 30,
      directness: requestBody.directness ?? 85,
      humor: requestBody.humor ?? 45,
      targetAudience: requestBody.targetAudience || "Founders, creators, and engineers looking to scale.",
      bannedWords: requestBody.bannedWords || "delve, tapestry, synergy, revolutionize, unleash",
      isDefault: true,
    };
    return NextResponse.json({ brandVoice: mockVoice });
  }
}
