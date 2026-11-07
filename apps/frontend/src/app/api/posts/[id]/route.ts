import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.content !== undefined) dataToUpdate.content = body.content;
    if (body.status !== undefined) {
      dataToUpdate.status = body.status;
      if (body.status === "PUBLISHED") {
        dataToUpdate.publishedAt = new Date();
      }
    }
    if (body.scheduledAt !== undefined) {
      dataToUpdate.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }
    if (body.platforms !== undefined) {
      dataToUpdate.platforms = JSON.stringify(body.platforms);
    }
    if (body.rawThreads !== undefined) {
      dataToUpdate.rawThreads = JSON.stringify(body.rawThreads);
    }
    if (body.mediaUrls !== undefined) {
      dataToUpdate.mediaUrls = JSON.stringify(body.mediaUrls);
    }

    const updated = await prisma.post.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      post: {
        ...updated,
        rawThreads: JSON.parse(updated.rawThreads || "[]"),
        mediaUrls: JSON.parse(updated.mediaUrls || "[]"),
        platforms: JSON.parse(updated.platforms || "[]"),
      },
    });
  } catch (err: any) {
    console.error("PATCH /api/posts/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.post.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("DELETE /api/posts/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
