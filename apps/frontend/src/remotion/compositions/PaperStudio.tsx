import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  OffthreadVideo,
} from "remotion";
import type { ReelProps } from "../types";
import { SPRING_CONFIG, PALETTES } from "../types";

/* ─── colour tokens ────────────────────────────────────────────────── */
const P = PALETTES.paper;

/* ─── helpers ──────────────────────────────────────────────────────── */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Resolve video src — URLs pass through, local paths use staticFile */
function resolveVideoSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  // For local paths: Remotion serves the public/ dir at root
  return src;
}

/* ─── sub-components ───────────────────────────────────────────────── */

/** Decorative grid dots on cream background */
const GridDots: React.FC = () => {
  const dots: React.ReactNode[] = [];
  const spacing = 48;
  for (let y = 0; y < 1920; y += spacing) {
    for (let x = 0; x < 1080; x += spacing) {
      dots.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 3,
            height: 3,
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.06)",
          }}
        />
      );
    }
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{dots}</AbsoluteFill>;
};

/** Word-by-word karaoke captions overlay */
const KaraokeCaptions: React.FC<{
  words: Array<{ word: string; start: number; end: number }>;
  fps: number;
  currentTimeSec: number;
}> = ({ words, fps, currentTimeSec }) => {
  // Group into lines of ~5 words
  const lineSize = 5;
  const lines: Array<Array<{ word: string; start: number; end: number }>> = [];
  for (let i = 0; i < words.length; i += lineSize) {
    lines.push(words.slice(i, i + lineSize));
  }

  // Find current line
  const currentLine = lines.find(
    (line) =>
      currentTimeSec >= line[0].start &&
      currentTimeSec <= line[line.length - 1].end + 0.3
  );

  if (!currentLine) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 30,
        right: 30,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {currentLine.map((w, i) => {
        const isActive = currentTimeSec >= w.start && currentTimeSec <= w.end;
        return (
          <span
            key={`${w.start}-${i}`}
            style={{
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontSize: 38,
              fontWeight: 800,
              color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.45)",
              backgroundColor: isActive
                ? P.accent
                : "rgba(0,0,0,0.5)",
              padding: "4px 12px",
              borderRadius: 8,
              transition: "none",
              textTransform: "uppercase",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  SCENE 1 — FULL-SCREEN KINETIC HOOK (0 → 3.5s)                   */
/* ═══════════════════════════════════════════════════════════════════ */
const Scene1Hook: React.FC<{
  headline: string;
  subAccent: string;
}> = ({ headline, subAccent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge spring scale
  const badgeScale = spring({ fps, frame, config: SPRING_CONFIG });

  // Headline slam-up
  const headlineY = interpolate(
    spring({ fps, frame: Math.max(0, frame - 8), config: { damping: 14, stiffness: 100 } }),
    [0, 1],
    [120, 0],
    clamp
  );
  const headlineOpacity = interpolate(frame, [6, 18], [0, 1], clamp);

  // Sub-accent slide up
  const subY = interpolate(
    spring({ fps, frame: Math.max(0, frame - 20), config: SPRING_CONFIG }),
    [0, 1],
    [80, 0],
    clamp
  );
  const subOpacity = interpolate(frame, [18, 30], [0, 1], clamp);

  // Italic text fade
  const italicOpacity = interpolate(frame, [40, 60], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <GridDots />

      {/* Metadata top text */}
      <div
        style={{
          position: "absolute",
          top: 80,
          width: "100%",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
          fontSize: 22,
          fontWeight: 500,
          color: P.textMuted,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        A-ROLL | TAKE 01 • EDITED BY STUDIO
      </div>

      {/* Red pill badges */}
      <div
        style={{
          position: "absolute",
          top: 580,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 16,
          transform: `scale(${badgeScale})`,
        }}
      >
        {["PAPER STUDIO", "VIRAL EDIT"].map((label) => (
          <div
            key={label}
            style={{
              backgroundColor: P.accent,
              color: "#FFFFFF",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              padding: "10px 28px",
              borderRadius: 999,
              letterSpacing: 2,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* GIANT headline */}
      <div
        style={{
          position: "absolute",
          top: 720,
          width: "100%",
          textAlign: "center",
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Montserrat', 'Inter', sans-serif",
            fontSize: 96,
            fontWeight: 900,
            color: P.text,
            lineHeight: 1.05,
            padding: "0 60px",
            letterSpacing: -2,
          }}
        >
          {headline}
        </div>
      </div>

      {/* Sub accent */}
      <div
        style={{
          position: "absolute",
          top: 1020,
          width: "100%",
          textAlign: "center",
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Montserrat', 'Inter', sans-serif",
            fontSize: 82,
            fontWeight: 900,
            color: P.accent,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          {subAccent}
        </div>
      </div>

      {/* "you need to see this." italic */}
      <div
        style={{
          position: "absolute",
          bottom: 220,
          width: "100%",
          textAlign: "center",
          opacity: italicOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 28,
            fontWeight: 400,
            fontStyle: "italic",
            color: P.textMuted,
          }}
        >
          you need to see this.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  SCENE 2 — THE RETENTION SPLIT (3.5s → 15s)                      */
/* ═══════════════════════════════════════════════════════════════════ */
const Scene2Split: React.FC<{
  videoSrc: string;
  metricLabel: string;
  metricCount: number;
  steps: [string, string, string];
  captionWords?: Array<{ word: string; start: number; end: number }>;
  globalFrameOffset: number;
}> = ({ videoSrc, metricLabel, metricCount, steps, captionWords, globalFrameOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Counter animation: counts up over 45 frames
  const rawCount = interpolate(frame, [10, 55], [0, metricCount], clamp);
  const displayCount = formatCount(Math.round(rawCount));

  // Card entrance spring
  const cardY = interpolate(
    spring({ fps, frame, config: SPRING_CONFIG }),
    [0, 1],
    [60, 0],
    clamp
  );

  // Pill tag staggered entrance
  const pillScales = steps.map((_, i) =>
    spring({ fps, frame: Math.max(0, frame - 30 - i * 4), config: SPRING_CONFIG })
  );

  // Underline bar width
  const barWidth = interpolate(
    spring({ fps, frame: Math.max(0, frame - 20), config: { damping: 16, stiffness: 90 } }),
    [0, 1],
    [0, 320],
    clamp
  );

  // Video card entrance
  const videoY = interpolate(
    spring({ fps, frame: Math.max(0, frame - 6), config: { damping: 14, stiffness: 110 } }),
    [0, 1],
    [100, 0],
    clamp
  );

  const currentTimeSec = (frame + globalFrameOffset) / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* TOP: dark metric card — 38% of screen */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          right: 40,
          height: "36%",
          backgroundColor: P.card,
          borderRadius: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${cardY}px)`,
          padding: "30px 0",
        }}
      >
        {/* Metric label */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 24,
            fontWeight: 500,
            color: P.accentMuted,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {metricLabel}
        </div>

        {/* Large counter */}
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 108,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          {displayCount}
        </div>

        {/* Red underline bar */}
        <div
          style={{
            width: barWidth,
            height: 5,
            backgroundColor: P.accent,
            borderRadius: 3,
            marginTop: 16,
            marginBottom: 24,
          }}
        />

        {/* Step pills */}
        <div style={{ display: "flex", gap: 14 }}>
          {steps.map((step, i) => (
            <div
              key={step}
              style={{
                backgroundColor: "#27272A",
                border: `2px solid ${P.accent}`,
                borderRadius: 999,
                padding: "8px 24px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: 1,
                transform: `scale(${pillScales[i]})`,
              }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM: user video card — 50% */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          right: 40,
          height: "50%",
          borderRadius: 24,
          overflow: "hidden",
          border: `4px solid ${P.card}`,
          transform: `translateY(${videoY}px)`,
        }}
      >
        <OffthreadVideo
          src={resolveVideoSrc(videoSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Karaoke captions over video */}
        {captionWords && captionWords.length > 0 ? (
          <KaraokeCaptions
            words={captionWords}
            fps={fps}
            currentTimeSec={currentTimeSec}
          />
        ) : (
          /* Placeholder captions */
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 30,
              right: 30,
              display: "flex",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {["how", "I", "build"].map((w, i) => (
              <span
                key={w}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 38,
                  fontWeight: 800,
                  color: i === 1 ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  backgroundColor:
                    i === 1 ? P.accent : "rgba(0,0,0,0.5)",
                  padding: "4px 14px",
                  borderRadius: 8,
                  textTransform: "uppercase",
                }}
              >
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  SCENE 3 — KINETIC BULLET SLIDE (15s → 23s)                      */
/* ═══════════════════════════════════════════════════════════════════ */
const Scene3Bullets: React.FC<{
  steps: [string, string, string];
  videoSrc: string;
}> = ({ steps, videoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dark bg wipe from left
  const wipeX = interpolate(frame, [0, 12], [-1080, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Red label spring
  const labelOpacity = interpolate(frame, [14, 24], [0, 1], clamp);

  // Title spring
  const titleScale = spring({
    fps,
    frame: Math.max(0, frame - 18),
    config: SPRING_CONFIG,
  });

  // Bullet items staggered slide from right
  const bulletXs = steps.map((_, i) =>
    interpolate(
      spring({
        fps,
        frame: Math.max(0, frame - 30 - i * 6),
        config: { damping: 13, stiffness: 100 },
      }),
      [0, 1],
      [400, 0],
      clamp
    )
  );
  const bulletOpacities = steps.map((_, i) =>
    interpolate(frame, [28 + i * 6, 38 + i * 6], [0, 1], clamp)
  );

  const bulletColors = ["#FFFFFF", P.accent, "#FFFFFF"];

  return (
    <AbsoluteFill>
      {/* Wipe dark background */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          backgroundColor: P.card,
          transform: `translateX(${wipeX}px)`,
        }}
      />

      {/* Red label */}
      <div
        style={{
          position: "absolute",
          top: 280,
          left: 80,
          opacity: labelOpacity,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: P.accent,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          THE PLAYBOOK
        </div>
      </div>

      {/* "3 RULES TO SCALE" */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 80,
          right: 80,
          transform: `scale(${titleScale})`,
          transformOrigin: "left center",
        }}
      >
        <div
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 72,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.1,
          }}
        >
          3 RULES{"\n"}TO SCALE
        </div>
      </div>

      {/* Numbered bullet points */}
      {steps.map((step, i) => (
        <div
          key={step}
          style={{
            position: "absolute",
            top: 620 + i * 120,
            left: 80,
            right: 80,
            transform: `translateX(${bulletXs[i]}px)`,
            opacity: bulletOpacities[i],
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 48,
              fontWeight: 900,
              color: bulletColors[i],
              opacity: 0.4,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 48,
              fontWeight: 900,
              color: bulletColors[i],
              opacity: 0.3,
            }}
          >
            •
          </span>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 48,
              fontWeight: 800,
              color: bulletColors[i],
            }}
          >
            {step.toUpperCase()}
          </span>
        </div>
      ))}

      {/* PIP speaker video — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: 60,
          width: 320,
          height: 460,
          borderRadius: 20,
          overflow: "hidden",
          border: `3px solid ${P.accent}`,
        }}
      >
        <OffthreadVideo
          src={resolveVideoSrc(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  SCENE 4 — SPEAKER CLOSE + CTA (23s → end)                       */
/* ═══════════════════════════════════════════════════════════════════ */
const Scene4CTA: React.FC<{
  videoSrc: string;
  captionWords?: Array<{ word: string; start: number; end: number }>;
  globalFrameOffset: number;
}> = ({ videoSrc, captionWords, globalFrameOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slight zoom-in
  const scale = interpolate(frame, [0, 90], [1.0, 1.06], clamp);

  // CTA banner slides up from bottom
  const ctaY = interpolate(
    spring({ fps, frame: Math.max(0, frame - 20), config: { damping: 14, stiffness: 80 } }),
    [0, 1],
    [200, 0],
    clamp
  );
  const ctaOpacity = interpolate(frame, [18, 32], [0, 1], clamp);

  const currentTimeSec = (frame + globalFrameOffset) / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Full-screen speaker video */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 24,
          overflow: "hidden",
          margin: 20,
          transform: `scale(${scale})`,
        }}
      >
        <OffthreadVideo
          src={resolveVideoSrc(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Karaoke captions */}
        {captionWords && captionWords.length > 0 && (
          <KaraokeCaptions
            words={captionWords}
            fps={fps}
            currentTimeSec={currentTimeSec}
          />
        )}
      </div>

      {/* CTA banner */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 60,
          right: 60,
          transform: `translateY(${ctaY}px)`,
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: P.accent,
            borderRadius: 20,
            padding: "22px 0",
            textAlign: "center",
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 30,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: 2,
          }}
        >
          DROP A COMMENT & SAVE 🚀
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPOSITION                                                 */
/* ═══════════════════════════════════════════════════════════════════ */
export const PaperStudio: React.FC<ReelProps> = ({
  videoSrc,
  headline,
  subAccent,
  metricLabel,
  metricCount,
  steps,
  captionWords,
}) => {
  const { fps } = useVideoConfig();

  // Scene timings (frames)
  const s1End = Math.round(3.5 * fps);   // 105
  const s2Start = s1End;                  // 105
  const s2End = Math.round(15 * fps);     // 450
  const s3Start = s2End;                  // 450
  const s3End = Math.round(23 * fps);     // 690
  const s4Start = s3End;                  // 690

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Scene 1: Kinetic Hook */}
      <Sequence from={0} durationInFrames={s1End}>
        <Scene1Hook headline={headline} subAccent={subAccent} />
      </Sequence>

      {/* Scene 2: Retention Split */}
      <Sequence from={s2Start} durationInFrames={s2End - s2Start}>
        <Scene2Split
          videoSrc={videoSrc}
          metricLabel={metricLabel}
          metricCount={metricCount}
          steps={steps}
          captionWords={captionWords}
          globalFrameOffset={s2Start}
        />
      </Sequence>

      {/* Scene 3: Kinetic Bullet Slide */}
      <Sequence from={s3Start} durationInFrames={s3End - s3Start}>
        <Scene3Bullets steps={steps} videoSrc={videoSrc} />
      </Sequence>

      {/* Scene 4: Speaker Close + CTA */}
      <Sequence from={s4Start}>
        <Scene4CTA
          videoSrc={videoSrc}
          captionWords={captionWords}
          globalFrameOffset={s4Start}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
