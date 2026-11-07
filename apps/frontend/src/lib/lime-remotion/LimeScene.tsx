import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { LimeResolvedAsset } from "../lime-assets";
import type { LimeSceneSpec } from "../lime-scene-spec";
import { useLimeFontsReady } from "./useLimeFonts";

export type LimeSceneType = "HALO_SPEAKER" | "FULL_GRAPHIC" | "SPLIT_SPEAKER" | "SPEAKER_STICKER" | "NUMBERED_STEP" | "CTA";
export type LimeSpeakerMode = "halo" | "split" | "full" | "hidden";
export type LimeIllustrationName = "phone" | "carousel" | "line_chart" | "gear_diagram" | "swatches" | "calendar" | "video_player" | "editor_window" | "primitive";

export interface LimeSceneProps {
  sceneType: LimeSceneType;
  speakerMode: LimeSpeakerMode;
  headline: string;
  badge?: string;
  illustration: LimeIllustrationName;
  illustrationProps: Record<string, unknown>;
  emphasisWords: string[];
  asset?: Pick<LimeResolvedAsset, "type" | "dataUri" | "alt" | "attribution" | "attributionUrl">;
  sceneSpec?: LimeSceneSpec;
  stepNumber?: number;
  durationInFrames: number;
}

const LIME = "#CCFF08";
const DARK_LIME = "#B5E208";
const BLACK = "#0A0A0A";
const WHITE = "#FFFFFF";
const RED = "#F14B3E";
const WIPE_END_X = 1080 + Math.ceil(2160 * Math.tan(18 * Math.PI / 180)) + 96;

export function getLimeWipeState(frame: number) {
  const progress = Math.max(0, Math.min(1, frame / 7));
  return {
    x: -1400 + (WIPE_END_X + 1400) * progress,
    opacity: frame < 8 ? 1 : 0,
  };
}

function PhoneIllustration() {
  return <svg viewBox="0 0 360 300" width="100%" height="100%" aria-label="Phone with hearts">
    <rect x="109" y="8" width="142" height="280" rx="27" fill={WHITE} stroke={BLACK} strokeWidth="12" />
    <rect x="124" y="43" width="112" height="184" rx="12" fill={LIME} stroke={BLACK} strokeWidth="6" />
    <circle cx="180" cy="257" r="8" fill={BLACK} />
    <path d="M158 101c-23-23-52 10 0 50 52-40 23-73 0-50Z" fill={RED} stroke={BLACK} strokeWidth="5" />
    <path d="M205 156c-15-15-34 7 0 33 34-26 15-48 0-33Z" fill={RED} stroke={BLACK} strokeWidth="4" />
    <path d="M145 194h70" stroke={BLACK} strokeWidth="7" strokeLinecap="round" />
  </svg>;
}

function CarouselIllustration() {
  return <svg viewBox="0 0 420 300" width="100%" height="100%" aria-label="Carousel of cards">
    <g transform="rotate(-10 190 150)"><rect x="40" y="45" width="235" height="205" rx="25" fill={DARK_LIME} stroke={BLACK} strokeWidth="9" /></g>
    <g transform="rotate(8 250 150)"><rect x="130" y="25" width="235" height="205" rx="25" fill={WHITE} stroke={BLACK} strokeWidth="9" />
      <rect x="155" y="55" width="185" height="112" rx="15" fill={LIME} stroke={BLACK} strokeWidth="5" />
      <circle cx="195" cy="106" r="22" fill={RED} /><path d="M230 145l36-48 46 48Z" fill={BLACK} />
      <circle cx="180" cy="199" r="8" fill={BLACK} /><circle cx="204" cy="199" r="8" fill={DARK_LIME} /><circle cx="228" cy="199" r="8" fill={DARK_LIME} />
    </g>
  </svg>;
}

