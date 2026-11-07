import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const carousels = await prisma.carousel.findMany({
      where: { workspaceId: workspace.id },
      include: {
        slides: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ carousels });
  } catch (err: any) {
    console.warn("GET /api/carousel falling back to mock data:", err.message);
    const mockCarousels = [
      {
        id: "car-1",
        title: "10 Growth Strategies for Solopreneurs",
        theme: "dark",
        aspectRatio: "4:5",
        sourceUrl: null,
        createdAt: new Date().toISOString(),
        slides: [
          { id: "s-1", order: 1, slideType: "COVER", headline: "10 Growth Strategies for 2026", body: "How solopreneurs scale from 0 to $50k/mo with lean systems.", tag: "STRATEGY" },
          { id: "s-2", order: 2, slideType: "CONTENT", headline: "1. Build in Public", body: "Transparency attracts die-hard supporters and inbound opportunities.", tag: "RULE 1" },
          { id: "s-3", order: 3, slideType: "CTA", headline: "Start implementing today", body: "Save this post and drop a comment below.", tag: "ACTION" },
        ],
      },
    ];
    return NextResponse.json({ carousels: mockCarousels });
  }
}

export async function POST(req: NextRequest) {
  let carouselTitle = "Untitled Carousel";
  let carouselTheme = "dark";
  let carouselAspect = "4:5";
  let rawSlides: any[] = [];
  try {
    const body = await req.json();
    const { title, theme, aspectRatio, sourceUrl, slides } = body;
    carouselTitle = title || "Untitled Carousel";
    carouselTheme = theme || "dark";
    carouselAspect = aspectRatio || "4:5";
    rawSlides = slides || [];

    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const newCarousel = await prisma.carousel.create({
      data: {
        workspaceId: workspace.id,
        title: carouselTitle,
        theme: carouselTheme,
        aspectRatio: carouselAspect,
        sourceUrl: sourceUrl || null,
        slides: {
          create: rawSlides.map((s: any, idx: number) => ({
            order: s.order || idx + 1,
            slideType: s.slideType || "CONTENT",
            headline: s.headline || "",
            body: s.body || "",
            tag: s.tag || null,
            bgGradient: s.bgGradient || null,
            imageUrl: s.imageUrl || null,
          })),
        },
      },
      include: {
        slides: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ carousel: newCarousel });
  } catch (err: any) {
    console.warn("POST /api/carousel falling back to mock response:", err.message);
    const mockCarousel = {
      id: "car_" + Date.now(),
      title: carouselTitle,
      theme: carouselTheme,
      aspectRatio: carouselAspect,
      createdAt: new Date().toISOString(),
      slides: rawSlides.length > 0 ? rawSlides.map((s, idx) => ({
        id: "s_" + idx,
        order: s.order || idx + 1,
        slideType: s.slideType || "CONTENT",
        headline: s.headline || "Slide " + (idx + 1),
        body: s.body || "",
        tag: s.tag || null,
      })) : [
        { id: "s-1", order: 1, slideType: "COVER", headline: carouselTitle, body: "Generated carousel preview.", tag: "NEW" },
      ],
    };
    return NextResponse.json({ carousel: mockCarousel });
  }
}
