import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slides = [], platform = "instagram" } = body;

    const deckText = slides
      .map((s: any, idx: number) => `Slide ${idx + 1} (${s.type || "content"}): ${s.title} - ${s.body}`)
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (apiKey && apiKey.length > 5 && deckText.trim()) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

        const prompt = `You are a viral social media strategist crafting a high-engagement caption and hashtag set for a ${platform.toUpperCase()} carousel.
Slide content:
${deckText}

Platform-specific rules for ${platform}:
- Instagram: Hook in the first 120 characters before the '...more' cut. Bulleted key takeaways, relatable tone, question prompt at end to trigger comments, 5-8 hyper-relevant hashtags.
- LinkedIn: Thought-leadership opening hook, clean line breaks between ideas, actionable professional lesson, call for opinions, 3-5 hashtags.
- Threads / X: Ultra-concise, conversational, punchy takeaway with 1-2 hashtags.
- TikTok: Energetic, trend-friendly, search-engine optimized keywords.

Return a JSON object with:
- caption (string)
- hashtags (array of strings, each starting with #)`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["caption", "hashtags"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.caption) {
          return NextResponse.json({
            caption: parsed.caption,
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ["#swipera", "#content", "#carousel"],
          });
        }
      } catch (aiErr: any) {
        console.warn("Gemini caption generation fallback:", aiErr.message);
      }
    }

    // High quality fallback caption
    const coverTitle = slides[0]?.title || "Swipe through for the breakdown";
    const coverBody = slides[0]?.body || "";

    const fallbackCaption = `Here is everything you need to know about ${coverTitle}. 📌\n\n${coverBody}\n\nSwipe through the cards above for the full step-by-step breakdown. Which slide surprised you most? Drop your thoughts below! 👇`;
    const fallbackHashtags = [
      "#swipera",
      "#contentcreator",
      "#carousel",
      `#${platform}`,
      "#growthtips",
      "#solopreneur",
      "#productivity",
    ];

    return NextResponse.json({
      caption: fallbackCaption,
      hashtags: fallbackHashtags,
    });
  } catch (err: any) {
    console.error("Error in /api/caption:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate caption" },
      { status: 500 }
    );
  }
}