function ChartIllustration() {
  return <svg viewBox="0 0 430 300" width="100%" height="100%" aria-label="Line chart with end point">
    <rect x="18" y="16" width="394" height="268" rx="28" fill={WHITE} stroke={BLACK} strokeWidth="9" />
    {[85, 145, 205].map((y) => <path key={y} d={`M54 ${y}H376`} stroke="#D8D8D8" strokeWidth="4" strokeDasharray="8 10" />)}
    <path d="M58 220 130 185 194 198 258 122 323 137 366 65" fill="none" stroke={BLACK} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="366" cy="65" r="19" fill={RED} stroke={BLACK} strokeWidth="8" />
  </svg>;
}

function GearDiagramIllustration() {
  return <svg viewBox="0 0 430 300" width="100%" height="100%" aria-label="Four connected process tiles">
    <path d="M92 82H338M92 218H338M92 82V218M338 82V218" stroke={BLACK} strokeWidth="8" strokeDasharray="13 10" />
    {[[92,82],[338,82],[92,218],[338,218]].map(([x,y],i) => <g key={i}>
      <rect x={x-54} y={y-48} width="108" height="96" rx="24" fill={i===1?DARK_LIME:WHITE} stroke={BLACK} strokeWidth="8" />
      <circle cx={x} cy={y} r="21" fill={LIME} stroke={BLACK} strokeWidth="7" />
      <path d={`M${x} ${y-30}v-11M${x} ${y+30}v11M${x-30} ${y}h-11M${x+30} ${y}h11`} stroke={BLACK} strokeWidth="8" strokeLinecap="round" />
    </g>)}
  </svg>;
}

function SwatchesIllustration() {
  return <svg viewBox="0 0 430 300" width="100%" height="100%" aria-label="Color swatches and type cards">
    <rect x="25" y="35" width="380" height="230" rx="25" fill={WHITE} stroke={BLACK} strokeWidth="9" />
    {[RED, LIME, DARK_LIME, "#4D72F5"].map((color, i) => <rect key={color} x={52+i*79} y="62" width="62" height="64" rx="12" fill={color} stroke={BLACK} strokeWidth="5" />)}
    <rect x="55" y="151" width="150" height="82" rx="12" fill={BLACK} />
    <text x="130" y="210" fill={WHITE} textAnchor="middle" fontSize="61" fontWeight="900" fontFamily="Arial">Aa</text>
    <path d="M233 162h133M233 190h110M233 218h124" stroke={BLACK} strokeWidth="10" strokeLinecap="round" />
  </svg>;
}

function CalendarIllustration() {
  return <svg viewBox="0 0 380 300" width="100%" height="100%" aria-label="Calendar card">
    <rect x="28" y="25" width="324" height="254" rx="27" fill={WHITE} stroke={BLACK} strokeWidth="10" />
    <path d="M30 95h320" stroke={BLACK} strokeWidth="10" />
    <path d="M104 15v35M276 15v35" stroke={BLACK} strokeWidth="14" strokeLinecap="round" />
    {[0,1,2,3,4,5,6,7,8,9,10,11].map((n) => <rect key={n} x={64+(n%4)*72} y={120+Math.floor(n/4)*48} width="34" height="29" rx="8" fill={n===6?RED:LIME} stroke={BLACK} strokeWidth="4" />)}
  </svg>;
}

function VideoPlayerIllustration() {
  return <svg viewBox="0 0 430 300" width="100%" height="100%" aria-label="Video player and numbered list">
    <rect x="18" y="25" width="394" height="250" rx="25" fill={WHITE} stroke={BLACK} strokeWidth="9" />
    <rect x="38" y="48" width="215" height="174" rx="17" fill={LIME} stroke={BLACK} strokeWidth="6" />
    <path d="m122 94 66 40-66 40Z" fill={BLACK} />
    {[1,2,3].map((n) => <g key={n}><circle cx="292" cy={84+n*48} r="17" fill={DARK_LIME} stroke={BLACK} strokeWidth="5" /><text x="292" y={91+n*48} textAnchor="middle" fontSize="19" fontWeight="900" fontFamily="Arial">{n}</text><path d={`M326 ${83+n*48}h61`} stroke={BLACK} strokeWidth="8" strokeLinecap="round" /></g>)}
  </svg>;
}

