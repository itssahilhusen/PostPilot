import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI, Type } from "@google/genai";
import { getFlywheelConfig, saveFlywheelConfig } from "@/lib/flywheel-store";
import { sendFlywheelNotification } from "@/lib/notifications";
import { getStoredIdeas } from "@/lib/sources-store";

interface ArticleCandidate {
  title: string;
  summary: string;
  link: string;
  source: string;
  publishedAt: string;
}

/**
 * Fallback seed articles if RSS is unreachable
 */
const SEED_ARTICLES: ArticleCandidate[] = [
  {
    title: "DeepSeek Unveils Next-Gen MoE Reasoning Architecture with 10x Compute Efficiency",
    summary: "A new sparse mixture-of-experts model architecture breaks previous reasoning benchmark records while slashing token inference cost by 85% compared to closed frontier models.",
    link: "https://tldr.tech/ai/2026-11-06",
    source: "TLDR AI",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Anthropic Releases Autonomous Computer Use Tooling for Production Workflows",
    summary: "Developers can now delegate multi-step browser and OS workflows to autonomous agents with deterministic verification scaffolding and automated regression tests.",
    link: "https://tldr.tech/tech/2026-11-06",
    source: "TLDR Tech",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "OpenAI Announces Native Real-Time Voice and Vision APIs for Mobile Developers",
    summary: "Bidirectional WebSocket streaming now enables sub-200ms conversational audio and camera comprehension natively on iOS and Android devices.",
    link: "https://tldr.tech/ai/2026-11-05",
    source: "TLDR AI",
    publishedAt: new Date().toISOString(),
  },
];

/**
 * Parses RSS items from an XML string using standard regex/DOM extractors
 */
