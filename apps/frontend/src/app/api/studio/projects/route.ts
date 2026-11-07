import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import {
  getAllVideoProjects,
  saveVideoProject,
  getVideoProjectsStoreVersion,
  VideoProjectRecord,
} from "@/lib/video-projects-store";
import { VIDEO_TEMPLATES } from "@/data/videoTemplates";
import { planVideoWithRath } from "@/lib/gemini-video-pipeline";
import {
  extractVideoThumbnail,
  inspectRenderedVideo,
  renderProjectVideo,
  resolveVideoInputPath,
} from "@/lib/video-renderer";
import { renderWithCreatomate } from "@/lib/creatomate";
import { transcribeVideoAudio, TranscriptionResult } from "@/lib/groq-transcriber";
import { getStyleVisualConfig } from "@/lib/auteur-ass-composer";
import { planLimeSlides, toRathEditPlan, type LimeRathEditPlan } from "@/lib/lime-director-schema";

export async function GET(req: NextRequest) {
  try {
    const etag = getVideoProjectsStoreVersion();
    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }
    const projects = getAllVideoProjects();
    return NextResponse.json({ projects }, {
      headers: {
        ETag: etag,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      mode = "edit",
      styleIds = [],
      platforms = ["instagram", "tiktok", "youtube"],
      automation,
      options,
      settings,
      brief,
      source = { kind: "upload" },
    } = body;

    const existingCount = getAllVideoProjects().length;
    const projectId =
      "prj_" +
      Math.random().toString(36).substring(2, 10) +
      Date.now().toString(36).slice(-6);

    const requestedStyleId = (styleIds[0] || "cap-paper").trim();
    const firstStyle = VIDEO_TEMPLATES.find(
      (s) =>
        s.id === requestedStyleId ||
        s.id.toLowerCase() === requestedStyleId.toLowerCase()
    );
    const primaryStyleId = firstStyle?.id || requestedStyleId;
    const styleCfg = getStyleVisualConfig(primaryStyleId);
    const isLimeSlides = primaryStyleId === "limeslides" || primaryStyleId === "cap-slides";

    const projectTitle =
      title ||
      (brief?.topic ? `Reel: ${brief.topic.slice(0, 35)}` : null) ||
      `Untitled ${existingCount + 1}`;

    const userUploadedPath = source.uploadPaths?.[0];
    const cutoutFallback = isLimeSlides && Boolean(options?.avatarCutout) && !process.env.REPLICATE_API_TOKEN;

    // Synchronize style-specific palette colors for all 56 styles
    const projectSettings = {
      bg: "#" + styleCfg.canvasBgHex.replace(/^0x/i, ""),
      ink: styleCfg.isDarkCanvas ? "#FFFFFF" : "#111111",
      accent: styleCfg.highlightHex,
      accentHi: styleCfg.highlightHex,
      panel: styleCfg.isDarkCanvas ? "#18181B" : "#FFFFFF",
      panel2: styleCfg.isDarkCanvas ? "#27272A" : "#F4F1EA",
      line: styleCfg.isDarkCanvas ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
      ...settings,
    };

    let initialPoster =
      firstStyle?.poster || "https://makerzz.space/showcase/face/classified-yt/poster.jpg";
    if (userUploadedPath) {
      try {
        initialPoster = await extractVideoThumbnail(userUploadedPath, projectId);
      } catch (err) {
        console.warn("Could not extract initial thumbnail, will fallback:", err);
      }
    }

    const outputVideo =
      userUploadedPath ||
      firstStyle?.preview ||
      "https://makerzz.space/showcase/face/classified-yt/preview.mp4";

    const newProject: VideoProjectRecord = {
      id: projectId,
      title: projectTitle,
      mode,
      status: "TRANSCRIBING",
      progress: 18,
      styleIds: styleIds.length > 0 ? styleIds : [primaryStyleId],
      primaryStyleId,
      platforms,
      approvalStatus: "pending",
      timelineNotes: [],
      automation,
      options: {
        // Speaker cutout is an optional, paid Replicate operation. Do not enable
        // it implicitly for Lime Slides so projects work without a server token.
        avatarCutout: cutoutFallback ? false : options?.avatarCutout ?? false,
        look: options?.look || "clean",
        lookStrength: options?.lookStrength ?? 0.8,
      },
      settings: projectSettings,
      brief,
      source,
      userRawVideoUrl: userUploadedPath,
      outputVideoUrl: outputVideo,
      thumbnailUrl: initialPoster,
      captionText: automation?.keyword
        ? `Here is the secret breakdown. Comment "${automation.keyword}" below and I'll DM you the direct link right away! 👇🚀 #contentcreator #reels #automation`
        : `Behind the scenes of scaling workflows with AI. Drop your thoughts in the comments! 🔥 #creator #reels #automation`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveVideoProject(newProject);

    // Run async background processing with the full 4-stage Reerts Rath pipeline:
    // 1. Reading your video (TRANSCRIBING)
    // 2. Planning the edit (COMPOSING_GRAPHICS)
    // 3. Building every scene (COLOR_GRADING)
    // 4. Final checks (READY)
    (async () => {
      try {
        const localVideoAbsolutePath = userUploadedPath
          ? resolveVideoInputPath(userUploadedPath)
          : null;

        let transcriptionResult: TranscriptionResult | undefined;

        // Stage 1: Reading your video (Transcription & Word Timestamps)
        if (localVideoAbsolutePath && fs.existsSync(localVideoAbsolutePath)) {
          newProject.status = "TRANSCRIBING";
          newProject.progress = 25;
          saveVideoProject(newProject);

          try {
            console.log(`[Rath Pipeline] Stage 1 — Reading video: ${localVideoAbsolutePath}`);
            transcriptionResult = await transcribeVideoAudio(localVideoAbsolutePath);

            newProject.transcript = transcriptionResult.text;
            newProject.transcriptWords = transcriptionResult.words;
            if (transcriptionResult.duration) {
              newProject.source = {
                ...newProject.source,
                durationSec: Math.round(transcriptionResult.duration * 100) / 100,
              };
            }
            saveVideoProject(newProject);
          } catch (transcribeErr: any) {
            console.error("[Rath Pipeline] Transcription failed:", transcribeErr.message);
            throw transcribeErr;
          }
        }

        // Stage 2: Planning the edit (Rath Scene Director + Live Research & Assets)
        newProject.status = "COMPOSING_GRAPHICS";
        newProject.progress = 52;
        saveVideoProject(newProject);

        const actualDuration =
          transcriptionResult?.duration || source?.durationSec || 15;

        const rathPlan = isLimeSlides
          ? toRathEditPlan(await planLimeSlides({
              topic: brief?.topic || source?.topic || projectTitle,
              transcript: transcriptionResult?.text || brief?.topic || source?.topic || "",
              transcriptionWords: transcriptionResult?.words || [],
              durationSec: actualDuration,
            }))
          : await planVideoWithRath({
              topic: brief?.topic || source?.topic || projectTitle,
              styleName: firstStyle?.name || styleCfg.styleName,
              durationSec: actualDuration,
              language: transcriptionResult?.language || source?.language || "en",
              transcription: transcriptionResult,
            });

        newProject.captionText = rathPlan.platformCaption;
        newProject.scenes = rathPlan.scenes;
        if (isLimeSlides) newProject.limeBeats = (rathPlan as LimeRathEditPlan).limeBeats || [];
        newProject.researchVisits = rathPlan.researchVisits;
        newProject.assets = rathPlan.assets;
        newProject.checks = rathPlan.checks;
        newProject.scenePlan = {
          headline: rathPlan.headline,
          subAccent: rathPlan.subAccent,
          metricLabel: rathPlan.metricLabel,
          metricCount: rathPlan.metricCount,
          steps: rathPlan.steps,
          platformCaption: rathPlan.platformCaption,
        };
        saveVideoProject(newProject);

        // Stage 3: Building every scene (FFmpeg + libass Studio Composite or Creatomate)
        newProject.status = "COLOR_GRADING";
        newProject.progress = 78;
        saveVideoProject(newProject);

        if (userUploadedPath) {
          try {
            let finalVideoUrl: string | null = null;
            const useLocalRenderer = isLimeSlides || Boolean(newProject.options?.avatarCutout);
            if (useLocalRenderer) {
              // Keep Lime Slides on its style renderer. The fixed cloud template does
              // not support this style or transparent speaker footage.
              finalVideoUrl = await renderProjectVideo({
                projectId,
                videoRelPath: userUploadedPath,
                styleId: primaryStyleId,
                plan: rathPlan,
                transcriptWords: newProject.transcriptWords,
                durationSec: actualDuration,
                avatarCutout: newProject.options?.avatarCutout,
              });
            } else {
              finalVideoUrl = await renderWithCreatomate({
                projectId,
                videoRelPath: userUploadedPath,
                styleId: primaryStyleId,
                plan: rathPlan,
                durationSec: actualDuration,
              });
            }

            if (!finalVideoUrl) {
              console.log(
                `[Rath Pipeline] Stage 3 — Building every scene in style '${primaryStyleId}' via FFmpeg + libass...`
              );
              finalVideoUrl = await renderProjectVideo({
                projectId,
                videoRelPath: userUploadedPath,
                styleId: primaryStyleId,
                plan: rathPlan,
                transcriptWords: newProject.transcriptWords,
                durationSec: actualDuration,
              });
            }

            if (finalVideoUrl) {
              const renderedPath = resolveVideoInputPath(finalVideoUrl);
              if (!renderedPath) throw new Error("Renderer returned an output URL, but the rendered file is missing locally.");
              newProject.checks = await inspectRenderedVideo(renderedPath, actualDuration);
              if (cutoutFallback) {
                newProject.checks.push({
                  id: "speaker_cutout",
                  label: "Speaker framing",
                  status: "warn",
                  detail: "Replicate is not configured, so this Lime Slides render used face-aware framing without background removal.",
                });
              }
              if (isLimeSlides) {
                const { getLastLimeQualityReport } = await import("@/lib/lime-slides-engine");
                const limeReport = getLastLimeQualityReport();
                if (limeReport) {
                  newProject.checks = [
                    ...newProject.checks,
                    ...limeReport.checks,
                    {
                      id: "lime_acceptance_metrics",
                      label: "Lime Slides acceptance metrics",
                      status: "pass",
                      detail: `${limeReport.numbers.visualChanges} visual changes; max ${limeReport.numbers.maxCaptionActive} captions active; face inside crop ${limeReport.numbers.faceInsideCropPercent.toFixed(1)}%; motion ${limeReport.numbers.motionCoveragePercent == null ? "unmeasured" : `${limeReport.numbers.motionCoveragePercent.toFixed(1)}%`}; render ${(limeReport.numbers.renderMs / 1000).toFixed(2)}s.`,
                    },
                  ];
                }
              }
              newProject.outputVideoUrl = finalVideoUrl;
              newProject.thumbnailUrl = `/api/studio/video/thumb_${projectId}.jpg`;
              console.log("[Rath Pipeline] Final edited video URL:", finalVideoUrl);
            }
          } catch (renderErr: any) {
            console.error("[Rath Pipeline] Video composite error:", renderErr.message);
            throw renderErr;
          }
        }

        // Stage 4: Final checks & READY TO REVIEW
        newProject.status = "READY";
        newProject.progress = 100;
        saveVideoProject(newProject);
        console.log(`[Rath Pipeline] Project ${projectId} is READY TO REVIEW.`);
      } catch (err: any) {
        console.error("[Rath Pipeline] Async project processing fatal error:", err);
        newProject.status = "FAILED";
        newProject.progress = 100;
        newProject.errorMessage = err?.message || "Video processing failed.";
        saveVideoProject(newProject);
      }
    })();

    return NextResponse.json({
      project: newProject,
      message: "Video edit started successfully with Reerts Rath pipeline",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create project" },
      { status: 500 }
    );
  }
}