function EditorIllustration() {
  return <svg viewBox="0 0 430 300" width="100%" height="100%" aria-label="Editor window with error mark">
    <rect x="18" y="24" width="394" height="252" rx="25" fill={WHITE} stroke={BLACK} strokeWidth="9" />
    <path d="M20 77h390" stroke={BLACK} strokeWidth="8" />
    {[47,70,93].map((x) => <circle key={x} cx={x} cy="51" r="8" fill={RED} />)}
    <rect x="43" y="101" width="178" height="144" rx="13" fill={LIME} stroke={BLACK} strokeWidth="6" />
    <path d="M75 132 185 218M185 132 75 218" stroke={RED} strokeWidth="22" strokeLinecap="round" />
    <path d="M257 127h121M257 160h91M257 193h113M257 226h70" stroke={BLACK} strokeWidth="10" strokeLinecap="round" />
  </svg>;
}

function Illustration({ name, illustrationProps = {} }: { name: LimeIllustrationName; illustrationProps?: Record<string, unknown> }) {
  const art = {
    phone: <PhoneIllustration />, carousel: <CarouselIllustration />, line_chart: <ChartIllustration />,
    gear_diagram: <GearDiagramIllustration />, swatches: <SwatchesIllustration />, calendar: <CalendarIllustration />,
    video_player: <VideoPlayerIllustration />, editor_window: <EditorIllustration />, primitive: <ChartIllustration />,
  }[name];
  const label = [illustrationProps.label, illustrationProps.title, illustrationProps.caption, illustrationProps.value]
    .find((value) => typeof value === "string" && value.trim()) as string | undefined;
  return <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {art}
    {label && <div style={{ position: "absolute", left: "10%", right: "10%", bottom: "4%", padding: "10px 16px", border: `3px solid ${BLACK}`, borderRadius: 14, background: WHITE, color: BLACK, textAlign: "center", font: "800 24px Montserrat, Arial, sans-serif" }}>{label}</div>}
  </div>;
}

function DotGrid() {
  return <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: .13 }}>
    <defs><pattern id="lime-dots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.5" fill={BLACK} /></pattern></defs>
    <rect width="100%" height="100%" fill="url(#lime-dots)" />
  </svg>;
}

export function measureHeadline(text: string, maxWidth: number, initialSize = 140, minSize = 48) {
  if (!document.fonts.check('400 16px "Anton"')) throw new Error("Anton did not load before headline measurement.");
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Headline font measurement is unavailable.");
  const words = text.trim().replace(/\s+/g, " ").split(" ");
  for (let size = initialSize; size >= minSize; size -= 2) {
    context.font = `900 ${size}px Anton, 'Arial Narrow', Impact, sans-serif`;
    const lines: string[] = [];
    let line = "";
    let failed = false;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth) line = candidate;
      else if (!line || context.measureText(word).width > maxWidth) { failed = true; break; }
      else { lines.push(line); line = word; }
      if (lines.length > 1) { failed = true; break; }
    }
    if (!failed) {
      if (line) lines.push(line);
      if (lines.length <= 2) return { text: lines.join("\n"), fontSize: size };
    }
  }
  throw new Error(`Headline cannot fit on two lines at ${minSize}px: ${text}`);
}

