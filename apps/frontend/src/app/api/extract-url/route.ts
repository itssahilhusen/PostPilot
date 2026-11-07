import { NextRequest, NextResponse } from "next/server";

interface ExtractedImage {
  url: string;
  alt?: string;
  main?: boolean;
}

interface ExtractionResult {
  kind: "url" | "pdf";
  url: string;
  siteName: string;
  title: string;
  published: string | null;
  description: string;
  text: string;
  words: number;
  image: string | null;
  images: ExtractedImage[];
  via: "reader" | "metadata";
  warning?: string;
  base64?: string;
}

// In-Memory High-Speed LRU Cache (TTL 2 Hours)
interface CacheEntry {
  data: ExtractionResult;
  expiresAt: number;
}
const urlCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_CACHE_ENTRIES = 500;

function cleanUrlForCache(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    // Strip common tracking and analytics parameters to maximize cache hit rate
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "ref",
      "source",
    ];
    trackingParams.forEach((param) => u.searchParams.delete(param));
    return u.toString();
  } catch {
    return rawUrl;
  }
}

// Clean and normalize text
function cleanText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.length : 0;
}

// HTML entity decoder
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

// Extract domain / hostname as friendly name
function extractSiteName(urlStr: string, ogSiteName?: string | null): string {
  if (ogSiteName && ogSiteName.trim()) return ogSiteName.trim();
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.replace(/^www\./, "");
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return "Web Source";
  }
}

