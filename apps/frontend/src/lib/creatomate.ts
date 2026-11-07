import path from "path";
import fs from "fs";
import { RathEditPlan, AuteurEditPlan } from "./gemini-video-pipeline";

export interface CreatomateRathOptions {
  projectId: string;
  videoRelPath: string;
  styleId: string;
  plan: RathEditPlan;
  durationSec?: number;
}

/** Backward compatibility alias */
export type CreatomateAuteurOptions = CreatomateRathOptions;

/**
 * Upload local video to get a direct public URL for Creatomate ingestion
 * Tries tmpfiles.org first, then catbox / file.io fallbacks
 */
async function getPublicUrlForVideo(localVideoPath: string): Promise<string> {
  const buffer = fs.readFileSync(localVideoPath);
  const filename = path.basename(localVideoPath);

  // Method 1: tmpfiles.org (reliable direct download links)
  try {
    console.log("[Creatomate Uploader] Trying tmpfiles.org...");
    const blob = new Blob([buffer], { type: "video/mp4" });
    const form = new FormData();
    form.append("file", blob, filename);

    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const json: any = await res.json();
      const rawUrl = json.data?.url;
      if (rawUrl) {
        const directUrl = rawUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        console.log("[Creatomate Uploader] tmpfiles.org direct URL:", directUrl);
        return directUrl;
      }
    }
  } catch (err: any) {
    console.warn("[Creatomate Uploader] tmpfiles.org failed:", err.message);
  }

  // Method 2: Catbox / Litterbox (1 hour temporary direct link)
  try {
    console.log("[Creatomate Uploader] Trying litterbox.catbox.moe fallback...");
    const blob = new Blob([buffer], { type: "video/mp4" });
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("time", "1h");
    form.append("fileToUpload", blob, filename);

    const res = await fetch("https://litterbox.catbox.moe/resources/internals/api.php", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const directUrl = (await res.text()).trim();
      if (directUrl && directUrl.startsWith("http")) {
        console.log("[Creatomate Uploader] litterbox direct URL:", directUrl);
        return directUrl;
      }
    }
  } catch (err: any) {
    console.warn("[Creatomate Uploader] litterbox failed:", err.message);
  }

  // Method 3: file.io
  try {
    console.log("[Creatomate Uploader] Trying file.io fallback...");
    const blob = new Blob([buffer], { type: "video/mp4" });
    const form = new FormData();
    form.append("file", blob, filename);

    const res = await fetch("https://file.io", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      const json: any = await res.json();
      if (json.link) {
        console.log("[Creatomate Uploader] file.io direct URL:", json.link);
        return json.link;
      }
    }
  } catch (err: any) {
    console.warn("[Creatomate Uploader] file.io failed:", err.message);
  }

  throw new Error("[Creatomate Uploader] All temporary file hosts failed to generate a public ingestion URL");
}

/**
 * Render a complete Reerts Rath reel via Creatomate Cloud Multi-Track Engine:
 * - Cream background (#F4F1EA)
 * - Dynamic scene headlines & badges matching speech
 * - Central speaker take card with border & rounded corners
 * - Word-by-word animated karaoke captions
 * - Timed scene transitions
 */
