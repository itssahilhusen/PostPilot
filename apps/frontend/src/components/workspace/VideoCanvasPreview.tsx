"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrandKitSettings } from "@/data/videoTemplates";
import { Volume2, VolumeX, Sparkles } from "lucide-react";

export interface ScenePlanData {
  headline?: string;
  subAccent?: string;
  metricLabel?: string;
  metricCount?: number;
  steps?: [string, string, string];
}

interface VideoCanvasPreviewProps {
  settings: BrandKitSettings;
  videoSrc?: string;
  scenePlan?: ScenePlanData;
  styleId?: string;
  className?: string;
}

const SAMPLE_WORDS = ["This", "changed", "how", "I", "edit", "videos"];

export function VideoCanvasPreview({
  settings,
  videoSrc,
  scenePlan,
  styleId = "cap-paper",
  className,
}: VideoCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const settingsRef = useRef<BrandKitSettings>(settings);
  const scenePlanRef = useRef<ScenePlanData | undefined>(scenePlan);
  const styleIdRef = useRef<string>(styleId);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    scenePlanRef.current = scenePlan;
  }, [scenePlan]);

  useEffect(() => {
    styleIdRef.current = styleId;
  }, [styleId]);

  // Set up video element if videoSrc is provided
  useEffect(() => {
    if (videoSrc) {
      const v = document.createElement("video");
      v.src = videoSrc;
      v.crossOrigin = "anonymous";
      v.loop = true;
      v.muted = isMuted;
      v.playsInline = true;
      v.autoplay = true;
      v.play().catch(() => {});
      videoElRef.current = v;
      return () => {
        v.pause();
        v.src = "";
        videoElRef.current = null;
      };
    }
  }, [videoSrc]);

  // Sync mute state to video element
  useEffect(() => {
    if (videoElRef.current) {
      videoElRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const s = settingsRef.current;
      const plan = scenePlanRef.current;
      const activeStyle = styleIdRef.current || "cap-paper";

      const tempo = s.motionTempo || (s as any).motion?.tempo || 1;
      const speed = s.speed || 1;
      const elapsed = ((Math.max(0, now - startTime) / 1000) * tempo * speed) % 4.8;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Coordinate scaling to 360x640 logical resolution
      ctx.scale(canvas.width / 360, canvas.height / 640);

      const isPaperStudio = activeStyle === "cap-paper" || activeStyle.includes("paper");
      const isLimeSlides = activeStyle === "limeslides" || activeStyle.includes("lime");
      const isDocumentary = activeStyle === "documentary";
      const isGlitchClassified = activeStyle === "classified-yt" || activeStyle.includes("classified");

      // =========================================================================
      // STYLE 1: PAPER STUDIO (Reerts Signature Cream Grid Design)
      // =========================================================================
      if (isPaperStudio) {
        // 1. Warm Cream Paper Background
        ctx.fillStyle = "#F4F1EA";
        ctx.fillRect(0, 0, 360, 640);

        // 2. Subtle Architectural Grid Lines
        ctx.strokeStyle = "rgba(0, 0, 0, 0.045)";
        ctx.lineWidth = 1;
        for (let x = 16; x < 360; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 640);
          ctx.stroke();
        }
        for (let y = 16; y < 640; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(360, y);
          ctx.stroke();
        }

        // 3. Corner Crop Crosshairs (+)
        ctx.strokeStyle = "#94A3B8";
        ctx.lineWidth = 1.2;
        const drawCross = (cx: number, cy: number) => {
          ctx.beginPath();
          ctx.moveTo(cx - 5, cy);
          ctx.lineTo(cx + 5, cy);
          ctx.moveTo(cx, cy - 5);
          ctx.lineTo(cx, cy + 5);
          ctx.stroke();
        };
        drawCross(16, 16);
        drawCross(344, 16);
        drawCross(16, 624);
        drawCross(344, 624);

        // 4. Top Metadata Strip
        ctx.fillStyle = "#52525B";
        ctx.font = `600 8.5px "JetBrains Mono", monospace`;
        ctx.textAlign = "left";
        ctx.fillText("A-ROLL // TAKE 01", 28, 28);
        ctx.textAlign = "right";
        ctx.fillText("1080 x 1920 / 30 FPS", 332, 28);

        // 5. Main Headline: Bold Studio Typography
        const headline1 = plan?.headline || "THE NEW WAY TO";
        const headline2 = plan?.subAccent || "BUILD REELS";

        ctx.textAlign = "left";
        ctx.fillStyle = "#111111";
        ctx.font = `900 24px "Inter Tight", system-ui, sans-serif`;
        ctx.fillText(headline1, 28, 64);
        ctx.fillText(headline2, 28, 92);

        // 6. Yellow Sunburst Accent Dot / 8-pointed Star
        ctx.save();
        ctx.translate(316, 68);
        const starRot = elapsed * 0.4;
        ctx.rotate(starRot);
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Radiating rays
        ctx.fillStyle = "#FBBF24";
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(-2, -9);
          ctx.lineTo(0, -18);
          ctx.lineTo(2, -9);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 7. Concept / Step Tabs
        const steps = plan?.steps || ["01 / CONCEPT", "02 / PIPELINE", "03 / EXPORT"];
        steps.forEach((step, idx) => {
          ctx.save();
          ctx.translate(28 + idx * 104, 116);
          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(0, 0, 96, 22, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#18181B";
          ctx.font = `700 8.5px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.fillText(step, 48, 14);
          ctx.restore();
        });

        // 8. Presenter Video Inside Sharp Paper Card
        const cardX = 18;
        const cardY = 150;
        const cardW = 324;
        const cardH = 430;

        // Subtle shadow
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 14);
        ctx.fill();
        ctx.restore();

        // Video clipping
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 14);
        ctx.clip();

        if (videoElRef.current && videoElRef.current.readyState >= 2) {
          ctx.drawImage(videoElRef.current, cardX, cardY, cardW, cardH);
        } else {
          ctx.fillStyle = "#18181B";
          ctx.fillRect(cardX, cardY, cardW, cardH);
          ctx.fillStyle = "#E4E4E7";
          ctx.font = `600 12px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.fillText("Rendering Take...", cardX + cardW / 2, cardY + cardH / 2);
        }
        ctx.restore();

        // Card Border
        ctx.strokeStyle = "#18181B";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 14);
        ctx.stroke();

        // 9. Karaoke Subtitles in Paper Style
        const wordIndex = Math.max(0, Math.floor((elapsed / 4.8) * SAMPLE_WORDS.length * 1.3)) % SAMPLE_WORDS.length;
        const activeWord = SAMPLE_WORDS[wordIndex];
        const nextWord = SAMPLE_WORDS[(wordIndex + 1) % SAMPLE_WORDS.length];
        const captionY = 530;

        ctx.font = `800 20px "Inter Tight", system-ui, sans-serif`;
        const capText = `${activeWord} ${nextWord}`;
        const capW = ctx.measureText(capText).width + 24;

        // Yellow highlight pill
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.roundRect(180 - capW / 2, captionY - 16, capW, 30, 6);
        ctx.fill();

        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.fillText(capText, 180, captionY + 5);

        // 10. Bottom Studio Metadata Strip
        const sec = Math.floor(elapsed);
        const frame = Math.floor((elapsed % 1) * 30);
        const timecode = `00:00:0${sec}:${frame < 10 ? "0" + frame : frame} // REC`;

        ctx.font = `600 9px "JetBrains Mono", monospace`;
        ctx.fillStyle = "#52525B";
        ctx.textAlign = "left";
        ctx.fillText(timecode, 28, 612);

        // Blinking REC Indicator Dot
        const isBlink = Math.floor(now / 500) % 2 === 0;
        ctx.fillStyle = isBlink ? "#EF4444" : "#991B1B";
        ctx.beginPath();
        ctx.arc(320, 609, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.textAlign = "right";
        ctx.fillText("REC", 312, 612);

      // =========================================================================
      // STYLE 2: LIME SLIDES (Brutalist High-Contrast Acid Lime)
      // =========================================================================
      } else if (isLimeSlides) {
        // Acid Lime Background
        ctx.fillStyle = "#C6FF3D";
        ctx.fillRect(0, 0, 360, 640);

        // Rotating Dotted Orbital Ring
        ctx.save();
        ctx.translate(180, 350);
        ctx.rotate(elapsed * 0.4);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(0, 0, 145, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Giant Uppercase Black Header
        const headlineText = plan?.headline || "NOBODY TELLS YOU";
        ctx.fillStyle = "#000000";
        ctx.font = `900 28px "Inter Tight", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(headlineText.toUpperCase(), 180, 72);

        // Subtitle pill
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.roundRect(70, 88, 220, 26, 4);
        ctx.fill();
        ctx.fillStyle = "#C6FF3D";
        ctx.font = `800 13px "Inter Tight", system-ui, sans-serif`;
        ctx.fillText(plan?.subAccent || "HOW AI RENDERS REELS", 180, 106);

        // Video Stage Inside Black Container
        const cardX = 28;
        const cardY = 140;
        const cardW = 304;
        const cardH = 400;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 18);
        ctx.clip();

        if (videoElRef.current && videoElRef.current.readyState >= 2) {
          ctx.drawImage(videoElRef.current, cardX, cardY, cardW, cardH);
        } else {
          ctx.fillStyle = "#111111";
          ctx.fillRect(cardX, cardY, cardW, cardH);
        }
        ctx.restore();

        // Black Border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 18);
        ctx.stroke();

        // Captions
        const wordIndex = Math.max(0, Math.floor((elapsed / 4.8) * SAMPLE_WORDS.length * 1.3)) % SAMPLE_WORDS.length;
        ctx.fillStyle = "#000000";
        ctx.font = `900 22px "Inter Tight", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(SAMPLE_WORDS[wordIndex].toUpperCase(), 180, 580);

      // =========================================================================
      // STYLE 3: GLITCH CLASSIFIED (Cyber Tech Terminal Split-Screen)
      // =========================================================================
      } else if (isGlitchClassified) {
        ctx.fillStyle = "#0B0B0C";
        ctx.fillRect(0, 0, 360, 640);

        // Classified Red Badge
        ctx.fillStyle = "#AE0006";
        ctx.beginPath();
        ctx.roundRect(24, 28, 120, 20, 4);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 10px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.fillText("[CLASSIFIED]", 84, 42);

        // Terminal Title
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 22px "Inter Tight", system-ui, sans-serif`;
        ctx.textAlign = "left";
        ctx.fillText(plan?.headline || "VIRAL FORMULA", 24, 80);

        // Metrics Box
        ctx.fillStyle = "#16161A";
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(24, 98, 312, 70, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#8E8E93";
        ctx.font = `500 10px "JetBrains Mono", monospace`;
        ctx.fillText(plan?.metricLabel || "views this week", 40, 120);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 24px "Inter Tight", system-ui, sans-serif`;
        const count = Math.round((plan?.metricCount || 84200) * Math.min(1, elapsed / 2));
        ctx.fillText(count.toLocaleString(), 40, 150);

        // Red Accent Line
        ctx.fillStyle = "#FF3B4E";
        ctx.fillRect(40, 158, 140 * Math.min(1, elapsed / 2), 3);

        // Bottom Video Stage
        const cardX = 20;
        const cardY = 190;
        const cardW = 320;
        const cardH = 410;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.clip();

        if (videoElRef.current && videoElRef.current.readyState >= 2) {
          ctx.drawImage(videoElRef.current, cardX, cardY, cardW, cardH);
        } else {
          ctx.fillStyle = "#141416";
          ctx.fillRect(cardX, cardY, cardW, cardH);
        }
        ctx.restore();

        ctx.strokeStyle = "#AE0006";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.stroke();

      // =========================================================================
      // STYLE 4: DOCUMENTARY (Archival Gold & Letterbox)
      // =========================================================================
      } else if (isDocumentary) {
        ctx.fillStyle = "#100F0D";
        ctx.fillRect(0, 0, 360, 640);

        // Gold divider
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 50);
        ctx.lineTo(320, 50);
        ctx.stroke();

        ctx.fillStyle = "#F7F4EB";
        ctx.font = `italic 400 26px "Instrument Serif", serif`;
        ctx.textAlign = "center";
        ctx.fillText(plan?.headline || "The Untapped Archive", 180, 90);

        // Video Stage
        const cardX = 24;
        const cardY = 130;
        const cardW = 312;
        const cardH = 440;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        ctx.clip();

        if (videoElRef.current && videoElRef.current.readyState >= 2) {
          ctx.drawImage(videoElRef.current, cardX, cardY, cardW, cardH);
        } else {
          ctx.fillStyle = "#1C1A16";
          ctx.fillRect(cardX, cardY, cardW, cardH);
        }
        ctx.restore();

        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        ctx.stroke();

      // =========================================================================
      // FALLBACK: Clean Studio
      // =========================================================================
      } else {
        ctx.fillStyle = s.bg || "#000000";
        ctx.fillRect(0, 0, 360, 640);

        ctx.fillStyle = s.ink || "#FFFFFF";
        ctx.font = `800 22px "Inter Tight", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(plan?.headline || "STUDIO EDIT", 180, 60);

        const cardX = 20;
        const cardY = 120;
        const cardW = 320;
        const cardH = 460;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.clip();

        if (videoElRef.current && videoElRef.current.readyState >= 2) {
          ctx.drawImage(videoElRef.current, cardX, cardY, cardW, cardH);
        } else {
          ctx.fillStyle = "#18181B";
          ctx.fillRect(cardX, cardY, cardW, cardH);
        }
        ctx.restore();

        ctx.strokeStyle = s.accent || "#AE0006";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 12);
        ctx.stroke();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center select-none ${className || ""}`}>
      {/* Dynamic 9:16 Canvas */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          className="w-full max-w-[320px] aspect-[9/16] block"
        />

        {/* Audio Mute/Unmute toggle button */}
        {videoSrc && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/20 cursor-pointer"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        )}
      </div>
    </div>
  );
}
