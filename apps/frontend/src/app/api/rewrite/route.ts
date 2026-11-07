import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slide, instruction = "Make it concise and impactful", context = "", brandTone = "" } = body;

    if (!slide) {
      return NextResponse.json({ error: "Slide data required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (apiKey && apiKey.length > 5) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

        const prompt = `You are a world-class copywriter rewriting a single social media carousel card.
Slide Type: "${slide.type || "content"}"
Current Title: "${slide.title || ""}"
Current Body: "${slide.body || ""}"
Current Items: ${JSON.stringify(slide.items || [])}
Current Stat: "${slide.stat || ""}"
Instruction: "${instruction}"
Brand Tone Guidelines: "${brandTone}"
Original Article Context:
${context.slice(0, 1500)}

Rewrite the card following the instruction. Keep headlines punchy and under 12 words, and body text concise and readable.`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                body: { type: Type.STRING },
                label: { type: Type.STRING },
                emoji: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                stat: { type: Type.STRING },
              },
              required: ["title", "body"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return NextResponse.json({
          title: parsed.title || slide.title,
          body: parsed.body || slide.body,
          label: parsed.label || slide.label,
          emoji: parsed.emoji || slide.emoji,
          items: parsed.items || slide.items,
          stat: parsed.stat || slide.stat,
        });
      } catch (aiErr: any) {
        console.warn("Gemini rewrite fallback:", aiErr.message);
      }
    }

    // Heuristic fallbacks
    let newTitle = slide.title;
    let newBody = slide.body;

    if (instruction.includes("짧게") || instruction.includes("short")) {
      newTitle = slide.title.split(" ").slice(0, 6).join(" ");
      newBody = slide.body.split(".")[0] + ".";
    } else if (instruction.includes("질문") || instruction.includes("question")) {
      newTitle = slide.title.endsWith("?") ? slide.title : `${slide.title}?`;
    }

    return NextResponse.json({
      title: newTitle,
      body: newBody,
      label: slide.label,
      emoji: slide.emoji,
      items: slide.items,
      stat: slide.stat,
    });
  } catch (err: any) {
    console.error("Error in /api/rewrite:", err);
    return NextResponse.json(
      { error: err.message || "Failed to rewrite slide" },
      { status: 500 }
    );
  }
}

