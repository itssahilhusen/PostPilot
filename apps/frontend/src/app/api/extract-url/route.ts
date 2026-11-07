import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

interface ExtractedImage {
  url: string;
  alt?: string;
  main?: boolean;
}

interface ExtractionResult {
  kind: "url";
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

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch the target URL with realistic browser headers
    let html = "";
    let finalUrl = parsedUrl.href;
    try {
      const response = await fetch(finalUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch web page (Status ${response.status})`);
      }

      finalUrl = response.url || finalUrl;
      html = await response.text();
    } catch (fetchErr: any) {
      console.warn("Direct fetch failed for URL:", finalUrl, fetchErr.message);
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

    // 1. Meta / OpenGraph Extraction
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i);

    const ogSiteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    const publishedMatch = html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<time[^>]+datetime=["']([^"']+)["']/i);

    let title = ogTitleMatch ? ogTitleMatch[1].trim() : titleTagMatch ? titleTagMatch[1].trim() : "";
    title = title
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s*[-|•–—]\s*[^|–—\n]+$/, "") // remove trailing site suffixes like " - TechCrunch"
      .trim();

    let description = ogDescMatch ? ogDescMatch[1].trim() : "";
    description = description
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    const siteName = extractSiteName(finalUrl, ogSiteMatch ? ogSiteMatch[1] : null);
    const heroImageRaw = ogImageMatch ? ogImageMatch[1].trim() : null;
    const heroImage = heroImageRaw ? resolveUrl(heroImageRaw, finalUrl) : null;
    const published = publishedMatch ? publishedMatch[1].trim() : null;

    // 2. Structured JSON-LD extraction
    let jsonLdBody = "";
    const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const json = JSON.parse(match[1]);
        const checkItem = (item: any) => {
          if (!item) return;
          if (item["@type"] === "NewsArticle" || item["@type"] === "BlogPosting" || item["@type"] === "Article") {
            if (!title && item.headline) title = item.headline;
            if (item.articleBody && item.articleBody.length > jsonLdBody.length) {
              jsonLdBody = item.articleBody;
            }
          }
        };
        if (Array.isArray(json)) json.forEach(checkItem);
        else if (json["@graph"] && Array.isArray(json["@graph"])) json["@graph"].forEach(checkItem);
        else checkItem(json);
      } catch {
        // Ignore unparseable JSON-LD blocks
      }
    }

    // 3. Extract readable text from HTML body
    let cleanHtml = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<header[\s\S]*?<\/header>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");

    // Focus on article/main container if present
    const articleContainerMatch = cleanHtml.match(/<article[\s\S]*?<\/article>/i) ||
      cleanHtml.match(/<main[\s\S]*?<\/main>/i) ||
      cleanHtml.match(/<div[^>]+class=["'][^"']*(?:article-body|post-content|entry-content|story-content)[^"']*["'][\s\S]*?<\/div>/i);

    const targetHtml = articleContainerMatch ? articleContainerMatch[0] : cleanHtml;

    // Extract images with alt text
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
          !/(avatar|logo|icon|tracking|pixel|badge|sponsor)/i.test(fullSrc)
        ) {
          seenUrls.add(fullSrc);
          candidateImages.push({
            url: fullSrc,
            alt: altMatch ? altMatch[1].trim() : "",
            main: false,
          });
          if (candidateImages.length >= 16) break;
        }
      }
    }

    // Extract text paragraphs
    const paragraphs: string[] = [];
    const pMatches = targetHtml.matchAll(/<(?:p|h1|h2|h3|h4|li)[^>]*>([\s\S]*?)<\/(?:p|h1|h2|h3|h4|li)>/gi);
    for (const match of pMatches) {
      const pText = match[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();
      if (pText.length >= 25 && !/^(copyright|all rights reserved|privacy policy|terms of service|sign up|subscribe)/i.test(pText)) {
        paragraphs.push(pText);
      }
    }

    let articleBody = jsonLdBody.length > 200 ? jsonLdBody : paragraphs.join("\n\n");
    if (!articleBody && description) {
      articleBody = description;
    }

    articleBody = cleanText(articleBody);

    // If Gemini API is available and content is long or raw, enhance it with a clean synthesized structure
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (apiKey && apiKey.length > 5 && articleBody.length > 300) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
        const prompt = `You are an elite news summarizer for social media carousels.
Extract and synthesize the core story from this article into clear, engaging paragraphs with key bullet points, statistics, and takeaways.

Story Title: "${title}"
Source URL: "${finalUrl}"
Raw Article Content:
${articleBody.slice(0, 4500)}

Output Requirements:
- Start with a punchy 2-sentence summary hook.
- Then present 3 to 5 core bullet points highlighting key breakthroughs, statistics, or steps.
- Maintain journalistic accuracy; do not hallucinate numbers or facts.
- Output clean plain text without markdown headers.`;

        const aiResponse = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (aiResponse.text && aiResponse.text.trim().length > 100) {
          articleBody = cleanText(aiResponse.text);
        }
      } catch (aiErr: any) {
        console.warn("Gemini article synthesis skipped:", aiErr.message);
      }
    }

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

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in /api/extract-url:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract web article" },
      { status: 500 }
    );
  }
}

