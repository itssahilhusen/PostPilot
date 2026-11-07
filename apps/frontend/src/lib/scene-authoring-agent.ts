import fs from "fs";
import path from "path";
import { getStyleVisualConfig } from "./auteur-ass-composer";

function getApiKey(keyName: string): string | null {
  if (process.env[keyName]) return process.env[keyName]!.trim();
  const envCandidates = [
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "apps", "frontend", ".env"),
  ];
  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      try {
        const text = fs.readFileSync(p, "utf8");
        for (const line of text.split("\n")) {
          const match = line.match(new RegExp(`^${keyName}\\s*=\\s*(.+)$`));
          if (match && match[1]) {
            return match[1].trim().replace(/^["']|["']$/g, "");
          }
        }
      } catch {}
    }
  }
  return null;
}

export interface AuthorSceneParams {
  styleId: string;
  headline: string;
  subAccent?: string;
  badgeLabel?: string;
  metricNumber?: string;
  metricLabel?: string;
  steps?: string[];
  sceneIndex: number;
  totalScenes: number;
}

/**
 * AI-powered Scene Authoring Agent that synthesizes pixel-accurate HTML/CSS
 * matching the selected style design system.
 */
export async function authorSceneHtml(params: AuthorSceneParams): Promise<string> {
  const {
    styleId,
    headline,
    subAccent,
    badgeLabel,
    metricNumber,
    metricLabel,
    steps,
    sceneIndex,
    totalScenes,
  } = params;

  const styleCfg = getStyleVisualConfig(styleId);
  const openaiKey = getApiKey("OPENAI_API_KEY");
  const groqKey = getApiKey("GROQ_API_KEY");

  // Attempt 1: OpenAI (if available and has credits)
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert motion designer authoring top-stage 1080x720 HTML/CSS plates for a short-form video edit.
Rules:
- The canvas width is 1080px, height is 1920px.
- The top stage is exactly 1080px wide and 720px tall, positioned at top: 0, left: 0.
- The rest of the body (y=720 to 1920) MUST remain completely transparent (background: transparent) for the speaker's camera take.
- Style background: #${styleCfg.canvasBgHex.replace(/^0x/i, "")}. Accent: ${styleCfg.highlightHex}. Font: Impact, Arial Narrow, sans-serif.
- Keep text bold, condensed, uppercase, and visually striking.
- Return ONLY the clean HTML snippet starting with <!DOCTYPE html> and ending with </html>. No markdown, no backticks.`,
            },
            {
              role: "user",
              content: `Author scene ${sceneIndex + 1} of ${totalScenes}.
Headline: ${headline}
SubAccent: ${subAccent || ""}
Badge: ${badgeLabel || ""}
Metric: ${metricNumber || ""} (${metricLabel || ""})
Steps: ${steps?.join(", ") || ""}`,
            },
          ],
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      if (!data.error && data.choices?.[0]?.message?.content) {
        let cleanHtml = data.choices[0].message.content.trim();
        cleanHtml = cleanHtml.replace(/^```html\s*/i, "").replace(/```$/i, "").trim();
        if (cleanHtml.includes("<!DOCTYPE html>") || cleanHtml.includes("<html")) {
          return cleanHtml;
        }
      } else if (data.error) {
        console.warn("[Scene Authoring] OpenAI quota/auth notice:", data.error.message);
      }
    } catch (err: any) {
      console.warn("[Scene Authoring] OpenAI error:", err.message);
    }
  }

  // Attempt 2: Groq high-speed LLM (openai/gpt-oss-120b or qwen/qwen3.8-27b)
  if (groqKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `You are an expert motion designer authoring top-stage 1080x720 HTML/CSS plates for a short-form video edit.
Rules:
- The canvas width is 1080px, height is 1920px.
- The top stage is exactly 1080px wide and 720px tall, positioned at top: 0, left: 0.
- The rest of the body (y=720 to 1920) MUST remain completely transparent (background: transparent) for the speaker camera take.
- Style background: #${styleCfg.canvasBgHex.replace(/^0x/i, "")}. Accent: ${styleCfg.highlightHex}. Font: Impact, Arial Narrow, sans-serif.
- Keep text bold, condensed, uppercase, and visually striking.
- Return ONLY the clean HTML snippet starting with <!DOCTYPE html> and ending with </html>. No markdown, no backticks.`,
            },
            {
              role: "user",
              content: `Author scene ${sceneIndex + 1} of ${totalScenes}.
Headline: ${headline}
SubAccent: ${subAccent || ""}
Badge: ${badgeLabel || ""}
Metric: ${metricNumber || ""} (${metricLabel || ""})
Steps: ${steps?.join(", ") || ""}`,
            },
          ],
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      if (!data.error && data.choices?.[0]?.message?.content) {
        let cleanHtml = data.choices[0].message.content.trim();
        cleanHtml = cleanHtml.replace(/^```html\s*/i, "").replace(/```$/i, "").trim();
        if (cleanHtml.includes("<!DOCTYPE html>") || cleanHtml.includes("<html")) {
          return cleanHtml;
        }
      }
    } catch (err: any) {
      console.warn("[Scene Authoring] Groq error:", err.message);
    }
  }

  // Fallback to high-fidelity deterministic template engine
  const { buildLimeSceneHtml } = await import("./lime-slides-engine");
  return buildLimeSceneHtml({
    sceneType: sceneIndex === 0 ? "halo_hook" : sceneIndex % 2 === 1 ? "split_chart" : "split_metric",
    headline,
    start: 0,
    end: 1,
    beatIndex: sceneIndex,
    subAccent,
    badgeLabel,
    metricNumber,
    metricLabel,
    steps,
  });
}

