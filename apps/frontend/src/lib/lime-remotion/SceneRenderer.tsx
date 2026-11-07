import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { LimeResolvedAsset } from "../lime-assets";
import type { LimeSceneComponentSpec, LimeSceneSpec } from "../lime-scene-spec";
import { LimeSceneProps, measureHeadline, renderEmphasizedText } from "./LimeScene";
import { useLimeFontsReady } from "./useLimeFonts";

const LIME = "#CCFF08";
const DARK = "#0A0A0A";
const WHITE = "#FFFFFF";
const RED = "#F14B3E";

type Asset = Pick<LimeResolvedAsset, "type" | "dataUri" | "alt" | "attribution" | "attributionUrl">;

function ImageAsset({ asset, fit = "cover" }: { asset?: Asset; fit?: "cover" | "contain" }) {
  if (!asset) return null;
  return <img src={asset.dataUri} alt={asset.alt} style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }} />;
}

function SceneKitComponent({ component, asset, frame, durationInFrames, index }: {
  component: LimeSceneComponentSpec;
  asset?: Asset;
  frame: number;
  durationInFrames: number;
  index: number;
}) {
  const enterEnd = Math.min(component.endFrame, component.startFrame + 5);
  const exitStart = Math.max(component.startFrame, component.endFrame - 5);
  const enter = interpolate(frame, [component.startFrame, enterEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [exitStart, component.endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(enter, exit);
  const bob = Math.sin(frame * .16 + index) * 5;
  const motion = { opacity, transform: `translateY(${(1 - enter) * 42 + bob}px) scale(${.96 + .04 * enter})` };
  const cardStyle: React.CSSProperties = { width: "100%", height: "100%", overflow: "hidden", boxSizing: "border-box", border: `6px solid ${DARK}`, borderRadius: 30, background: WHITE, color: DARK, boxShadow: `10px 10px 0 ${DARK}`, fontFamily: "Montserrat, Arial, sans-serif" };
  let content: React.ReactNode;

  switch (component.type) {
    case "Card":
      content = <div style={{ ...cardStyle, padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <strong style={{ fontSize: 48, lineHeight: 1.05 }}>{component.props.title}</strong>
        {component.props.body && <span style={{ fontSize: 30, lineHeight: 1.15 }}>{component.props.body}</span>}
        {component.props.accent && <span style={{ alignSelf: "flex-start", padding: "8px 16px", borderRadius: 20, background: LIME, fontSize: 24, fontWeight: 800 }}>{component.props.accent}</span>}
      </div>;
      break;
    case "Phone":
      content = <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}><div style={{ width: "54%", height: "100%", padding: 18, boxSizing: "border-box", border: `10px solid ${DARK}`, borderRadius: 48, background: WHITE, boxShadow: `10px 10px 0 ${DARK}` }}>
        <div style={{ height: "100%", borderRadius: 28, background: LIME, padding: 22, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 15 }}>
          {component.props.title && <strong style={{ fontSize: 28, textAlign: "center" }}>{component.props.title}</strong>}
          {component.props.messages.map((message, messageIndex) => <div key={`${component.id}-message-${messageIndex}`} style={{ alignSelf: messageIndex % 2 ? "flex-end" : "flex-start", maxWidth: "95%", padding: "12px 16px", background: WHITE, border: `3px solid ${DARK}`, borderRadius: 18, fontSize: 22 }}>{message}</div>)}
        </div>
      </div></div>;
      break;
    case "Chart": {
      const max = Math.max(1, ...component.props.values.map((value) => Math.abs(value)));
      content = <div style={{ ...cardStyle, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <strong style={{ fontSize: 36 }}>{component.props.label}</strong>
        <div style={{ display: "flex", alignItems: "end", gap: 16, height: "70%", borderBottom: `5px solid ${DARK}`, padding: "0 10px" }}>
          {component.props.values.map((value, valueIndex) => <div key={`${component.id}-bar-${valueIndex}`} style={{ flex: 1, minWidth: 16, height: `${Math.max(12, Math.abs(value) / max * 90)}%`, border: `3px solid ${DARK}`, borderBottom: 0, borderRadius: "14px 14px 0 0", background: valueIndex === component.props.values.length - 1 ? RED : LIME }} />)}
        </div>
        {component.props.suffix && <span style={{ fontSize: 20 }}>{component.props.suffix}</span>}
      </div>;
      break;
    }
    case "Counter": {
      const progress = interpolate(frame, [component.startFrame, Math.min(component.endFrame, component.startFrame + 12)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const value = Math.round(component.props.value * progress).toLocaleString();
      content = <div style={{ ...cardStyle, display: "grid", placeContent: "center", textAlign: "center", background: LIME }}>
        <strong style={{ fontSize: 112, lineHeight: 1 }}>{component.props.prefix}{value}{component.props.suffix}</strong>
        <span style={{ marginTop: 20, fontSize: 32, fontWeight: 800 }}>{component.props.label}</span>
      </div>;
      break;
    }
    case "Terminal":
      content = <div style={{ ...cardStyle, padding: 24, background: DARK, color: LIME, fontFamily: "monospace", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
        <div style={{ color: RED, fontSize: 24 }}>● ● ●</div><strong style={{ fontSize: 30 }}>&gt; {component.props.command}</strong>
        {component.props.output && <span style={{ color: WHITE, fontSize: 26 }}>{component.props.output}</span>}
      </div>;
      break;
    case "BrowserCard":
      content = <div style={{ ...cardStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 52, flexShrink: 0, background: "#E9EDF2", display: "flex", alignItems: "center", gap: 9, padding: "0 16px", fontSize: 18 }}><span style={{ color: RED }}>● ● ●</span><span style={{ marginLeft: 12 }}>{component.props.urlLabel}</span></div>
        <div style={{ flex: 1, overflow: "hidden", background: LIME }}>{component.props.useRequestedAsset && asset ? <ImageAsset asset={asset} /> : <div style={{ height: "100%", padding: 30, display: "grid", placeContent: "center", textAlign: "center", fontSize: 32, fontWeight: 800 }}>{component.props.summary || component.props.urlLabel}</div>}</div>
      </div>;
      break;
    case "LogoGrid":
      content = <div style={{ display: "grid", height: "100%", gridTemplateColumns: `repeat(${Math.min(3, component.props.labels.length)}, 1fr)`, gridAutoRows: "1fr", gap: 18 }}>
        {component.props.labels.map((label, labelIndex) => <div key={`${component.id}-logo-${labelIndex}`} style={{ ...cardStyle, padding: 16, display: "grid", placeContent: "center", justifyItems: "center", gap: 10, textAlign: "center" }}>
          {labelIndex === 0 && asset?.type === "logo" ? <div style={{ width: 100, height: 100 }}><ImageAsset asset={asset} fit="contain" /></div> : <span style={{ width: 78, height: 78, display: "grid", placeItems: "center", borderRadius: "50%", background: LIME, fontSize: 36, fontWeight: 900 }}>{label.slice(0, 1).toUpperCase()}</span>}
          <strong style={{ fontSize: 22 }}>{label}</strong>
        </div>)}
      </div>;
      break;
    case "Checklist":
      content = <div style={{ ...cardStyle, padding: 26, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        {component.props.items.map((item, itemIndex) => <div key={`${component.id}-item-${itemIndex}`} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, fontWeight: 700 }}><span style={{ width: 42, height: 42, flex: "0 0 42px", display: "grid", placeItems: "center", borderRadius: "50%", background: LIME, border: `3px solid ${DARK}` }}>✓</span>{item}</div>)}
      </div>;
      break;
    case "Photo":
      content = <div style={{ ...cardStyle, position: "relative", background: LIME }}>
        {component.props.useRequestedAsset && asset ? <ImageAsset asset={asset} /> : <div style={{ height: "100%", display: "grid", placeContent: "center", padding: 28, fontSize: 36, fontWeight: 800, textAlign: "center" }}>{component.props.caption || "Visual concept"}</div>}
        {component.props.caption && <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, borderRadius: 12, padding: 10, background: "rgba(10,10,10,.82)", color: WHITE, textAlign: "center", fontSize: 19 }}>{component.props.caption}</div>}
      </div>;
      break;
    case "StatBadge":
      content = <div style={{ ...cardStyle, display: "grid", placeContent: "center", justifyItems: "center", gap: 12, background: RED, color: WHITE, textAlign: "center" }}>
        <strong style={{ fontSize: 96, lineHeight: 1 }}>{component.props.value}</strong><span style={{ fontSize: 30, fontWeight: 800 }}>{component.props.label}</span>
      </div>;
      break;
    case "Ticker": {
      const text = Array(component.props.repeat).fill(component.props.text).join("   •   ");
      content = <div style={{ ...cardStyle, display: "flex", alignItems: "center", whiteSpace: "nowrap", background: DARK, color: LIME, fontSize: 44, fontWeight: 900, borderRadius: 18 }}><div style={{ transform: `translateX(-${(frame * 5) % 420}px)` }}>{text}　{text}</div></div>;
      break;
    }
  }

  return <div style={{ minWidth: 0, minHeight: 0, height: "100%", position: "relative", ...motion }} data-scene-component={component.type} data-duration={durationInFrames}>{content}</div>;
}

export function SceneRenderer(props: LimeSceneProps & { sceneSpec: LimeSceneSpec }) {
  const fontsReady = useLimeFontsReady();
  const frame = useCurrentFrame();
  if (!fontsReady) return null;
  const fullGraphic = props.sceneSpec.layout === "full" || props.sceneType === "FULL_GRAPHIC" || props.sceneType === "NUMBERED_STEP" || props.sceneType === "CTA";
  const stageHeight = fullGraphic ? 1920 : props.sceneSpec.layout === "split" || props.sceneType === "SPLIT_SPEAKER" ? 900 : 760;
  const headline = measureHeadline(props.headline, 984, 136, 52);
  const columnCount = props.sceneSpec.layout === "split" || props.sceneSpec.layout === "editorial" ? Math.min(2, props.sceneSpec.components.length) : 1;
  return <AbsoluteFill style={{ overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: "0 0 auto", height: stageHeight, padding: "54px 48px 40px", boxSizing: "border-box", overflow: "hidden", background: props.sceneType === "CTA" ? DARK : LIME }}>
      {props.sceneSpec.layout !== "full" && <div style={{ position: "absolute", inset: 0, opacity: .12, backgroundImage: "radial-gradient(#0A0A0A 2px, transparent 2px)", backgroundSize: "36px 36px" }} />}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 984, margin: "0 auto", padding: "16px 24px", border: `6px solid ${DARK}`, borderRadius: 30, background: LIME, color: DARK, textAlign: "center", fontFamily: "Anton, Impact, sans-serif", fontSize: headline.fontSize, lineHeight: .95, fontWeight: 900, letterSpacing: -2, whiteSpace: "pre-line", boxShadow: `9px 9px 0 ${DARK}`, transform: `translateY(${Math.sin(frame * .12) * 3}px)` }}>{renderEmphasizedText(headline.text, props.emphasisWords, frame)}</div>
      {props.sceneType === "NUMBERED_STEP" && props.stepNumber != null && <div style={{ position: "absolute", zIndex: 4, top: 270, left: 52, width: 86, height: 86, display: "grid", placeItems: "center", border: `5px solid ${DARK}`, borderRadius: "50%", background: WHITE, fontSize: 50, fontWeight: 900 }}>{props.stepNumber}</div>}
      <div style={{ position: "absolute", zIndex: 2, left: 48, right: 48, top: 300, bottom: 42, display: "grid", gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`, gridAutoRows: "minmax(0, 1fr)", gap: 18, alignContent: "center" }}>
        {props.sceneSpec.components.map((component, index) => <SceneKitComponent key={component.id} component={component} asset={props.asset} frame={frame} durationInFrames={props.durationInFrames} index={index} />)}
      </div>
      {props.asset?.attribution && <div style={{ position: "absolute", zIndex: 5, right: 56, bottom: 12, maxWidth: "90%", padding: "6px 10px", borderRadius: 9, background: "rgba(10,10,10,.82)", color: WHITE, font: "700 15px Montserrat, Arial, sans-serif" }}>{props.asset.attribution}</div>}
    </div>
  </AbsoluteFill>;
}
