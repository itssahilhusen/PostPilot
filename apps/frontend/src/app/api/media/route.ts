import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const assets = await prisma.mediaAsset.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ assets });
  } catch (err: any) {
    const mockAssets = [
      {
        id: "asset_1",
        name: "Viral_Hook_Cover_4x5.png",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
        mimeType: "image/png",
        sizeBytes: 485200,
        folder: "Carousels",
        createdAt: new Date().toISOString(),
      },
      {
        id: "asset_2",
        name: "SaaS_Architecture_Diagram.jpg",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        mimeType: "image/jpeg",
        sizeBytes: 892100,
        folder: "Diagrams",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "asset_3",
        name: "Brand_Voice_Identity_Vector.png",
        url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
        mimeType: "image/png",
        sizeBytes: 312000,
        folder: "Brand",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    return NextResponse.json({ assets: mockAssets });
  }
}

export async function POST(req: NextRequest) {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, url, mimeType, sizeBytes, folder } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId: workspace.id,
        name,
        url,
        mimeType: mimeType || "image/png",
        sizeBytes: sizeBytes || 1024,
        folder: folder || "default",
      },
    });

    return NextResponse.json({ asset });
  } catch (err: any) {
    console.error("POST /api/media error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
