import fs from "fs";
import path from "path";

export interface CoverrStockVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  posterUrl: string;
  videoUrl: string;
  previewUrl: string;
  duration: number;
}

let cachedApiKey: string | null = null;
const searchCache = new Map<string, { data: CoverrStockVideo[]; expiresAt: number }>();

function getCoverrApiKey(): string | null {
  if (cachedApiKey !== null) return cachedApiKey;
  if (process.env.COVERR_API_KEY) {
    cachedApiKey = process.env.COVERR_API_KEY.trim();
    return cachedApiKey;
  }

  // Try reading from .env in project root or apps/frontend
  const envCandidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "apps", "frontend", ".env"),
  ];

  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      try {
        const text = fs.readFileSync(p, "utf8");
        for (const line of text.split("\n")) {
          const match = line.match(/^COVERR_API_KEY\s*=\s*(.+)$/);
          if (match && match[1]) {
            cachedApiKey = match[1].trim().replace(/^["']|["']$/g, "");
            return cachedApiKey;
          }
        }
      } catch {}
    }
  }

  cachedApiKey = "";
  return null;
}

/**
 * Searches Coverr's stock video catalog for relevant B-roll clips.
 */
export async function searchCoverrVideos(
  query: string,
  limit: number = 4
): Promise<CoverrStockVideo[]> {
  const apiKey = getCoverrApiKey();
  if (!apiKey) {
    console.warn("[Coverr Client] COVERR_API_KEY not configured.");
    return [];
  }

  const cleanQuery = (query || "technology")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .join(" ") || "technology";

  const cacheKey = `${cleanQuery}_${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const url = `https://api.coverr.co/videos?query=${encodeURIComponent(
      cleanQuery
    )}&page=1&urls=true`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ApiKey: apiKey,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[Coverr Client] Search failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const hits: any[] = data.hits || [];

    const results = hits.slice(0, limit).map((hit: any) => ({
      id: hit.id || hit.objectID || `cov_${Math.random().toString(36).substring(2, 8)}`,
      title: hit.title || `${cleanQuery} stock footage`,
      thumbnailUrl: hit.thumbnail || hit.poster || "",
      posterUrl: hit.poster || hit.thumbnail || "",
      videoUrl: hit.urls?.mp4 || hit.urls?.mp4_download || "",
      previewUrl: hit.urls?.mp4_preview || hit.urls?.mp4 || "",
      duration: parseFloat(hit.duration) || 15,
    })).filter((hit: CoverrStockVideo) => Boolean(hit.videoUrl));

    searchCache.set(cacheKey, { data: results, expiresAt: Date.now() + 60 * 60 * 1000 });
    return results;
  } catch (err: any) {
    console.error("[Coverr Client] Search exception:", err.message);
    return [];
  }
}

