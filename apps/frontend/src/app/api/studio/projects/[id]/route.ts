import { NextRequest, NextResponse } from "next/server";
import {
  getVideoProjectById,
  saveVideoProject,
  deleteVideoProject,
} from "@/lib/video-projects-store";
import { renderProjectVideo } from "@/lib/video-renderer";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await Promise.resolve(params);
    const project = getVideoProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await Promise.resolve(params);
    const project = getVideoProjectById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();

    if (typeof body.title === "string" && body.title.trim()) {
      project.title = body.title.trim();
    }

    if (body.approvalStatus) {
      project.approvalStatus = body.approvalStatus;
    }

    if (body.styleId && typeof body.styleId === "string") {
      project.primaryStyleId = body.styleId;
      project.styleIds = [body.styleId];
    }

    if (Array.isArray(body.scenes)) {
      project.scenes = body.scenes;
      if (body.scenes[0] && project.scenePlan) {
        project.scenePlan.headline = body.scenes[0].headline || project.scenePlan.headline;
        project.scenePlan.subAccent = body.scenes[0].subAccent || project.scenePlan.subAccent;
      }
    }

    if (body.timelineNote && typeof body.timelineNote.note === "string") {
      const notes = project.timelineNotes || [];
      notes.push({
        id: "note_" + Date.now().toString(36),
        timestampSec: Number(body.timelineNote.timestampSec || 0),
        note: body.timelineNote.note.trim(),
        createdAt: new Date().toISOString(),
      });
      project.timelineNotes = notes;
    }

    saveVideoProject(project);

    // If caller requested re-rendering scenes or style change: run asynchronously in background
    if (body.reRender && project.userRawVideoUrl) {
      project.status = "COLOR_GRADING";
      project.progress = 72;
      delete project.errorMessage;
      if (typeof body.avatarCutout === "boolean") {
        project.options = { ...project.options, avatarCutout: body.avatarCutout };
      }
      saveVideoProject(project);

      const projectId = project.id;
      const rawVideoUrl = project.userRawVideoUrl;
      const styleId = project.primaryStyleId || project.styleIds?.[0] || "cap-paper";
      const topH1 = project.scenePlan?.headline || project.scenes?.[0]?.headline || project.title?.toUpperCase() || "KEY INSIGHT";
      const topH2 = project.scenePlan?.subAccent || project.scenes?.[0]?.subAccent || "THE BREAKDOWN";
      const plan = {
        headline: topH1,
        subAccent: topH2,
        metricLabel: project.scenePlan?.metricLabel || "verified insights",
        metricCount: project.scenePlan?.metricCount || 3,
        steps: project.scenePlan?.steps || [
          `01 / ${project.scenes?.[0]?.headline || "Hook"}`,
          `02 / ${project.scenes?.[1]?.headline || "Insight"}`,
          `03 / ${project.scenes?.[2]?.headline || "Takeaway"}`,
        ],
        platformCaption: project.captionText || "",
        scenes: (project.scenes as any) || [],
        researchVisits: (project.researchVisits as any) || [],
        assets: (project.assets as any) || [],
        checks: (project.checks as any) || [],
        cadenceWordsPerMin: 145,
        limeBeats: project.limeBeats,
      };
      const transcriptWords = project.transcriptWords;
      const durationSec = project.source?.durationSec || 37.27;
      const avatarCutout = project.options?.avatarCutout;

      (async () => {
        try {
          const renderedUrl = await renderProjectVideo({
            projectId,
            videoRelPath: rawVideoUrl,
            styleId,
            plan,
            transcriptWords,
            durationSec,
            avatarCutout,
          });
          const curr = getVideoProjectById(projectId);
          if (curr) {
            curr.outputVideoUrl = renderedUrl;
            curr.thumbnailUrl = `/api/studio/video/thumb_${projectId}.jpg?t=${Date.now()}`;
            curr.status = "READY";
            curr.progress = 100;
            saveVideoProject(curr);
          }
        } catch (e: any) {
          console.error("Async re-render failed:", e.message);
          const curr = getVideoProjectById(projectId);
          if (curr) {
            curr.status = "FAILED";
            curr.progress = 100;
            curr.errorMessage = e?.message || "Video render failed.";
            saveVideoProject(curr);
          }
        }
      })();

      return NextResponse.json({
        project,
        message: "Re-render dispatched in background",
      });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await Promise.resolve(params);
    const ok = deleteVideoProject(id);
    if (!ok) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