export function renderEmphasizedText(text: string, emphasisWords: string[], frame: number): React.ReactNode {
  const emphasized = new Set(emphasisWords.map((word) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean));
  let sequence = 0;
  return text.split(/(\s+)/).map((token, index) => {
    const normalized = token.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    if (!normalized || !emphasized.has(normalized)) return <React.Fragment key={index}>{token}</React.Fragment>;
    const start = sequence++ * 3;
    const scale = interpolate(frame, [start, start + 3, start + 8], [1, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return <span key={index} style={{ display: "inline-block", color: RED, transform: `scale(${scale})`, transformOrigin: "center bottom" }}>{token}</span>;
  });
}

export const LimeScene: React.FC<LimeSceneProps> = (props) => {
  const fontsReady = useLimeFontsReady();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!fontsReady) return null;
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 150, overshootClamping: false } });
  const exit = interpolate(frame, [Math.max(0, props.durationInFrames - 7), props.durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const translateY = interpolate(enter, [0, 1], [48, 0]);
  const scale = interpolate(enter, [0, 1], [.9, 1]);
  const wipe = getLimeWipeState(frame);
  const fullBleed = props.sceneType === "FULL_GRAPHIC" || props.sceneType === "NUMBERED_STEP" || props.sceneType === "CTA";
  const stageHeight = props.sceneType === "SPLIT_SPEAKER" ? 864 : props.sceneType === "HALO_SPEAKER" ? 720 : 1920;
  const headlineLayout = measureHeadline(props.headline, 984);
  const stickerLayout = props.sceneType === "SPEAKER_STICKER" ? measureHeadline(props.headline, 520, 90) : headlineLayout;
  const headline = <div style={{ position: "relative", zIndex: 4, maxWidth: 984, margin: "0 auto", padding: "17px 28px", border: `6px solid ${BLACK}`, borderRadius: 32, background: LIME, color: BLACK, fontFamily: "Anton, 'Arial Narrow', Impact, sans-serif", fontSize: headlineLayout.fontSize, lineHeight: .95, fontWeight: 900, letterSpacing: -2, textAlign: "center", textTransform: "uppercase", whiteSpace: "pre-line", boxShadow: `10px 10px 0 ${BLACK}`, transform: "rotate(-2deg)" }}>{renderEmphasizedText(headlineLayout.text, props.emphasisWords, frame)}</div>;
  const drift = Math.sin(frame * .11) * 10;
  const visualContent = props.asset
    ? <img src={props.asset.dataUri} alt={props.asset.alt} style={{ width: "100%", height: "100%", objectFit: props.asset.type === "logo" ? "contain" : "cover", borderRadius: 28, background: WHITE }} />
    : <Illustration name={props.illustration} illustrationProps={props.illustrationProps} />;
  const assetCredit = props.asset?.attribution ? <div style={{ position: "absolute", zIndex: 5, right: 18, bottom: 18, maxWidth: "88%", padding: "8px 12px", borderRadius: 10, background: "rgba(10,10,10,.82)", color: WHITE, font: "700 17px Montserrat, Arial, sans-serif" }}>{props.asset.attribution}</div> : null;
  const illustration = <div style={{ position: "relative", zIndex: 3, width: 920, height: 620, margin: "28px auto 0", display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${drift}px) rotate(${Math.sin(frame * .07) * .35}deg)` }}>{visualContent}{assetCredit}</div>;
  const badge = props.badge ? <div style={{ position: "absolute", zIndex: 5, left: 70, bottom: 64, padding: "18px 28px", border: `5px solid ${BLACK}`, borderRadius: 28, background: WHITE, color: BLACK, fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: 34, textTransform: "uppercase", transform: `scale(${interpolate(enter, [0, 1], [.65, 1])})` }}>{props.badge}</div> : null;

  return <AbsoluteFill style={{ overflow: "hidden", opacity: 1 - exit * .08 }}>
    {fullBleed && <AbsoluteFill style={{ background: props.sceneType === "CTA" ? BLACK : LIME }}><DotGrid /></AbsoluteFill>}
    {props.sceneType === "HALO_SPEAKER" && <div style={{ position: "absolute", inset: "0 0 auto", height: stageHeight, background: LIME, overflow: "hidden" }}><DotGrid />
      <div style={{ position: "absolute", width: 540, height: 540, left: 270, top: 225, border: `10px dashed ${BLACK}`, borderRadius: "50%", transform: `rotate(${frame * .7}deg)` }} />
      <div style={{ position: "absolute", width: 470, height: 470, left: 305, top: 260, border: `8px solid ${BLACK}`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: 332, right: 38, width: 390, height: 60, borderRadius: 40, background: WHITE, transform: "rotate(-17deg)" }} />
      <div style={{ position: "absolute", top: 60, left: 0, right: 0, transform: `translateY(${translateY}px) scale(${scale})` }}>{headline}</div>
    </div>}
    {props.sceneType === "SPLIT_SPEAKER" && <div style={{ position: "absolute", inset: "0 0 auto", height: stageHeight, padding: "44px 48px", borderRadius: "0 0 70px 70px", background: LIME, border: `8px solid ${BLACK}`, overflow: "hidden" }}><DotGrid />
      <div style={{ transform: `translateY(${translateY}px) scale(${scale})` }}>{headline}</div>{illustration}</div>}
    {props.sceneType === "SPEAKER_STICKER" && <div style={{ position: "absolute", top: 120, left: 52, width: 900, minHeight: 320, padding: 24, display: "flex", alignItems: "center", gap: 18, border: `7px solid ${BLACK}`, borderRadius: 36, background: LIME, boxShadow: `12px 12px 0 ${BLACK}`, transform: `translateY(${translateY}px) scale(${scale}) rotate(-2deg)` }}>
      <div style={{ flex: 1, fontFamily: "Anton, 'Arial Narrow', Impact, sans-serif", fontSize: stickerLayout.fontSize, fontWeight: 900, lineHeight: .95, whiteSpace: "pre-line", textTransform: "uppercase" }}>{renderEmphasizedText(stickerLayout.text, props.emphasisWords, frame)}</div><div style={{ position: "relative", width: 270, height: 230 }}>{props.asset ? <img src={props.asset.dataUri} alt={props.asset.alt} style={{ width: "100%", height: "100%", objectFit: props.asset.type === "logo" ? "contain" : "cover", borderRadius: 14, background: WHITE }} /> : <Illustration name={props.illustration} illustrationProps={props.illustrationProps} />}{assetCredit}</div></div>}
    {props.sceneType === "FULL_GRAPHIC" && <div style={{ position: "absolute", inset: 0, paddingTop: 100 }}><DotGrid /><div style={{ transform: `translateY(${translateY}px) scale(${scale})` }}>{headline}</div>{illustration}
      {props.headline && <div style={{ position: "absolute", left: -40, right: -40, bottom: 110, padding: 18, overflow: "hidden", whiteSpace: "nowrap", background: BLACK, color: LIME, borderTop: `5px solid ${WHITE}`, borderBottom: `5px solid ${WHITE}`, transform: "rotate(-3deg)", font: "900 50px Arial, sans-serif", letterSpacing: 5 }}>{Array(5).fill(props.headline).join("   •   ")}</div>}</div>}
    {props.sceneType === "NUMBERED_STEP" && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 130 }}><DotGrid />
      <div style={{ width: 190, height: 190, display: "grid", placeItems: "center", border: `10px solid ${BLACK}`, borderRadius: "50%", background: WHITE, font: "900 120px Arial, sans-serif", boxShadow: `10px 10px 0 ${BLACK}`, transform: `scale(${scale})` }}>{props.stepNumber}</div>
      <div style={{ marginTop: 34, transform: `translateY(${translateY}px)` }}>{headline}</div>{illustration}</div>}
    {props.sceneType === "CTA" && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><DotGrid />
      <div style={{ position: "absolute", top: "36%", left: "5%", width: "90%", padding: "35px 26px", border: `8px solid ${LIME}`, borderRadius: 34, background: BLACK, color: WHITE, textAlign: "center", font: `900 ${headlineLayout.fontSize}px Anton, 'Arial Narrow', Impact, sans-serif`, whiteSpace: "pre-line", transform: `scale(${scale}) rotate(-2deg)` }}>{renderEmphasizedText(headlineLayout.text, props.emphasisWords, frame)}</div>
    </div>}
    <div style={{ position: "absolute", zIndex: 20, top: -120, bottom: -120, width: 42, left: 0, background: BLACK, opacity: wipe.opacity, transform: `translateX(${wipe.x}px) skewX(-18deg)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", zIndex: 21, top: -120, bottom: -120, width: 16, left: 0, background: WHITE, opacity: wipe.opacity, transform: `translateX(${wipe.x + 48}px) skewX(-18deg)`, pointerEvents: "none" }} />
    {badge}
  </AbsoluteFill>;
};
