import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { getVideosDir } from "@/lib/video-renderer";
import { probeVideoDuration } from "@/lib/groq-transcriber";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const uploadId = "upl_" + Math.random().toString(36).substring(2, 9);
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const savedFileName = `${uploadId}_${cleanName}`;

      const uploadDir = getVideosDir();
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, savedFileName);
      const writeStream = fs.createWriteStream(filePath);
      const readable = Readable.fromWeb(file.stream() as any);
      await pipeline(readable, writeStream);

      // Never invent a duration when the media probe fails: later scene timing
      // and FFmpeg rendering both depend on this value being real.
      let probedDur: number;
      try {
        probedDur = await probeVideoDuration(filePath);
      } catch (error) {
        try { fs.unlinkSync(filePath); } catch {}
        throw error;
      }

      const publicPath = `/uploads/videos/${savedFileName}`;

      return NextResponse.json({
        upload: {
          id: uploadId,
          path: publicPath,
          filename: file.name,
          size: file.size,
          duration: probedDur,
          width: 1080,
          height: 1920,
        },
      });
    }

    // JSON upload request
    const body = await req.json().catch(() => ({}));
    const uploadId = "upl_" + Math.random().toString(36).substring(2, 9);
    return NextResponse.json({
      upload: {
        id: uploadId,
        path: body.path || `/uploads/videos/${uploadId}.mp4`,
        duration: body.duration || 30.0,
      },
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
