import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export interface FacelessSlidePayload {
  id: string;
  type: "cover" | "content" | "list" | "quote" | "cta";
  label: string;
  emoji: string;
  title: string;
  body: string;
  items?: string[];
  highlight?: string;
  badge?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "New AI Breakthrough",
      excerpt = "",
      url = "",
      theme = "futuretech",
      brandHandle = "@theaiseed",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const hasApiKey = !!apiKey && apiKey !== "mock_key" && apiKey.length > 5;

    // Structure constraints by theme
    let slides: FacelessSlidePayload[] = [];
    let caption = "";
    let hashtags: string[] = [];

    if (hasApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

        const systemPrompt = `You are an elite creative director crafting a 4 to 5 slide faceless social media carousel (4:5 format) for an Instagram/LinkedIn theme page in the "${theme}" style.
Brand handle: ${brandHandle}
Story Title: "${title}"
Story Excerpt: "${excerpt}"
Source: "${url}"

Style Guidance for Theme "${theme}":
- "futuretech": 50/50 vertical layout, UPPERCASE bold condensed headline, electric cyan and blue tones, verified badge handle, concise punchy takeaways.
- "aipagedaily": Minimalist void black, pure white text, AI divider glyph, numbered breakdown [01], [02], [03], "SWIPE FOR MORE".
- "tyches": Cyberpunk glowing border, neon lime accents, viral curiosity hook, CTA "YOU MAY NEVER SEE OUR PAGE AGAIN IF YOU DON'T FOLLOW US".
- "inventionshark": Clean documentary editorial, warm ochre accents, deep technological insight.

Requirements:
1. Generate exactly 4 slides:
   - Slide 1: "cover" hook slide. Urgent, curiosity-provoking headline in uppercase, 10-15 word subtext.
   - Slide 2: "content" slide. Key breakthrough explanation, 20-30 words.
   - Slide 3: "list" slide. 3 concise bullet point impacts/takeaways.
   - Slide 4: "cta" slide. Save & follow prompt tailored to the theme.
2. Generate an engaging caption (100-150 words) with hook, summary, and hashtags.`;

        const response = await ai.models.generateContent({
          model,
          contents: systemPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ["cover", "content", "list", "quote", "cta"] },
                      label: { type: Type.STRING },
                      emoji: { type: Type.STRING },
                      title: { type: Type.STRING },
                      body: { type: Type.STRING },
                      items: { type: Type.ARRAY, items: { type: Type.STRING } },
                      highlight: { type: Type.STRING },
                      badge: { type: Type.STRING },
                    },
                    required: ["type", "label", "title", "body"],
                  },
                },
                caption: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["slides", "caption", "hashtags"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          slides = parsed.slides.map((s: any, idx: number) => ({
            ...s,
            id: `slide_ai_${Date.now()}_${idx}`,
            badge: s.badge || brandHandle,
          }));
          caption = parsed.caption || "";
          hashtags = parsed.hashtags || [];
        }
      } catch (err: any) {
        console.warn("[Gemini Carousel Gen fallback]:", err.message);
      }
    }

    // High fidelity fallback if Gemini key is absent or timed out
    if (slides.length === 0) {
      const cleanTitle = title.replace(/[^\w\s-]/g, "").trim();
      const upperHeadline = cleanTitle.toUpperCase();

      if (theme === "futuretech") {
        slides = [
          {
            id: `slide_ft_1`,
            type: "cover",
            label: "TECH BREAKOUT",
            emoji: "⚡",
            title: upperHeadline,
            body: excerpt || "A major technical breakthrough that is altering how software and intelligence are deployed.",
            badge: brandHandle,
            highlight: "BREAKING",
          },
          {
            id: `slide_ft_2`,
            type: "content",
            label: "01 · THE DISRUPTION",
            emoji: "🌐",
            title: "What actually changed today?",
            body: "Traditional architectures required manual orchestration. New autonomous loops compress weeks of human coordination into deterministic pipelines.",
            badge: brandHandle,
          },
          {
            id: `slide_ft_3`,
            type: "list",
            label: "02 · CORE TAKEAWAYS",
            emoji: "🚀",
            title: "3 Things You Need to Know",
            body: "The direct ramifications for builders and creators:",
            items: [
              "10x faster execution without human bottleneck",
              "Direct integration into existing production workflows",
              "Shifts leverage toward individual operators",
            ],
            badge: brandHandle,
          },
          {
            id: `slide_ft_4`,
            type: "cta",
            label: "03 · FOLLOW FOR MORE",
            emoji: "🔔",
            title: "STAY AHEAD OF THE CURVE",
            body: `Follow ${brandHandle} for daily high-signal tech breakdowns. Double-tap to bookmark this for reference.`,
            badge: brandHandle,
          },
        ];
      } else if (theme === "aipagedaily") {
        slides = [
          {
            id: `slide_aip_1`,
            type: "cover",
            label: "AI PAGE DAILY",
            emoji: "✦",
            title: cleanTitle,
            body: excerpt || "Curated briefing on the most important breakthrough in synthetic computing this morning.",
            badge: brandHandle,
          },
          {
            id: `slide_aip_2`,
            type: "content",
            label: "[01] CONTEXT",
            emoji: "⚡",
            title: "Why this changes the game",
            body: "The models are no longer passive assistants. They reason, plan, and verify execution in real-time environments.",
            badge: brandHandle,
          },
          {
            id: `slide_aip_3`,
            type: "list",
            label: "[02] BREAKDOWN",
            emoji: "📊",
            title: "Key Performance Metrics",
            body: "Tested across benchmark standards:",
            items: [
              "Zero latency degradation under heavy loads",
              "Standardized tool-calling compliance",
              "High signal-to-noise ratio in output generation",
            ],
            badge: brandHandle,
          },
          {
            id: `slide_aip_4`,
            type: "cta",
            label: "[03] SWIPE FOR MORE",
            emoji: "✦",
            title: "Follow for Daily AI Reports",
            body: `Curated daily at 10 AM. Tap follow and save this card for your engineering notes.`,
            badge: brandHandle,
          },
        ];
      } else if (theme === "tyches") {
        slides = [
          {
            id: `slide_ty_1`,
            type: "cover",
            label: "FEATURE DROP",
            emoji: "🔮",
            title: cleanTitle,
            body: excerpt || "You might never see this tool again if you don't save this post right now.",
            badge: brandHandle,
            highlight: "NEW RELEASE",
          },
          {
            id: `slide_ty_2`,
            type: "content",
            label: "WHAT IT DOES",
            emoji: "💎",
            title: "Instant superpowers for modern builders",
            body: "Replaces 4 disjointed tools with one fluid pipeline. Setup takes under 2 minutes.",
            badge: brandHandle,
          },
          {
            id: `slide_ty_3`,
            type: "list",
            label: "TOP CAPABILITIES",
            emoji: "✨",
            title: "Why developers are obsessed",
            body: "Key highlights you will love:",
            items: [
              "Automated scheduled workflows",
              "Zero-config setup with Discord alerts",
              "Clean minimalist dark interface",
            ],
            badge: brandHandle,
          },
          {
            id: `slide_ty_4`,
            type: "cta",
            label: "DON'T MISS OUT",
            emoji: "🔥",
            title: "YOU MAY NEVER SEE US AGAIN",
            body: "Instagram algorithm moves fast. Follow now so you never miss another breakthrough release.",
            badge: brandHandle,
          },
        ];
      } else {
        // inventionshark / default editorial
        slides = [
          {
            id: `slide_inv_1`,
            type: "cover",
            label: "INVENTION DOSSIER",
            emoji: "📰",
            title: cleanTitle,
            body: excerpt || "A deep-dive investigation into today's most significant technical discovery.",
            badge: brandHandle,
          },
          {
            id: `slide_inv_2`,
            type: "content",
            label: "THE MECHANISM",
            emoji: "⚙️",
            title: "How the breakthrough was engineered",
            body: "By re-evaluating the underlying latency bottlenecks, the engineering team unlocked order-of-magnitude gains.",
            badge: brandHandle,
          },
          {
            id: `slide_inv_3`,
            type: "list",
            label: "THE IMPLICATIONS",
            emoji: "💡",
            title: "What this unlocks next",
            body: "Direct ripple effects across the ecosystem:",
            items: [
              "Dramatically reduced compute overhead",
              "Democratized access for independent developers",
              "New categories of autonomous products",
            ],
            badge: brandHandle,
          },
          {
            id: `slide_inv_4`,
            type: "cta",
            label: "SAVE THIS DOSSIER",
            emoji: "🔖",
            title: "Follow for Daily Inventions",
            body: `Stay ahead of technical shifts with daily verified dossiers from ${brandHandle}.`,
            badge: brandHandle,
          },
        ];
      }

      caption = `🚨 ${title}\n\n${excerpt || "Here is what you need to know about today's biggest breakthrough:"}\n\nSwipe through the deck for the complete breakdown. What are your thoughts on this? Let us know below 👇\n\nFollow ${brandHandle} for daily tech & AI insights.\n\n#TechNews #ArtificialIntelligence #FutureTech #DevTools #AI`;
      hashtags = ["#TechNews", "#ArtificialIntelligence", "#FutureTech", "#DevTools", "#AI"];
    }

    return NextResponse.json({
      success: true,
      theme,
      title,
      caption,
      hashtags,
      slides,
    });
  } catch (err: any) {
    console.error("POST /api/carousel/faceless-generate error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate carousel" }, { status: 500 });
  }
}