export async function renderWithCreatomate(
  options: CreatomateRathOptions
): Promise<string | null> {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    console.log("[Creatomate] No API key found, skipping cloud render.");
    return null;
  }

  const { projectId, videoRelPath, styleId, plan, durationSec = 30 } = options;

  try {
    const filename = path.basename(videoRelPath);
    const videosDir = path.join(process.cwd(), "apps", "frontend", "public", "uploads", "videos");
    const localVideoPath = fs.existsSync(videosDir)
      ? path.join(videosDir, filename)
      : path.join(process.cwd(), "public", "uploads", "videos", filename);

    if (!fs.existsSync(localVideoPath)) {
      throw new Error(`Video file not found: ${localVideoPath}`);
    }

    console.log("[Creatomate] Uploading video for cloud ingestion...");
    const publicVideoUrl = await getPublicUrlForVideo(localVideoPath);

    // Style-specific color tokens matching Reerts Rath
    let bgColor = "#F4F1EA";       // Cream paper
    let titleColor = "#111111";
    let accentColor = "#AE0006";   // Rath accent red
    let highlightBg = "#F59E0B";   // Golden yellow highlight
    let cardBorderColor = "#18181B";

    if (styleId === "limeslides" || styleId.includes("lime")) {
      bgColor = "#C6FF3D";        // Acid Lime
      titleColor = "#000000";
      accentColor = "#000000";
      highlightBg = "#000000";
      cardBorderColor = "#000000";
    } else if (styleId === "classified-yt" || styleId.includes("classified") || styleId.includes("glitch")) {
      bgColor = "#0B0B0C";        // Deep black
      titleColor = "#FFFFFF";
      accentColor = "#FF3B4E";
      highlightBg = "#AE0006";
      cardBorderColor = "#27272A";
    }

    const s1 = plan.scenes[0] || {
      headline: plan.headline || "6.3B HACK",
      subAccent: plan.subAccent || "CRYPTO SHOCK",
      badgeText: "BREAKING NEWS",
      end: 4.0,
    };

    const s2 = plan.scenes[1] || {
      headline: plan.scenes[1]?.headline || "WITHDRAWALS HALTED",
      subAccent: plan.scenes[1]?.subAccent || "EXCHANGE ALERT",
      badgeText: "VERIFIED SOURCE",
      end: 14.0,
    };

    const s3 = plan.scenes[2] || {
      headline: plan.scenes[2]?.headline || "THE IMPACT",
      subAccent: plan.scenes[2]?.subAccent || "3 KEY FACTS",
      badgeText: "ANALYSIS",
      end: 25.0,
    };

    const elements: any[] = [
      // 1. Background layer
      {
        type: "shape",
        shape: "rectangle",
        width: "100%",
        height: "100%",
        fill_color: bgColor,
      },

      // 2. Scene 1 Pill Badge (Top)
      {
        type: "text",
        text: s1.badgeText || "REERTS",
        time: 0,
        duration: s1.end,
        y: "7%",
        fill_color: "#FFFFFF",
        background_color: accentColor,
        background_border_radius: "2 vmin",
        font_family: "Montserrat",
        font_weight: "800",
        font_size: "3.2 vmin",
        x_padding: "3.5 vmin",
        y_padding: "1.2 vmin",
        x_alignment: "50%",
        y_alignment: "50%",
      },

      // 3. Scene 1 Main Headline
      {
        type: "text",
        text: s1.headline,
        time: 0,
        duration: s1.end,
        y: "13%",
        width: "90%",
        fill_color: titleColor,
        font_family: "Montserrat",
        font_weight: "900",
        font_size: "7.0 vmin",
        x_alignment: "50%",
        y_alignment: "50%",
      },

      // 4. Scene 2 Headline
      {
        type: "text",
        text: s2.headline,
        time: s1.end,
        duration: Math.max(1, s2.end - s1.end),
        y: "11%",
        width: "90%",
        fill_color: titleColor,
        font_family: "Montserrat",
        font_weight: "900",
        font_size: "6.5 vmin",
        x_alignment: "50%",
        y_alignment: "50%",
      },

      // 5. Scene 3 Headline
      {
        type: "text",
        text: s3.headline,
        time: s2.end,
        duration: Math.max(1, durationSec - s2.end),
        y: "11%",
        width: "90%",
        fill_color: titleColor,
        font_family: "Montserrat",
        font_weight: "900",
        font_size: "6.5 vmin",
        x_alignment: "50%",
        y_alignment: "50%",
      },

      // 6. Central Speaker Video Take in styled Paper Studio card
      {
        type: "video",
        id: "speaker-video",
        source: publicVideoUrl,
        time: 0,
        duration: durationSec,
        y: "53%",
        width: "88%",
        height: "62%",
        fit: "cover",
        border_radius: "3.5 vmin",
        border_color: cardBorderColor,
        border_width: "0.6 vmin",
      },

      // 7. Word-by-Word Animated Karaoke Captions
      {
        type: "text",
        transcript_source: "speaker-video",
        transcript_effect: "highlight",
        transcript_maximum_length: 10,
        time: 0,
        duration: durationSec,
        y: "88%",
        width: "86%",
        fill_color: titleColor,
        background_color: highlightBg,
        background_border_radius: "1.5 vmin",
        font_family: "Montserrat",
        font_weight: "800",
        font_size: "6.8 vmin",
        x_alignment: "50%",
        y_alignment: "50%",
      },
    ];

    const payload = {
      output_format: "mp4",
      source: {
        output_format: "mp4",
        width: 1080,
        height: 1920,
        elements,
      },
    };

    console.log("[Creatomate] Sending render job to Creatomate API...");
    const renderRes = await fetch("https://api.creatomate.com/v1/renders", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!renderRes.ok) {
      const errText = await renderRes.text();
      throw new Error(`Creatomate API returned ${renderRes.status}: ${errText}`);
    }

    const renderJson: any = await renderRes.json();
    const job = Array.isArray(renderJson) ? renderJson[0] : renderJson;
    const renderId = job?.id;

    if (!renderId) {
      throw new Error("No render ID returned by Creatomate: " + JSON.stringify(renderJson));
    }

    console.log(`[Creatomate] Job submitted (ID: ${renderId}), polling for completion...`);

    // Poll for render completion
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2500));
      const checkRes = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
        headers: { Authorization: "Bearer " + apiKey },
      });

      if (!checkRes.ok) continue;

      const checkJson: any = await checkRes.json();
      console.log(`[Creatomate] Poll ${i + 1}/30: status = ${checkJson.status}`);

      if (checkJson.status === "succeeded" && checkJson.url) {
        console.log("[Creatomate] Render Succeeded! Downloading local copy...");
        // Download rendered MP4 to local public uploads so frontend can serve it instantly
        const renderedFilename = `creatomate_${projectId}.mp4`;
        const localOutputPath = path.join(videosDir, renderedFilename);

        const videoBlobRes = await fetch(checkJson.url);
        if (videoBlobRes.ok) {
          const videoArrayBuffer = await videoBlobRes.arrayBuffer();
          fs.writeFileSync(localOutputPath, Buffer.from(videoArrayBuffer));
          console.log(`[Creatomate] Local file saved at ${localOutputPath}`);
          return `/uploads/videos/${renderedFilename}`;
        }

        return checkJson.url;
      } else if (checkJson.status === "failed") {
        throw new Error("Creatomate render failed: " + JSON.stringify(checkJson.error_message || checkJson));
      }
    }

    console.warn("[Creatomate] Timed out waiting for render completion.");
    return null;
  } catch (err: any) {
    console.error("[Creatomate] Error during renderWithCreatomate:", err.message);
    return null;
  }
}
