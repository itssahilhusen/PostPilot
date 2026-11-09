import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

// Smart image resolution upgrader to ensure high-definition master assets
function upgradeImageUrl(url: string): string {
  if (!url) return url;
  let res = url.trim();

  // Wikipedia / Wikimedia: Strip /thumb/ and trailing /###px-... to get the 4K+ original master
  if (res.includes("wikimedia.org") && res.includes("/thumb/")) {
    try {
      const u = new URL(res);
      u.host = "upload.wikimedia.org";
      u.pathname = u.pathname.replace(/\/thumb\/(.+)\/[^/]+$/, "/$1");
      u.search = "";
      res = u.toString();
    } catch {
      res = res.replace(/\/thumb\/(.+)\/[^/?#]+(\?.*)?$/, "/$1");
    }
  }

  // Medium CDN: Upgrade downscaled resize to 1600px
  res = res.replace(/\/resize:fit:\d+\//i, "/resize:fit:1600/");
  res = res.replace(/\/max\/\d+\//i, "/max/1600/");

  // Substack CDN: Upgrade downscaled width to 1600px
  res = res.replace(/\/w_\d+,/i, "/w_1600,");
  res = res.replace(/\/resize\/\d+x\//i, "/resize/1600x/");

  // Shopify: Upgrade small/medium/compact image crops to full _master
  res = res.replace(
    /_(?:pico|icon|thumb|small|compact|medium|large|grande|\d+x\d+)(\.[a-zA-Z0-9]+)(\?.*)?$/i,
    "_master$1$2"
  );

  // WordPress thumbnail crops e.g. -300x200.jpg -> .jpg
  const wpMatch = res.match(/^(.*)-(\d+)x(\d+)(\.[a-zA-Z0-9]+)(\?.*)?$/i);
  if (wpMatch) {
    const w = parseInt(wpMatch[2], 10);
    const h = parseInt(wpMatch[3], 10);
    if (w < 1200 || h < 1200) {
      res = wpMatch[1] + wpMatch[4] + (wpMatch[5] || "");
    }
  }

  // Strip or upgrade CDN downscaling query parameters (Unsplash, Cloudinary, Imgix, etc.)
  try {
    const u = new URL(res);
    const wParam = u.searchParams.get("w") || u.searchParams.get("width");
    if (wParam && parseInt(wParam, 10) < 800) {
      if (u.searchParams.has("w")) u.searchParams.set("w", "1600");
      if (u.searchParams.has("width")) u.searchParams.set("width", "1600");
      u.searchParams.delete("h");
      u.searchParams.delete("height");
      u.searchParams.delete("fit");
      u.searchParams.delete("resize");
      res = u.toString();
    }
  } catch {}

  return res;
}

// Extract the best, highest-resolution image from an HTML img tag, discarding avatars/icons/thumbnails
function extractImageCandidate(tag: string, baseUrl: string): { url: string; alt: string } | null {
  // 1. Tag-level dimensions check
  const widthMatch = tag.match(/\bwidth=["']?(\d+)/i);
  const heightMatch = tag.match(/\bheight=["']?(\d+)/i);
  if (widthMatch) {
    const w = parseInt(widthMatch[1], 10);
    if (w < 250) return null; // Discard tiny icons, avatars, badges (<250px)
  }
  if (heightMatch) {
    const h = parseInt(heightMatch[1], 10);
    if (h < 180) return null; // Discard tiny thumbnails, banners (<180px)
  }

  // 2. Class, id, and alt keyword blacklist
  const classMatch = tag.match(/\bclass=["']([^"']*)["']/i);
  const idMatch = tag.match(/\bid=["']([^"']*)["']/i);
  const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
  const tagAttrs = `${classMatch ? classMatch[1] : ""} ${idMatch ? idMatch[1] : ""} ${altMatch ? altMatch[1] : ""}`.toLowerCase();

  const junkKeywords = [
    "avatar", "author", "profile", "bio", "headshot", "byline", "gravatar",
    "user-pic", "user_pic", "writer", "contributor", "logo", "badge", "sponsor",
    "icon", "button", "emoji", "spinner", "advert", "tracking", "pixel", "share",
    "social", "reaction", "comment"
  ];
  if (junkKeywords.some((k) => tagAttrs.includes(k))) {
    return null;
  }

  const cleanAlt = altMatch ? decodeHtmlEntities(altMatch[1].trim()) : "";

  // 3. Inspect high-resolution custom attributes first
  const highResAttrs = [
    "data-orig-file",
    "data-large-file",
    "data-full-url",
    "data-zoom-src",
    "data-highres",
    "data-original",
    "data-full-src",
    "data-src-large",
    "data-url-large",
  ];
  for (const attr of highResAttrs) {
    const regex = new RegExp(`\\b${attr}=["']([^"']+)["']`, "i");
    const m = tag.match(regex);
    if (m && m[1] && !m[1].startsWith("data:")) {
      const resolved = resolveUrl(m[1].trim(), baseUrl);
      if (resolved) {
        return { url: upgradeImageUrl(resolved), alt: cleanAlt };
      }
    }
  }

  // 4. Parse srcset / data-srcset to select candidate with highest resolution width
  const srcsetMatch = tag.match(/\b(?:srcset|data-srcset)=["']([^"']+)["']/i);
  if (srcsetMatch && srcsetMatch[1]) {
    const candidates = srcsetMatch[1]
      .split(",")
      .map((entry) => {
        const parts = entry.trim().split(/\s+/);
        const url = parts[0];
        let width = 0;
        if (parts[1]) {
          const wMatch = parts[1].match(/^(\d+)w$/i);
          if (wMatch) width = parseInt(wMatch[1], 10);
          const xMatch = parts[1].match(/^(\d+(?:\.\d+)?)x$/i);
          if (xMatch) width = Math.round(parseFloat(xMatch[1]) * 800);
        }
        return { url, width };
      })
      .filter((c) => c.url && !c.url.startsWith("data:"));

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.width - a.width);
      if (candidates[0].width >= 500 || candidates[0].width === 0) {
        const resolved = resolveUrl(candidates[0].url, baseUrl);
        if (resolved) {
          return { url: upgradeImageUrl(resolved), alt: cleanAlt };
        }
      }
    }
  }

  // 5. Fallback to standard src / data-src
  const srcMatch = tag.match(/\b(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1] && !srcMatch[1].startsWith("data:")) {
    const rawSrc = srcMatch[1].trim();
    if (junkKeywords.some((k) => rawSrc.toLowerCase().includes(k))) {
      return null;
    }
    const resolved = resolveUrl(rawSrc, baseUrl);
    if (resolved) {
      return { url: upgradeImageUrl(resolved), alt: cleanAlt };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let rawUrl = (body.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "Please enter a web URL." },
        { status: 400 }
      );
    }

    // Auto prepend https:// if missing
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = "https://" + rawUrl;
    }

    if (!/^https?:\/\/\S+/i.test(rawUrl)) {
      return NextResponse.json(
        { error: "Please enter a valid URL." },
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

    // High-performance Fetch with Real Browser Headers and 6s Timeout
    let finalUrl = parsedUrl.href;
    let contentType = "";
    let html = "";
    let fallbackResult: ExtractionResult | null = null;

    try {
      const response = await fetch(finalUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "max-age=0",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
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
      }
    } catch (fetchErr: any) {
      console.warn("Direct fetch warning for URL:", finalUrl, fetchErr.message);
    }

    // Fallback: If direct fetch failed or returned minimal content, use universal proxy reader
    if (!html || html.length < 150) {
      try {
        const jinaUrl = `https://r.jina.ai/${finalUrl}`;
        const jinaRes = await fetch(jinaUrl, {
          headers: {
            "User-Agent": "PostPilot/1.0",
            Accept: "text/plain, text/markdown, */*",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (jinaRes.ok) {
          const jinaText = await jinaRes.text();
          if (jinaText && jinaText.length > 100) {
            const titleMatch = jinaText.match(/^Title:\s*(.+)$/m);
            const timeMatch = jinaText.match(/^Published Time:\s*(.+)$/m);
            const contentMatch = jinaText.match(/Markdown Content:\s*([\s\S]+)$/);

            const parsedTitle = titleMatch ? titleMatch[1].trim() : extractSiteName(finalUrl);
            const published = timeMatch ? timeMatch[1].trim() : null;
            const rawBody = contentMatch ? contentMatch[1].trim() : jinaText;

            // Extract candidate images from markdown links ![...](url)
            const mdImgMatches = rawBody.matchAll(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g);
            const fallbackImages: ExtractedImage[] = [];
            const seenFallbacks = new Set<string>();

            for (const m of mdImgMatches) {
              const rawImgUrl = m[1];
              const upgraded = upgradeImageUrl(rawImgUrl);
              const key = upgraded.toLowerCase().split("?")[0];
              if (
                !seenFallbacks.has(key) &&
                !/\.(svg|ico)$/i.test(upgraded) &&
                !/(avatar|author|bio|profile|headshot|icon|logo|badge|sponsor|advert)/i.test(upgraded)
              ) {
                seenFallbacks.add(key);
                fallbackImages.push({
                  url: upgraded,
                  alt: parsedTitle,
                  main: fallbackImages.length === 0,
                });
                if (fallbackImages.length >= 25) break;
              }
            }

            const cleanBody = rawBody
              .replace(/!\[.*?\]\(.*?\)/g, " ")
              .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
              .replace(/[#*`_>]/g, "")
              .replace(/\n{3,}/g, "\n\n")
              .trim();

            const wordCount = (cleanBody.match(/[\p{L}\p{N}]+/gu) || []).length;
            fallbackResult = {
              kind: "url",
              url: finalUrl,
              siteName: extractSiteName(finalUrl),
              title: parsedTitle,
              published,
              description: cleanBody.slice(0, 200),
              text: cleanBody,
              words: wordCount,
              image: fallbackImages[0]?.url || null,
              images: fallbackImages,
              via: "reader",
            };
          }
        }
      } catch (jinaErr: any) {
        console.warn("Proxy reader fallback warning:", jinaErr.message);
      }
    }

    if (fallbackResult) {
      if (urlCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = urlCache.keys().next().value;
        if (oldestKey) urlCache.delete(oldestKey);
      }
      urlCache.set(normalizedUrl, { data: fallbackResult, expiresAt: Date.now() + CACHE_TTL_MS });
      return NextResponse.json(fallbackResult);
    }

    if (!html || html.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not reach or extract content from this URL. Please verify the URL is public or paste the article text directly into the Text tab.",
        },
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
    const heroImageResolved = heroImageRaw ? resolveUrl(heroImageRaw, finalUrl) : null;
    const heroImage = heroImageResolved ? upgradeImageUrl(heroImageResolved) : null;
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

    // Candidate Images Collection with High-Resolution Upgrading & Noise Filtering
    // Strip author boxes, sidebars, related posts, comments before extracting article images
    const imageTargetHtml = targetHtml
      .replace(
        /<(?:div|section|aside|header|footer|figure|p|span)[^>]+(?:class|id)=["'][^"']*(?:author|byline|bio|profile|writer|contributor|avatar|user-info|editor|credit|about-the)[^"']*["'][\s\S]*?<\/(?:div|section|aside|header|footer|figure|p|span)>/gi,
        " "
      )
      .replace(
        /<(?:div|section|aside)[^>]+(?:class|id)=["'][^"']*(?:comment|discussion|reaction|reply|thread)[^"']*["'][\s\S]*?<\/(?:div|section|aside)>/gi,
        " "
      )
      .replace(
        /<(?:div|section|aside)[^>]+(?:class|id)=["'][^"']*(?:sidebar|widget|related|recommended|more-stories|popular|trending|promo|newsletter|subscribe|signup)[^"']*["'][\s\S]*?<\/(?:div|section|aside)>/gi,
        " "
      )
      .replace(
        /<(?:div|section|nav|ul)[^>]+(?:class|id)=["'][^"']*(?:share|social|follow|navbar|navigation|breadcrumb|menu)[^"']*["'][\s\S]*?<\/(?:div|section|nav|ul)>/gi,
        " "
      );

    const imgTags = imageTargetHtml.match(/<img[^>]+>/gi) || [];
    const candidateImages: ExtractedImage[] = [];
    const seenUrls = new Set<string>();

    if (heroImage) {
      candidateImages.push({ url: heroImage, alt: title, main: true });
      seenUrls.add(heroImage.toLowerCase().split("?")[0]);
    }

    for (const tag of imgTags) {
      const candidate = extractImageCandidate(tag, finalUrl);
      if (candidate && candidate.url) {
        const urlKey = candidate.url.toLowerCase().split("?")[0];
        if (
          !seenUrls.has(urlKey) &&
          !/\.(svg|ico)$/i.test(candidate.url) &&
          !/(avatar|logo|icon|tracking|pixel|badge|sponsor|advert)/i.test(candidate.url)
        ) {
          seenUrls.add(urlKey);
          candidateImages.push({
            url: candidate.url,
            alt: candidate.alt || title,
            main: false,
          });
          if (candidateImages.length >= 25) break;
        }
      }
    }

    // Also check <source> tags in <picture> elements for webp/avif/highres sources
    const sourceMatches = imageTargetHtml.matchAll(
      /<source[^>]+(?:srcset|data-srcset)=["']([^"']+)["'][^>]*>/gi
    );
    for (const sMatch of sourceMatches) {
      if (candidateImages.length >= 25) break;
      const srcset = sMatch[1];
      const candidates = srcset
        .split(",")
        .map((c) => c.trim().split(/\s+/)[0])
        .filter(Boolean);
      const bestUrl = candidates[candidates.length - 1];
      if (bestUrl && !bestUrl.startsWith("data:")) {
        const resolved = resolveUrl(bestUrl, finalUrl);
        if (resolved) {
          const upgraded = upgradeImageUrl(resolved);
          const urlKey = upgraded.toLowerCase().split("?")[0];
          if (
            !seenUrls.has(urlKey) &&
            !/\.(svg|ico)$/i.test(upgraded) &&
            !/(avatar|logo|icon|tracking|pixel|badge|sponsor|advert)/i.test(upgraded)
          ) {
            seenUrls.add(urlKey);
            candidateImages.push({
              url: upgraded,
              alt: title,
              main: false,
            });
          }
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
