import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { resolveVideoInputPath } from "@/lib/video-renderer";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } | Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawFilename = decodeURIComponent(resolvedParams.filename || "");
    const safeFilename = path.basename(rawFilename);

    const filePath = resolveVideoInputPath(safeFilename);
    if (!filePath || !fs.existsSync(filePath)) {
      return new NextResponse("Media file not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const fileEtag = `"${fileSize}_${Math.floor(stat.mtimeMs)}"`;

    // Handle Image requests (thumbnails / posters) with ETags and long-lived client caching
    if (safeFilename.endsWith(".jpg") || safeFilename.endsWith(".jpeg") || safeFilename.endsWith(".png")) {
      const ifNoneMatch = req.headers.get("if-none-match");
      if (ifNoneMatch && ifNoneMatch === fileEtag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: fileEtag,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }

      const imgStream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
      return new NextResponse(imgStream, {
        status: 200,
        headers: {
          "Content-Type": safeFilename.endsWith(".png") ? "image/png" : "image/jpeg",
          "Content-Length": String(fileSize),
          ETag: fileEtag,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    const isDownload = req.nextUrl.searchParams.get("download") === "1";
    const downloadName = req.nextUrl.searchParams.get("name") || safeFilename;
    const rangeHeader = req.headers.get("range");

    // Handle HTTP Range requests with non-blocking stream
    if (rangeHeader && !isDownload) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const maxChunk = 4 * 1024 * 1024; // 4MB chunks
      const requestedEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const end = Math.min(requestedEnd, start + maxChunk - 1, fileSize - 1);

      if (start >= fileSize || start < 0) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const rangeStream = Readable.toWeb(
        fs.createReadStream(filePath, { start, end })
      ) as ReadableStream;

      return new NextResponse(rangeStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=3600",
          ETag: fileEtag,
        },
      });
    }

    // Full file streaming (for download or non-range streaming) without buffering 100MB+ in memory
    const fileStream = Readable.toWeb(fs.createReadStream(filePath)) as ReadableStream;
    const headers: Record<string, string> = {
      "Content-Type": "video/mp4",
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": isDownload ? "no-cache" : "public, max-age=3600",
      ETag: fileEtag,
    };

    if (isDownload) {
      const cleanDownloadName = downloadName.replace(/[^a-zA-Z0-9._-]/g, "_");
      headers["Content-Disposition"] = `attachment; filename="${
        cleanDownloadName.endsWith(".mp4")
          ? cleanDownloadName
          : `${cleanDownloadName}.mp4`
      }"`;
    }

    return new NextResponse(fileStream, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("[Video Stream API] Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