// Resolve image URL
function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string | null {
  if (!relativeOrAbsolute || relativeOrAbsolute.startsWith("data:")) return null;
  try {
    const resolved = new URL(relativeOrAbsolute, baseUrl).href;
    if (!/^https?:\/\//i.test(resolved)) return null;
    return resolved;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url || "").trim();

    if (!rawUrl || !/^https?:\/\/\S+/i.test(rawUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid URL starting with http:// or https://" },
        { status: 400 }
      );
    }

    const normalizedUrl = cleanUrlForCache(rawUrl);

    // Fast Cache Check (< 1ms)
    const cached = urlCache.get(normalizedUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // High-performance Fetch with Real Browser Headers and 5s Timeout
    let finalUrl = parsedUrl.href;
    let contentType = "";
    let html = "";

    try {
      const response = await fetch(finalUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch web page (Status ${response.status})`);
      }

      finalUrl = response.url || finalUrl;
      contentType = response.headers.get("content-type") || "";

      // Direct PDF Handling
      if (
        contentType.includes("application/pdf") ||
        finalUrl.toLowerCase().endsWith(".pdf")
      ) {
        const buffer = await response.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");
        const fileName = finalUrl.split("/").pop() || "Document.pdf";
        const pdfResult: ExtractionResult = {
          kind: "pdf",
          url: finalUrl,
          siteName: extractSiteName(finalUrl),
          title: decodeURIComponent(fileName),
          published: null,
          description: "PDF Document extracted directly.",
          text: "",
          words: 0,
          image: null,
          images: [],
          via: "reader",
          base64: base64Data,
        };
        return NextResponse.json(pdfResult);
      }

      html = await response.text();
    } catch (fetchErr: any) {
      console.warn("Direct fetch error for URL:", finalUrl, fetchErr.message);
      return NextResponse.json(
        {
          error:
            fetchErr.message ||
            "Could not reach the website. Please check the URL or paste the article text directly.",
        },
        { status: 502 }
      );
    }

    if (!html || html.length < 50) {
      return NextResponse.json(
        { error: "The target webpage returned empty content." },
        { status: 422 }
      );
    }

    // 1. FAST METADATA EXTRACTION (OpenGraph & Twitter Cards)
    const ogTitleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    const ogDescMatch =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i);

    const ogSiteMatch = html.match(
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
    );
    const ogImageMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    const publishedMatch =
      html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<time[^>]+datetime=["']([^"']+)["']/i);

    let title = ogTitleMatch ? ogTitleMatch[1].trim() : titleTagMatch ? titleTagMatch[1].trim() : "";
    title = decodeHtmlEntities(title)
      .replace(/\s*[-|•–—]\s*[^|–—\n]+$/, "") // remove trailing site suffixes like " - TechCrunch"
      .trim();

    let description = ogDescMatch ? ogDescMatch[1].trim() : "";
    description = decodeHtmlEntities(description);

    const siteName = extractSiteName(finalUrl, ogSiteMatch ? ogSiteMatch[1] : null);
    const heroImageRaw = ogImageMatch ? ogImageMatch[1].trim() : null;
    const heroImage = heroImageRaw ? resolveUrl(heroImageRaw, finalUrl) : null;
    const published = publishedMatch ? publishedMatch[1].trim() : null;

    // 2. FAST JSON-LD EXTRACTION (Sub-millisecond direct structured data)
    let jsonLdBody = "";
    let jsonLdTitle = "";
    const jsonLdMatches = html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    );
    for (const match of jsonLdMatches) {
      try {
        const json = JSON.parse(match[1]);
        const checkItem = (item: any) => {
          if (!item) return;
          if (
            item["@type"] === "NewsArticle" ||
            item["@type"] === "BlogPosting" ||
            item["@type"] === "Article"
          ) {
            if (!jsonLdTitle && item.headline) jsonLdTitle = item.headline;
            if (item.articleBody && item.articleBody.length > jsonLdBody.length) {
              jsonLdBody = item.articleBody;
            }
          }
        };
        if (Array.isArray(json)) json.forEach(checkItem);
        else if (json["@graph"] && Array.isArray(json["@graph"])) json["@graph"].forEach(checkItem);
        else checkItem(json);
      } catch {
        // Skip unparseable JSON-LD blocks
      }
    }

    if (!title && jsonLdTitle) {
      title = decodeHtmlEntities(jsonLdTitle);
    }

    // 3. FAST READABILITY ARTICLE BODY EXTRACTION
    let cleanHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<aside[\s\S]*?<\/aside>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");

    // Focus on article container if available
    const articleContainerMatch =
      cleanHtml.match(/<article[\s\S]*?<\/article>/i) ||
      cleanHtml.match(/<main[\s\S]*?<\/main>/i) ||
      cleanHtml.match(
        /<div[^>]+class=["'][^"']*(?:article-body|post-content|entry-content|story-content)[^"']*["'][\s\S]*?<\/div>/i
      );

    const targetHtml = articleContainerMatch ? articleContainerMatch[0] : cleanHtml;

    // Candidate Images Collection
    const imgMatches = targetHtml.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi);
    const candidateImages: ExtractedImage[] = [];
    const seenUrls = new Set<string>();

    if (heroImage) {
      candidateImages.push({ url: heroImage, alt: title, main: true });
      seenUrls.add(heroImage);
    }

    for (const match of imgMatches) {
      const tag = match[0];
      const srcMatch = tag.match(/(?:src|data-src|data-original)=["']([^"']+)["']/i);
      const altMatch = tag.match(/alt=["']([^"']*)["']/i);
      if (srcMatch && srcMatch[1]) {
        const fullSrc = resolveUrl(srcMatch[1], finalUrl);
        if (
          fullSrc &&
          !seenUrls.has(fullSrc) &&
          !/\.(svg|ico)$/i.test(fullSrc) &&
          !/(avatar|logo|icon|tracking|pixel|badge|sponsor|advert)/i.test(fullSrc)
        ) {
          seenUrls.add(fullSrc);
          candidateImages.push({
            url: fullSrc,
            alt: altMatch ? decodeHtmlEntities(altMatch[1].trim()) : "",
            main: false,
          });
          if (candidateImages.length >= 20) break;
        }
      }
    }

    // Extract Paragraphs & Key Sections
    const paragraphs: string[] = [];
    const pMatches = targetHtml.matchAll(
      /<(?:p|h1|h2|h3|h4|li|blockquote)[^>]*>([\s\S]*?)<\/(?:p|h1|h2|h3|h4|li|blockquote)>/gi
    );
    for (const match of pMatches) {
      const pText = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ")).trim();
      if (
        pText.length >= 25 &&
        !/^(copyright|all rights reserved|privacy policy|terms of service|sign up|subscribe|read more|advertisement)/i.test(
          pText
        )
      ) {
        paragraphs.push(pText);
      }
    }

    let articleBody = jsonLdBody.length > 250 ? jsonLdBody : paragraphs.join("\n\n");
    if (!articleBody && description) {
      articleBody = description;
    }
    articleBody = cleanText(articleBody);

    const wordCount = countWords(articleBody);

    const result: ExtractionResult = {
      kind: "url",
      url: finalUrl,
      siteName: siteName,
      title: title || siteName,
      published: published,
      description: description,
      text: articleBody,
      words: wordCount,
      image: heroImage || (candidateImages[0] ? candidateImages[0].url : null),
      images: candidateImages,
      via: "reader",
    };

    // Store in LRU cache
    if (urlCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = urlCache.keys().next().value;
      if (oldestKey) urlCache.delete(oldestKey);
    }
    urlCache.set(normalizedUrl, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });

    // Respond immediately (< 1s execution)
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in /api/extract-url:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract web article" },
      { status: 500 }
    );
  }
}
