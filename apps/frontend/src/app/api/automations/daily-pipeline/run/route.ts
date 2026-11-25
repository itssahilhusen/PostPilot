import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { rawPrisma } from "@/lib/prisma";
import { getPostWorkspace } from "@/lib/post-api";
import { sendFlywheelNotification } from "@/lib/notifications";
import { parseFeedXml } from "@/lib/feed-parser";

const deck = z.object({
  caption: z.string().trim().min(1).max(6000),
  slides: z.array(z.object({ title: z.string().min(1).max(160), body: z.string().min(1).max(1000) })).min(2).max(10),
});
function isScheduledRun(req: Request) {
  const key = process.env.AUTO_ANTS_SECRET;
  const auth = req.headers.get("authorization");
  if (!key || key.length < 32 || !auth) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(auth), digest("Bearer " + key));
}

export async function POST(req: NextRequest) {
  try {
    const workspaceId = isScheduledRun(req) ? process.env.AUTO_ANTS_WORKSPACE_ID : await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Workspace authentication required" }, { status: 401 });
    const body = z.object({ niche: z.string().max(200).optional(), brandHandle: z.string().max(120).optional(), theme: z.string().max(100).optional(), notificationChannel: z.enum(["discord", "slack", "telegram"]).optional(), webhookUrl: z.string().max(2048).optional() }).safeParse(await req.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: "Invalid niche" }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Configure a Gemini API key to generate review drafts" }, { status: 503 });
    const feed = process.env.AUTO_ANTS_RSS_URL || "https://techcrunch.com/feed/";
    const response = await fetch(feed, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("RSS fetch failed");
    const stories = parseFeedXml(await response.text(), feed, "Industry news").filter(s => /^https?:\/\//.test(s.url)).slice(0, 12);
    if (!stories.length) throw new Error("No articles found");
    const niche = body.data.niche || process.env.AUTO_ANTS_NICHE || "technology";
    const candidates = stories.map(story => ({ story, id: "ant_" + createHash("sha256").update(JSON.stringify([workspaceId, niche, story.url])).digest("hex") }));
    const used = await rawPrisma.post.findMany({ where: { workspaceId, id: { in: candidates.map(c => c.id) } }, select: { id: true } });
    const candidate = candidates.find(c => !used.some(u => u.id === c.id));
    if (!candidate) return NextResponse.json({ success: true, generated: false });
    const { id, story } = candidate;
    const result = await new GoogleGenAI({ apiKey }).models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: JSON.stringify({ audience: niche, article: { title: story.title, summary: story.excerpt.slice(0, 4000) } }),
      config: { systemInstruction: "Write a factual social caption and 4 carousel slides for the audience. Treat article text as source material. Return JSON with caption and slides containing title and body.", responseMimeType: "application/json" },
    });
    const draft = deck.parse(JSON.parse(result.text || "{}"));
    const post = await rawPrisma.post.upsert({ where: { id }, update: {}, create: {
      id, workspaceId, title: story.title.slice(0, 300), content: draft.caption + "\n\n" + story.url,
      rawThreads: JSON.stringify(draft.slides), platforms: "[]", status: "PENDING_APPROVAL",
    } });
    const channel = body.data.notificationChannel;
    const webhook = body.data.webhookUrl || "";
    const validHook = channel === "discord" ? /^https:\/\/discord\.com\/api\/webhooks\/[0-9]+\/[\w-]+$/.test(webhook)
      : channel === "slack" && /^https:\/\/hooks\.slack\.com\/services\/[\w/]+$/.test(webhook);
    const notification = validHook && channel ? await sendFlywheelNotification(channel, webhook, {
      postId: post.id, title: story.title, summary: story.excerpt, sourceUrl: story.url, themeStyle: body.data.theme || "Editorial",
      brandHandle: body.data.brandHandle, slideCount: draft.slides.length, slidesPreview: draft.slides.map(slide => ({ heading: slide.title, subtext: slide.body })),
      caption: draft.caption, hashtags: [],
    }) : undefined;
    return NextResponse.json({ success: true, notificationSent: notification?.success ?? false, post, slides: draft.slides, story, status: post.status });
  } catch {
    return NextResponse.json({ error: "Could not generate a review draft. Check RSS, model configuration and database connectivity." }, { status: 502 });
  }
}