function parseRssXml(xml: string, sourceName: string): ArticleCandidate[] {
  const items: ArticleCandidate[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
    const itemContent = match[1];
    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemContent);
    const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemContent);
    const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemContent);
    const pubDateMatch = /<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i.exec(itemContent);

    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    const link = linkMatch ? linkMatch[1].trim() : "";
    let summary = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";
    if (summary.length > 300) summary = summary.slice(0, 300) + "...";

    if (title && link) {
      items.push({
        title,
        link,
        summary: summary || title,
        source: sourceName,
        publishedAt: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
      });
    }
  }

  return items;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const config = getFlywheelConfig();

    // Allow overriding config parameters for manual "Test Run"
    const niche = body.niche || config.niche;
    const theme = body.theme || config.preferredTheme || "futuretech";
    const brandHandle = body.brandHandle || config.brandHandle || "@theaiseed";
    const webhookUrl = body.webhookUrl !== undefined ? body.webhookUrl : config.webhookUrl;
    const channel = body.notificationChannel || config.notificationChannel || "discord";
    const origin = req.nextUrl.origin || "http://localhost:3000";

    console.log(`[Flywheel Run] Starting daily run. Niche: "${niche}", Theme: "${theme}"`);

    // 1. Ingest fresh articles from TLDR or cached sources
    const candidateStories: ArticleCandidate[] = [];

    try {
      const [techRes, aiRes] = await Promise.allSettled([
        fetch("https://tldr.tech/api/rss/tech", { signal: AbortSignal.timeout(4000) }),
        fetch("https://tldr.tech/api/rss/ai", { signal: AbortSignal.timeout(4000) }),
      ]);

      if (techRes.status === "fulfilled" && techRes.value.ok) {
        const text = await techRes.value.text();
        candidateStories.push(...parseRssXml(text, "TLDR Tech"));
      }
      if (aiRes.status === "fulfilled" && aiRes.value.ok) {
        const text = await aiRes.value.text();
        candidateStories.push(...parseRssXml(text, "TLDR AI"));
      }
    } catch (e) {
      console.warn("[Flywheel RSS fetch notice]:", e);
    }

    // Also pull from stored ideas in local DB/store
    const localStored = getStoredIdeas();
    if (localStored.length > 0) {
      candidateStories.push(
        ...localStored.slice(0, 5).map((i) => ({
          title: i.title,
          summary: i.excerpt || i.title,
          link: i.url,
          source: i.source_title || "Reerts Feed",
          publishedAt: i.published_at,
        }))
      );
    }

    // If still empty, use fallback seeds
    const allCandidates = candidateStories.length > 0 ? candidateStories : SEED_ARTICLES;

    // 2. Select top story for niche using Gemini or heuristic
    let topStory = allCandidates[0];
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const hasApiKey = !!apiKey && apiKey !== "mock_key" && apiKey.length > 5;

    if (hasApiKey && allCandidates.length > 1) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

        const selectionPrompt = `You are the lead editor for a viral social media theme page in the "${niche}" niche.
Select the single most viral, groundbreaking story from this candidate list:
${JSON.stringify(allCandidates.slice(0, 8).map((c, idx) => ({ index: idx, title: c.title, summary: c.summary })))}

Return a JSON object with:
"selectedIndex": number (index of the top story),
"viralityReason": string (1-2 sentences why this will stop the scroll)`;

        const result = await ai.models.generateContent({
          model,
          contents: selectionPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                selectedIndex: { type: Type.INTEGER },
                viralityReason: { type: Type.STRING },
              },
              required: ["selectedIndex", "viralityReason"],
            },
          },
        });

        const parsed = JSON.parse(result.text || "{}");
        if (typeof parsed.selectedIndex === "number" && allCandidates[parsed.selectedIndex]) {
          topStory = allCandidates[parsed.selectedIndex];
          console.log(`[Flywheel Curation] Selected: "${topStory.title}" (${parsed.viralityReason})`);
        }
      } catch (err: any) {
        console.warn("[Flywheel Gemini Curation error]:", err.message);
      }
    }

    // 3. Generate 4-slide faceless carousel deck
    const carouselGenRes = await fetch(`${origin}/api/carousel/faceless-generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: topStory.title,
        excerpt: topStory.summary,
        url: topStory.link,
        theme,
        brandHandle,
      }),
    });

    let generatedDeck: any = null;
    if (carouselGenRes.ok) {
      generatedDeck = await carouselGenRes.json();
    } else {
      throw new Error("Carousel generation failed");
    }

    const { slides, caption, hashtags } = generatedDeck;

    // 4. Save to Database as Post (Status: PENDING_REVIEW or SCHEDULED)
    const initialStatus = config.requireApproval ? "PENDING_REVIEW" : "SCHEDULED";
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    const [hours, minutes] = (config.scheduleTime || "10:00").split(":").map(Number);
    targetDate.setHours(hours || 10, minutes || 0, 0, 0);

    let savedPost: any = null;
    const postId = `post_flywheel_${Date.now()}`;

    try {
      const workspace = await prisma.workspace.findFirst();
      if (workspace) {
        savedPost = await prisma.post.create({
          data: {
            workspaceId: workspace.id,
            title: topStory.title,
            content: caption,
            rawThreads: JSON.stringify(slides),
            mediaUrls: JSON.stringify([]),
            platforms: JSON.stringify(config.targetPlatforms || ["instagram", "x", "linkedin", "threads"]),
            status: initialStatus,
            scheduledAt: targetDate,
          },
        });
      }
    } catch (err: any) {
      console.warn("Prisma post creation failed (mock fallback):", err.message);
      savedPost = {
        id: postId,
        title: topStory.title,
        content: caption,
        rawThreads: slides,
        platforms: config.targetPlatforms,
        status: initialStatus,
        scheduledAt: targetDate.toISOString(),
      };
    }

    if (!savedPost) {
      savedPost = {
        id: postId,
        title: topStory.title,
        content: caption,
        rawThreads: slides,
        platforms: config.targetPlatforms,
        status: initialStatus,
        scheduledAt: targetDate.toISOString(),
      };
    }

    // 5. Send notification to Discord / Telegram / Slack if webhook is set
    let notificationResult: { success: boolean; error?: string } = { success: false, error: "No webhook configured" };

    if (webhookUrl && webhookUrl.trim().length > 0) {
      notificationResult = await sendFlywheelNotification(
        channel,
        webhookUrl.trim(),
        {
          postId: savedPost.id,
          title: topStory.title,
          summary: topStory.summary,
          sourceUrl: topStory.link,
          sourceTitle: topStory.source,
          themeStyle: theme,
          brandHandle,
          slideCount: slides.length,
          slidesPreview: slides.map((s: any) => ({
            heading: s.title || s.label,
            subtext: s.body || "",
          })),
          caption,
          hashtags,
          scheduledTime: targetDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          appBaseUrl: origin,
        },
        {
          botToken: config.telegramBotToken,
          chatId: config.telegramChatId,
        }
      );
    }

    // 6. Update Flywheel Config state
    saveFlywheelConfig({
      lastRunAt: new Date().toISOString(),
      lastRunStatus: initialStatus === "PENDING_REVIEW" ? "pending_review" : "success",
      lastRunPostId: savedPost.id,
      totalPostsGenerated: config.totalPostsGenerated + 1,
    });

    return NextResponse.json({
      success: true,
      niche,
      theme,
      post: savedPost,
      slides,
      story: topStory,
      notificationSent: notificationResult.success,
      notificationError: notificationResult.error,
      scheduledAt: targetDate.toISOString(),
      status: initialStatus,
    });
  } catch (err: any) {
    console.error("POST /api/automations/daily-pipeline/run error:", err);
    return NextResponse.json({ error: err.message || "Flywheel run failed" }, { status: 500 });
  }
}

