import fs from "fs";
import path from "path";
import os from "os";
import { exec, execFile } from "child_process";
import { promisify } from "util";
import type { LimeAssetRequest, LimeRathEditPlan, LimeAuteurEditPlan, LimeSceneBeat } from "./lime-director-schema";
import { limeAssetRequestSchema, reviseLimeBeat } from "./lime-director-schema";
import { resolveLimeAssets, resolveLimeAsset, type LimeResolvedAsset } from "./lime-assets";
import { authorLimeSceneSpecs } from "./lime-scene-spec";
import { assertRealSceneCopy, chunkLimeCaptions } from "./lime-render-utils";
import { buildFaceAwareSpeakerFilter, detectSpeakerFaceTrack } from "./lime-face-tracking";
import { getFfmpegPath, getFfprobePath } from "./media-tool-paths";
import { renderLimeSceneClips, renderLimeSceneStills, TimedLimeScene } from "./lime-remotion/render-scenes";
import type { LimeSceneType, LimeSpeakerMode, LimeIllustrationName } from "./lime-remotion/LimeScene";
import { LimeQualityReport, LimeQualityScene, checkLimeSceneClips } from "./lime-quality-check";

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
let lastLimeQualityReport: LimeQualityReport | null = null;

function resolveLimeFontsDir() {
  const candidates = [
    path.join(process.cwd(), "apps", "frontend", "public", "fonts"),
    path.join(process.cwd(), "public", "fonts"),
    path.resolve(__dirname, "../../public/fonts"),
  ];
  const fontsDir = candidates.find((candidate) => fs.existsSync(path.join(candidate, "Montserrat-ExtraBold.ttf")));
  if (!fontsDir) throw new Error(`Lime Slides caption fonts were not found. Checked: ${candidates.join(", ")}`);
  return fontsDir;
}

function escapeFilterPath(value: string) {
  return value.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

export function getLastLimeQualityReport() {
  return lastLimeQualityReport;
}

function resolvePuppeteer() {
  try {
    return require("puppeteer");
  } catch {}
  try {
    const pnpmPath = path.join(
      process.cwd(),
      "node_modules",
      ".pnpm",
      "puppeteer@25.16.0",
      "node_modules",
      "puppeteer"
    );
    if (fs.existsSync(pnpmPath)) return require(pnpmPath);
  } catch {}
  return null;
}

export interface LimeSceneData {
  sceneType: "halo_hook" | "browser_card" | "split_chart" | "split_metric" | "split_steps" | "closer_cta";
  headline: string;
  start: number;
  end: number;
  beatIndex: number;
  subAccent?: string;
  badgeLabel?: string;
  metricNumber?: string;
  metricLabel?: string;
  steps?: string[];
  visualAssetUrl?: string;
  visualAssetDataUri?: string;
  assetRequest?: LimeAssetRequest;
  resolvedAsset?: LimeResolvedAsset | null;
  renderSceneType?: LimeSceneType;
  speakerMode?: LimeSpeakerMode;
  illustration?: LimeIllustrationName;
  illustrationProps?: Record<string, unknown>;
  emphasisWords?: string[];
  stepNumber?: number;
  assetIntent?: string;
}

const DOT_GRID_SVG = `url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4' cy='4' r='2.5' fill='%23000000' fill-opacity='0.12'/%3E%3C/svg%3E")`;

function escapeHtml(value: string | undefined, fallback = ""): string {
  return (value || fallback).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}

/**
 * Builds the exact HTML/CSS string for each Lime Slides scene type
 * matching Reerts Studio frame-by-frame.
 */
export function buildLimeSceneHtml(scene: LimeSceneData): string {
  const headline = assertRealSceneCopy(scene.headline, "Headline");
  const ringRotation = (scene.beatIndex * 29) % 360;
  if (scene.visualAssetDataUri) {
    const badgeLabel = assertRealSceneCopy(scene.badgeLabel || "", "Illustration label");
    const assetLayout = scene.beatIndex % 2 === 0 ? "wide" : "offset";
    return `<!DOCTYPE html>
      <html><head><meta charset="utf-8"><style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 1080px; height: 1920px; overflow: hidden; position: relative; font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", sans-serif; background: transparent; }
        .stage { position: absolute; inset: 0 0 auto; height: 720px; overflow: hidden; padding: 46px 64px; background: #CCFF00; background-image: ${DOT_GRID_SVG}; }
        .ring { position: absolute; width: 470px; height: 470px; right: -96px; top: 190px; border: 12px dashed #000; border-radius: 50%; transform: rotate(${ringRotation}deg); opacity: .85; }
        .title { position: relative; z-index: 2; display: table; max-width: 900px; margin: 0 auto 26px; padding: 12px 22px; background: #090909; color: #CCFF00; border-radius: 14px; text-align: center; font-size: 49px; line-height: 1.05; font-weight: 900; text-transform: uppercase; box-shadow: 0 12px 0 rgba(0,0,0,.18); }
        .visual { position: relative; z-index: 1; width: 820px; height: 390px; margin: 0 auto; overflow: hidden; border: 8px solid #090909; border-radius: 26px; background: #fff; box-shadow: 0 18px 0 rgba(0,0,0,.18); transform: ${assetLayout === "offset" ? "rotate(2deg) translateX(24px)" : "rotate(-1deg)"}; }
        .visual img { width: 100%; height: 100%; display: block; object-fit: cover; }
        .label { position: absolute; z-index: 3; right: 88px; bottom: 28px; padding: 12px 20px; max-width: 390px; color: #fff; background: #090909; border: 4px solid #CCFF00; border-radius: 14px; font-size: 24px; font-weight: 900; text-transform: uppercase; }
        .number { position: absolute; z-index: 3; left: 72px; bottom: 20px; width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; background: #090909; color: #CCFF00; font-size: 28px; font-weight: 900; }
      </style></head><body><div class="stage"><div class="ring"></div>
        <div class="title">${escapeHtml(headline)}</div>
        <div class="visual"><img src="${scene.visualAssetDataUri}" alt="" /></div>
        <div class="label">${escapeHtml(badgeLabel)}</div><div class="number">${String(scene.beatIndex + 1).padStart(2, "0")}</div>
      </div></body></html>`;
  }
  if (scene.sceneType === "browser_card") {
    const badgeLabel = assertRealSceneCopy(scene.badgeLabel || "", "Illustration label");
    return `<!DOCTYPE html>
      <html><head><meta charset="utf-8"><style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 1080px; height: 1920px; overflow: hidden; position: relative; font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", "Arial Black", sans-serif; background: transparent; }
        .stage { position: absolute; inset: 0 0 auto; height: 720px; padding: 48px 58px; background: #CCFF00; background-image: ${DOT_GRID_SVG}; }
        .title { position: relative; z-index: 2; width: fit-content; max-width: 940px; margin: 0 auto 24px; padding: 8px 18px 12px; color: #CCFF00; background: #090909; border-radius: 10px; font-size: 54px; line-height: 1; font-weight: 900; text-align: center; text-transform: uppercase; box-shadow: 0 8px 0 rgba(0,0,0,.18); }
        .window { position: relative; width: 850px; height: 440px; margin: 0 auto; overflow: hidden; border: 7px solid #090909; border-radius: 26px; background: #fff; box-shadow: 0 18px 0 rgba(0,0,0,.2); transform: rotate(${scene.beatIndex % 2 ? "1deg" : "-1deg"}); }
        .chrome { height: 64px; display: flex; align-items: center; gap: 10px; padding: 0 22px; background: #111; }
        .dot { width: 15px; height: 15px; border-radius: 50%; background: #CCFF00; }
        .address { height: 24px; flex: 1; margin-left: 12px; border-radius: 20px; background: #333; }
        .content { display: grid; grid-template-columns: 1fr 200px; gap: 28px; align-items: center; height: 360px; padding: 30px 36px; }
        .copy { color: #090909; font-size: 46px; line-height: 1.02; font-weight: 900; text-transform: uppercase; overflow-wrap: anywhere; }
        .copy small { display: block; margin-top: 16px; color: #555; font-size: 25px; line-height: 1.1; }
        .symbol { width: 170px; height: 170px; display: grid; place-items: center; border: 6px solid #090909; border-radius: 36px; color: #090909; background: #CCFF00; box-shadow: 8px 8px 0 #090909; }
        .symbol svg { width: 100px; height: 100px; }
        .badge { position: absolute; right: 76px; bottom: 25px; padding: 9px 17px; color: #fff; background: #090909; border: 3px solid #CCFF00; border-radius: 12px; font-size: 23px; font-weight: 900; text-transform: uppercase; }
      </style></head><body><div class="stage">
        <div class="title">${escapeHtml(headline)}</div>
        <div class="window"><div class="chrome"><i class="dot"></i><i class="dot"></i><i class="dot"></i><i class="address"></i></div>
          <div class="content"><div class="copy">${escapeHtml(headline)}<small>${escapeHtml(badgeLabel)}</small></div>
            <div class="symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/><path d="m15 16 2 2 4-5"/></svg></div>
          </div>
        </div><div class="badge">${String(scene.beatIndex + 1).padStart(2, "0")}</div>
      </div></body></html>`;
  }
  // 1. SPLIT-SCREEN GROWTH CHART CARD (frame_04.jpg)
  if (scene.sceneType === "split_chart") {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1080px;
            height: 1920px;
            background: transparent;
            font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", "Arial Black", sans-serif;
            overflow: hidden;
            position: relative;
          }
          .top-stage {
            position: absolute;
            top: 0;
            left: 0;
            width: 1080px;
            height: 720px;
            background-color: #CCFF00;
            background-image: ${DOT_GRID_SVG};
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 55px;
          }
          .headline {
            font-size: 56px;
            font-weight: 900;
            text-transform: uppercase;
            color: #000000;
            letter-spacing: -1.2px;
            margin-bottom: 24px;
          }
          .chart-card {
            width: 780px;
            height: 530px;
            background: #FFFFFF;
            border-radius: 32px;
            box-shadow: 0 20px 45px rgba(0,0,0,0.15);
            padding: 34px 44px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .card-header {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .bar-icon {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 28px;
          }
          .bar-icon span {
            width: 6px;
            background: #000000;
            border-radius: 2px;
          }
          .header-line {
            width: 240px;
            height: 12px;
            background: #000000;
            border-radius: 6px;
          }
          .header-subline {
            width: 140px;
            height: 8px;
            background: #D4D4D8;
            border-radius: 4px;
            margin-top: 6px;
          }
          .chart-area {
            position: relative;
            width: 100%;
            height: 330px;
            margin-top: 15px;
          }
          .grid-line {
            position: absolute;
            width: 100%;
            height: 1.5px;
            background: #F4F4F5;
          }
        </style>
      </head>
      <body>
        <div class="top-stage">
          <div class="headline">${escapeHtml(headline)}</div>
          <div class="chart-card">
            <div class="card-header">
              <div class="bar-icon">
                <span style="height: 12px;"></span>
                <span style="height: 20px;"></span>
                <span style="height: 28px;"></span>
              </div>
              <div>
                <div class="header-line"></div>
                <div class="header-subline"></div>
              </div>
            </div>

            <div class="chart-area">
              <div class="grid-line" style="top: 25%;"></div>
              <div class="grid-line" style="top: 50%;"></div>
              <div class="grid-line" style="top: 75%;"></div>
              <div class="grid-line" style="top: 100%;"></div>

              <svg width="692" height="250" viewBox="0 0 692 250" style="position: absolute; bottom: 0; left: 0;">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#CCFF00" stop-opacity="0.95"/>
                    <stop offset="100%" stop-color="#CCFF00" stop-opacity="0.15"/>
                  </linearGradient>
                </defs>
                <path d="M 0 210 Q 140 190 240 205 T 480 155 L 620 40 L 620 250 L 0 250 Z" fill="url(#chartFill)" />
                <path d="M 0 210 Q 140 190 240 205 T 480 155 L 620 40" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round" />
                <circle cx="620" cy="40" r="14" fill="#CCFF00" stroke="#000000" stroke-width="6" />
              </svg>
            </div>
          </div>
        </div>
      </body>
    </html>`;
  }

  // 2. SPLIT-SCREEN BIG NUMBER / STATS CARD
  if (scene.sceneType === "split_metric") {
    const metricLabel = assertRealSceneCopy(scene.metricLabel || "", "Metric label");
    const metricNumber = assertRealSceneCopy(scene.metricNumber || "", "Metric value");
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1080px;
            height: 1920px;
            background: transparent;
            font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", "Arial Black", sans-serif;
            overflow: hidden;
            position: relative;
          }
          .top-stage {
            position: absolute;
            top: 0;
            left: 0;
            width: 1080px;
            height: 720px;
            background-color: #CCFF00;
            background-image: ${DOT_GRID_SVG};
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 55px;
          }
          .headline {
            font-size: 56px;
            font-weight: 900;
            text-transform: uppercase;
            color: #000000;
            letter-spacing: -1.2px;
            margin-bottom: 24px;
          }
          .metric-card {
            width: 780px;
            height: 530px;
            background: #FFFFFF;
            border-radius: 32px;
            box-shadow: 0 20px 45px rgba(0,0,0,0.15);
            padding: 48px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          .metric-badge {
            background: #000000;
            color: #CCFF00;
            font-size: 20px;
            font-weight: 900;
            padding: 8px 24px;
            border-radius: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24px;
          }
          .metric-num {
            font-size: 110px;
            font-weight: 900;
            color: #000000;
            letter-spacing: -3px;
            line-height: 1;
            margin-bottom: 16px;
          }
          .metric-desc {
            font-size: 32px;
            font-weight: 800;
            color: #71717A;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="top-stage">
          <div class="headline">${escapeHtml(headline)}</div>
          <div class="metric-card">
            <div class="metric-badge">${escapeHtml(metricLabel)}</div>
          <div class="metric-num">${escapeHtml(metricNumber)}</div>
          <div class="metric-desc">${escapeHtml(metricLabel)}</div>
          </div>
        </div>
      </body>
    </html>`;
  }

  // 3. SPLIT-SCREEN 01, 02, 03 SEQUENTIAL DROP CARDS
  if (scene.sceneType === "split_steps") {
    const stepList = (scene.steps || []).map((step) => assertRealSceneCopy(step, "Step label")).slice(0, 3);
    if (!stepList.length) throw new Error("Step scene has no real illustration content.");

    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1080px;
            height: 1920px;
            background: transparent;
            font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", "Arial Black", sans-serif;
            overflow: hidden;
            position: relative;
          }
          .top-stage {
            position: absolute;
            top: 0;
            left: 0;
            width: 1080px;
            height: 720px;
            background-color: #CCFF00;
            background-image: ${DOT_GRID_SVG};
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 50px;
          }
          .headline {
            font-size: 54px;
            font-weight: 900;
            text-transform: uppercase;
            color: #000000;
            letter-spacing: -1.2px;
            margin-bottom: 20px;
          }
          .steps-container {
            width: 820px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .step-row {
            background: #FFFFFF;
            border-radius: 20px;
            padding: 20px 28px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 22px;
          }
          .step-num {
            background: #000000;
            color: #CCFF00;
            font-size: 26px;
            font-weight: 900;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .step-text {
            font-size: 32px;
            font-weight: 800;
            color: #000000;
            letter-spacing: -0.5px;
          }
        </style>
      </head>
      <body>
        <div class="top-stage">
          <div class="headline">${escapeHtml(headline)}</div>
          <div class="steps-container">
            ${stepList.map((step, idx) => `
              <div class="step-row">
                <div class="step-num">0${idx + 1}</div>
                <div class="step-text">${escapeHtml(step)}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </body>
    </html>`;
  }

  // 4. CLOSER CTA CARD (frame_12.jpg style)
  if (scene.sceneType === "closer_cta") {
    const badgeLabel = assertRealSceneCopy(scene.badgeLabel || "", "Call to action");
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 1080px;
            height: 1920px;
            background: transparent;
            font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", "Arial Black", sans-serif;
            overflow: hidden;
            position: relative;
          }
          .top-stage {
            position: absolute;
            top: 0;
            left: 0;
            width: 1080px;
            height: 1920px;
            background-color: #CCFF00;
            background-image: ${DOT_GRID_SVG};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          .cta-pill {
            background: #0B0B0E;
            color: #CCFF00;
            font-size: 76px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -1px;
            padding: 24px 64px;
            border-radius: 28px;
            box-shadow: 0 20px 45px rgba(0,0,0,0.35);
            margin-bottom: 30px;
            transform: rotate(-1deg);
          }
          .loop-badge {
            width: 280px;
            height: 240px;
            background: #CCFF00;
            border: 8px solid #000000;
            border-radius: 36px;
            box-shadow: 0 16px 32px rgba(0,0,0,0.25);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .loop-text {
            font-size: 64px;
            font-weight: 900;
            color: #000000;
            letter-spacing: -2px;
          }
        </style>
      </head>
      <body>
        <div class="top-stage">
          <div class="cta-pill">${escapeHtml(headline)}</div>
          <div class="loop-badge">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <div class="loop-text">${escapeHtml(badgeLabel)}</div>
          </div>
        </div>
      </body>
    </html>`;
  }

  // 5. INTRO HOOK / HALO BEAT (frame_01.jpg & frame_08.jpg)
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1080px;
          height: 1920px;
          background: transparent;
          font-family: Impact, "Arial Narrow", "Franklin Gothic Condensed", "Arial Black", sans-serif;
          overflow: hidden;
          position: relative;
        }
        .top-stage {
          position: absolute;
          top: 0;
          left: 0;
          width: 1080px;
          height: 720px;
          background-color: #CCFF00;
          background-image: ${DOT_GRID_SVG};
          overflow: hidden;
        }
        .hook-pill {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%) rotate(-1.5deg);
          background: #0B0B0E;
          color: #CCFF00;
          font-size: 58px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 42px;
          border-radius: 18px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.45);
          white-space: nowrap;
          z-index: 20;
        }
        .halo-svg {
          position: absolute;
          top: 240px;
          left: 250px;
          width: 580px;
          height: 580px;
          z-index: 2;
        }
        .slanted-ribbon {
          position: absolute;
          top: 360px;
          right: -100px;
          width: 460px;
          height: 80px;
          background: #FFFFFF;
          border-radius: 40px;
          transform: rotate(-14deg);
          z-index: 1;
        }
        .floating-badge {
          position: absolute;
          top: 760px;
          left: 56px;
          width: 320px;
          height: 290px;
          background: #CCFF00;
          border: 7px solid #000000;
          border-radius: 32px;
          box-shadow: 0 16px 32px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 30;
        }
        .badge-counter {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 58px;
          height: 58px;
          background: #000000;
          color: #FFFFFF;
          font-size: 28px;
          font-weight: 900;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-icon {
          width: 120px;
          height: 120px;
          background: #FFFFFF;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(0,0,0,0.1);
          margin-bottom: 14px;
        }
        .pill-label {
          background: #000000;
          color: #CCFF00;
          font-size: 26px;
          font-weight: 900;
          padding: 8px 26px;
          border-radius: 20px;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="top-stage">
        <div class="hook-pill">${escapeHtml(headline)}</div>
        <div class="slanted-ribbon"></div>
        <svg class="halo-svg" viewBox="0 0 580 580" style="transform: rotate(${ringRotation}deg)">
          <circle cx="290" cy="290" r="260" fill="none" stroke="#000000" stroke-width="8" stroke-dasharray="24 16" />
          <circle cx="290" cy="290" r="210" fill="none" stroke="#000000" stroke-width="5" />
        </svg>
      </div>

      <div class="floating-badge">
        <div class="badge-counter">1</div>
        <div class="app-icon">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="3" stroke-linecap="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
          </svg>
        </div>
        <div class="pill-label">${escapeHtml(assertRealSceneCopy(scene.badgeLabel || "", "Illustration label"))}</div>
      </div>
    </body>
  </html>`;
}

/**
 * Maps planned scenes from Gemini/Rath into high-fidelity Lime Slides scene data.
 */
export function mapPlanToLimeScenes(
  plan: LimeRathEditPlan | undefined,
  durationSec: number,
  transcriptWords: Array<{ word: string; start: number; end: number }> = []
): LimeSceneData[] {
  if (plan?.limeBeats?.length) {
    return plan.limeBeats.map((beat, index) => ({
      sceneType: beat.sceneType === "HALO_SPEAKER" || beat.sceneType === "SPEAKER_STICKER" ? "halo_hook"
        : beat.sceneType === "NUMBERED_STEP" ? "split_steps"
        : beat.sceneType === "CTA" ? "closer_cta" : "split_chart",
      renderSceneType: beat.sceneType,
      speakerMode: beat.speakerMode,
      illustration: beat.illustration,
      illustrationProps: beat.illustrationProps,
      emphasisWords: beat.emphasisWords,
      stepNumber: beat.stepIndex,
      headline: assertRealSceneCopy(beat.headline.toUpperCase().replace(/\s+/g, " ").trim(), "Scene headline"),
      start: beat.startMs / 1000,
      end: beat.endMs / 1000,
      beatIndex: index,
      badgeLabel: beat.badge,
      assetIntent: beat.assetIntent,
      assetRequest: beat.assetRequest as LimeAssetRequest | undefined,
    }));
  }
  const realCopy = (value?: string) => {
    if (!value) return undefined;
    try { return assertRealSceneCopy(value); } catch { return undefined; }
  };
  const scenes = plan?.scenes || [];
  if (scenes.length === 0) {
    const count = Math.max(1, Math.ceil(durationSec / 1.65));
    const fallbackBeats: LimeSceneData[] = [];
    for (let idx = 0; idx < count; idx++) {
      const start = idx * durationSec / count;
      const end = (idx + 1) * durationSec / count;
      const spoken = transcriptWords
        .filter((word) => word.start < end && word.end > start)
        .map((word) => word.word)
        .join(" ");
      fallbackBeats.push({
        sceneType: idx === 0 ? "halo_hook" : idx === count - 1 ? "closer_cta" : (idx % 3 === 0 && plan?.steps?.some((step) => realCopy(step)) ? "split_steps" : "split_chart"),
        headline: assertRealSceneCopy(idx === 0 ? (realCopy(plan?.headline) || spoken) : (spoken || realCopy(plan?.headline) || ""), "Scene headline").toUpperCase(),
        start,
        end,
        beatIndex: idx,
        badgeLabel: realCopy(plan?.subAccent) || realCopy(plan?.headline) || assertRealSceneCopy(spoken, "Illustration label"),
        metricNumber: plan?.metricCount ? String(plan.metricCount) : "",
        metricLabel: realCopy(plan?.metricLabel),
        steps: plan?.steps?.map(realCopy).filter((step): step is string => Boolean(step)),
      });
    }
    return fallbackBeats;
  }

  const sorted = scenes
    .map((scene, idx) => ({ scene, idx }))
    .sort((a, b) => a.scene.start - b.scene.start);
  const validTimedScenes = sorted.filter(({ scene }) => Number.isFinite(scene.start) && Number.isFinite(scene.end) && scene.end > scene.start);
  const timingScenes = validTimedScenes.length ? validTimedScenes : sorted.map(({ scene }, idx) => ({ scene: { ...scene, start: idx * durationSec / sorted.length, end: (idx + 1) * durationSec / sorted.length }, idx }));
  const origin = Math.max(0, timingScenes[0]?.scene.start || 0);
  const planEnd = timingScenes[timingScenes.length - 1]?.scene.end || durationSec;
  const scale = durationSec / Math.max(0.1, planEnd - origin);
  const beats: LimeSceneData[] = [];
  let beatIndex = 0;
  let previousSceneEnd = 0;

  for (let sceneIndex = 0; sceneIndex < timingScenes.length; sceneIndex++) {
    const { scene, idx } = timingScenes[sceneIndex];
    const start = previousSceneEnd;
    const end = sceneIndex === timingScenes.length - 1
      ? durationSec
      : Math.min(durationSec, Math.max(start + 0.1, (scene.end - origin) * scale));
    previousSceneEnd = end;
    const span = Math.max(0.1, end - start);
    const beatBoundaries = [start];
    while (end - beatBoundaries[beatBoundaries.length - 1] > 2.1) {
      const cursor = beatBoundaries[beatBoundaries.length - 1];
      const target = cursor + 1.65;
      const candidates = transcriptWords
        .filter((word, wordIdx) => {
          const gap = wordIdx > 0 ? word.start - transcriptWords[wordIdx - 1].end : 0;
          return word.end >= cursor + 1.0 && word.end <= cursor + 2.1 && (gap >= 0.12 || /[,.!?;:]$/.test(word.word));
        })
        .map((word) => word.end);
      const cut = candidates.length
        ? candidates.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best)
        : target;
      beatBoundaries.push(Math.min(end - 0.1, Math.max(cursor + 0.1, cut)));
    }
    beatBoundaries.push(end);
    const beatCount = beatBoundaries.length - 1;
    const isFinalScene = sceneIndex === timingScenes.length - 1;
    const usableSteps = (scene.onScreenText || []).map(realCopy).filter((text): text is string => Boolean(text));
    const hasMetric = Boolean(realCopy(plan?.metricLabel) && plan?.metricCount);
    const visualKinds: LimeSceneData["sceneType"][] = scene.visualType === "cta" || isFinalScene
      ? ["closer_cta"]
      : scene.visualType === "counter" || scene.visualType === "coin-proof"
        ? (hasMetric ? ["split_metric", "split_chart", "split_metric"] : ["split_chart"])
        : scene.visualType === "steps"
          ? (usableSteps.length ? ["split_steps", "split_chart", "split_steps"] : ["split_chart"])
          : scene.visualType === "diagram"
            ? (usableSteps.length ? ["split_steps"] : ["split_chart"])
            : scene.visualType === "browser-card"
              ? ["browser_card"]
            : ["halo_hook", "split_chart", "split_metric", "split_steps"];

    for (let localBeat = 0; localBeat < beatCount; localBeat++) {
      const beatStart = beatBoundaries[localBeat];
      const beatEnd = beatBoundaries[localBeat + 1];
      const spoken = transcriptWords
        .filter((word) => word.start < beatEnd && word.end > beatStart)
        .map((word) => word.word)
        .join(" ");
      const headline = assertRealSceneCopy(realCopy(scene.headline) || realCopy(plan?.headline) || realCopy(scene.subAccent) || "", "Scene headline").toUpperCase();
      beats.push({
        sceneType: visualKinds[(localBeat + sceneIndex) % visualKinds.length],
        headline,
        start: beatStart,
        end: beatEnd,
        beatIndex,
        subAccent: scene.subAccent || plan?.subAccent,
        badgeLabel: realCopy(scene.badgeText) || realCopy(plan?.assets?.[idx]?.title) || headline,
        metricNumber: plan?.metricCount ? String(plan.metricCount) : "",
        metricLabel: realCopy(plan?.metricLabel),
        steps: usableSteps.length ? usableSteps : plan?.steps?.map(realCopy).filter((step): step is string => Boolean(step)),
        visualAssetUrl: plan?.assets?.find((asset) =>
          asset.badge === "recording" && asset.sceneIds.includes(scene.sceneId) && asset.thumbnailUrl
        )?.thumbnailUrl,
      });
      beatIndex++;
    }
  }

  return beats;
}

/**
 * Renders all Lime Slides scene plates to PNG files using Puppeteer.
 */
export async function renderLimePlatesToDisk(
  scenes: LimeSceneData[],
  projectId: string
): Promise<string[]> {
  const puppeteer = resolvePuppeteer();
  if (!puppeteer) {
    throw new Error("[Lime Engine] Puppeteer not found in node_modules");
  }

  const tmpDir = os.tmpdir();
  const platePaths: string[] = [];
  const imageCache = new Map<string, string>();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (scene.visualAssetUrl) {
        try {
          const url = new URL(scene.visualAssetUrl);
          if (url.protocol === "https:" && (url.hostname === "cdn.coverr.co" || url.hostname.endsWith(".coverr.co"))) {
            let dataUri = imageCache.get(url.href);
            if (!dataUri) {
              const response = await fetch(url.href, { signal: AbortSignal.timeout(5000) });
              const contentType = response.headers.get("content-type") || "";
              const bytes = Buffer.from(await response.arrayBuffer());
              if (response.ok && /^image\/(png|jpeg|webp|gif)$/.test(contentType) && bytes.length <= 5 * 1024 * 1024) {
                dataUri = `data:${contentType};base64,${bytes.toString("base64")}`;
                imageCache.set(url.href, dataUri);
              }
            }
            scene.visualAssetDataUri = dataUri;
          }
        } catch (assetErr: any) {
          console.warn("[Lime Engine] Could not load scene image asset:", assetErr?.message || assetErr);
        }
      }
      const platePath = path.join(tmpDir, `lime_plate_${projectId}_${i}.png`);
      let rendered = false;
      let lastError: unknown;
      for (let attempt = 0; attempt < 2 && !rendered; attempt++) {
        try {
          await page.setContent(buildLimeSceneHtml(scene), { waitUntil: "domcontentloaded" });
          await page.evaluate(async () => {
            await document.fonts.ready;
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Could not measure headline font metrics.");
            const headlines = document.querySelectorAll<HTMLElement>(".title, .headline, .hook-pill, .cta-pill");
            for (const element of headlines) {
              const text = (element.textContent || "").replace(/\s+/g, " ").trim();
              if (!text) throw new Error("A scene headline is empty.");
              const computed = getComputedStyle(element);
              const family = computed.fontFamily;
              const weight = computed.fontWeight;
              const width = 984; // 48px safe margins on a 1080px frame.
              let fitted: string[] | null = null;
              let fittedSize = 0;
              for (let size = 140; size >= 48; size -= 2) {
                context.font = `${weight} ${size}px ${family}`;
                const lines: string[] = [];
                let line = "";
                let failed = false;
                for (const word of text.split(/\s+/)) {
                  const candidate = line ? `${line} ${word}` : word;
                  if (context.measureText(candidate).width <= width) line = candidate;
                  else if (!line) { failed = true; break; }
                  else {
                    lines.push(line);
                    line = word;
                    if (context.measureText(line).width > width) { failed = true; break; }
                  }
                  if (lines.length > 1) { failed = true; break; }
                }
                if (!failed) {
                  if (line) lines.push(line);
                  if (lines.length <= 2) { fitted = lines; fittedSize = size; break; }
                }
              }
              if (!fitted) throw new Error(`Headline cannot fit in two lines with 48px margins: ${text}`);
              element.textContent = fitted.join("\n");
              element.style.maxWidth = `${width}px`;
              element.style.whiteSpace = "pre-line";
              element.style.fontSize = `${fittedSize}px`;
            }
          });
          await page.screenshot({ path: platePath, omitBackground: true });
          const image = fs.readFileSync(platePath);
          const validPng = image.length > 4096 && image.toString("ascii", 1, 4) === "PNG";
          const correctSize = validPng && image.readUInt32BE(16) === 1080 && image.readUInt32BE(20) === 1920;
          if (!correctSize) throw new Error(`Scene ${i + 1} did not render a full 1080×1920 plate.`);
          rendered = true;
        } catch (error) {
          lastError = error;
        }
      }
      if (!rendered) throw lastError || new Error(`Scene ${i + 1} failed its plate check.`);
      platePaths.push(platePath);
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return platePaths;
}

/**
 * Generates the white subtitle pill ASS script matching Reerts Lime Slides.
 */
export function buildLimeSubtitlesAss(
  transcriptWords: Array<{ word: string; start: number; end: number }>,
  durationSec: number
): string {
  const formatTime = (sec: number) => {
    const s = Math.max(0, sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = (s % 60).toFixed(2);
    return `${h}:${String(m).padStart(2, "0")}:${String(rem).padStart(5, "0")}`;
  };

  const header = `[Script Info]
Title: Reerts Lime Slides Native Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: LimePill,Montserrat ExtraBold,46,&H00000000,&H00000000,&H00FFFFFF,&H00FFFFFF,-1,0,0,0,100,100,0,0,3,13,0,2,0,0,235,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = chunkLimeCaptions(transcriptWords || [], durationSec).map(({ words, start, end }) => {
    const text = words.map((word) => word.word).join(" ").replace(/[{}]/g, "");
    const pop = "{\\fscx100\\fscy100\\t(0,90,\\fscx108\\fscy108)\\t(90,180,\\fscx100\\fscy100)}";
    return `Dialogue: 1,${formatTime(start)},${formatTime(end)},LimePill,,0,0,0,,${pop}${text}`;
  });

  return header + events.join("\n") + "\n";
}

/**
 * High-performance full Lime Slides video compositing engine matching Reerts Studio.
 */
export async function renderLimeSlidesVideo(options: {
  projectId: string;
  absVideoPath: string;
  outputPath: string;
  plan?: LimeRathEditPlan;
  transcriptWords?: Array<{ word: string; start: number; end: number }>;
  durationSec: number;
  cutoutVideo?: boolean;
}): Promise<string> {
  const { projectId, absVideoPath, outputPath, plan, transcriptWords, durationSec, cutoutVideo } = options;
  const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
  const ffmpeg = getFfmpegPath();
  const renderStartedAt = Date.now();

  const limeScenes = mapPlanToLimeScenes(plan, durationSec, transcriptWords || []);
  const resolvedAssets = await resolveLimeAssets(limeScenes.map((scene) => scene.assetRequest));
  resolvedAssets.forEach((asset, index) => { limeScenes[index].resolvedAsset = asset; });
  const sceneSpecs = plan?.limeBeats
    ? await authorLimeSceneSpecs(plan.limeBeats, resolvedAssets.map((asset) => asset?.alt))
    : limeScenes.map(() => null);
  const authoredSceneCount = sceneSpecs.filter(Boolean).length;
  if (authoredSceneCount) console.info(`[Lime scene agent] Authored ${authoredSceneCount}/${sceneSpecs.length} declarative scenes; ${sceneSpecs.length - authoredSceneCount} use LimeScene fallback.`);
  const remotionScenes: TimedLimeScene[] = limeScenes.map((scene, index) => ({
    sceneType: scene.renderSceneType || (scene.sceneType === "closer_cta" ? "CTA" : scene.sceneType === "split_steps" ? "NUMBERED_STEP" : scene.sceneType === "split_chart" || scene.sceneType === "split_metric" || scene.sceneType === "browser_card" ? "FULL_GRAPHIC" : "HALO_SPEAKER"),
    speakerMode: scene.speakerMode || (scene.sceneType === "closer_cta" || scene.sceneType === "split_steps" || scene.sceneType === "split_chart" || scene.sceneType === "split_metric" ? "hidden" : "halo"),
    headline: scene.headline,
    badge: scene.badgeLabel,
    illustration: scene.illustration || ["phone", "carousel", "line_chart", "gear_diagram", "swatches", "calendar", "video_player", "editor_window"][index % 8] as LimeIllustrationName,
    illustrationProps: scene.illustrationProps || {},
    emphasisWords: scene.emphasisWords || [],
    stepNumber: scene.stepNumber,
    asset: scene.resolvedAsset || undefined,
    sceneSpec: sceneSpecs[index] || undefined,
    start: scene.start,
    end: scene.end,
    durationInFrames: Math.max(1, Math.round((scene.end - scene.start) * 30)),
  }));
  const initialRender = await renderLimeSceneClips(remotionScenes, safeId);
  let clips = initialRender.clips;
  const clipDirectories = [initialRender.directory];
  const initialStills = await renderLimeSceneStills(remotionScenes, safeId);
  let stills = initialStills.stills;
  const stillDirectories = [initialStills.directory];

  // Generate white subtitle pills ASS
  const assContent = buildLimeSubtitlesAss(transcriptWords || [], durationSec);
  const assPath = path.join(os.tmpdir(), `lime_subtitles_${safeId}.ass`);
  const filterScriptPath = path.join(os.tmpdir(), `lime_filter_${safeId}.txt`);
  fs.writeFileSync(assPath, assContent, "utf8");
  const safeAssPath = escapeFilterPath(assPath);
  const safeFontsDir = escapeFilterPath(resolveLimeFontsDir());
  let faceTrackCoverage = cutoutVideo ? 1 : 0;
  let faceFallbackContain = !cutoutVideo;
  let speakerFilter: string | null = null;
  let hasAudio = true;
  try {
    const { stdout } = await execFileAsync(getFfprobePath(), [
      "-v", "error", "-show_entries", "stream=codec_type,width,height", "-of", "json", absVideoPath,
    ], { maxBuffer: 1024 * 1024 });
    const streams = JSON.parse(stdout).streams || [];
    hasAudio = streams.some((stream: any) => stream.codec_type === "audio");
    if (!cutoutVideo) {
      const videoStream = streams.find((stream: any) => stream.codec_type === "video");
      const track = await detectSpeakerFaceTrack(absVideoPath, durationSec, ffmpeg, resolvePuppeteer());
      const fitted = track && buildFaceAwareSpeakerFilter(track.samples, Number(videoStream?.width), Number(videoStream?.height), 1920, track.coverage);
      if (fitted) {
        speakerFilter = fitted.filter;
        faceTrackCoverage = track!.coverage;
        faceFallbackContain = false;
        console.info(`[Lime Slides] Face crop track ${Math.round(track!.coverage * 100)}% sampled coverage at ${fitted.diagnostics.scale.toFixed(2)}×.`);
      }
    }
  } catch (error: any) {
    console.warn("[Lime Slides] Could not analyze speaker framing; using contain fallback:", error?.message || error);
  }
  const baseSpeakerFilter = cutoutVideo
    ? "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1,format=rgba,eq=contrast=1.04:saturation=1.05"
    : `${speakerFilter || "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xCCFF08,setsar=1"},eq=contrast=1.04:saturation=1.05`;

  const compose = async () => {
    let inputsCmd = `-i "${absVideoPath}"`;
    for (const clip of clips) inputsCmd += ` -i "${clip.path}"`;
    const filterParts: string[] = [`color=c=0xCCFF08:s=1080x1920:r=30[base]`, `[0:v]${baseSpeakerFilter}[spk]`, `[base][spk]overlay=0:0:format=auto[initial]`];
    let lastLayer = "initial";
    for (let index = 0; index < clips.length; index++) {
      const startSec = Math.max(0, clips[index].start).toFixed(3);
      const endSec = Math.min(durationSec, clips[index].end).toFixed(3);
      filterParts.push(`[${index + 1}:v]setpts=PTS-STARTPTS+${startSec}/TB[scene_${index}]`);
      filterParts.push(`[${lastLayer}][scene_${index}]overlay=0:0:enable='between(t,${startSec},${endSec})':eof_action=pass:shortest=0[layer_${index}]`);
      lastLayer = `layer_${index}`;
    }

    const effectInputs: string[] = [];
    for (const [index, scene] of remotionScenes.entries()) {
      const delayMs = Math.round(scene.start * 1000);
      const whoosh = `whoosh_${index}`;
      const pop = `pop_${index}`;
      filterParts.push(`anoisesrc=color=pink:sample_rate=44100:duration=0.18:amplitude=0.12,highpass=f=280,afade=t=in:st=0:d=0.01,afade=t=out:st=0.05:d=0.13,adelay=${delayMs}|${delayMs}[${whoosh}]`);
      filterParts.push(`sine=frequency=880:sample_rate=44100:duration=0.09,volume=0.08,afade=t=out:st=0.02:d=0.07,adelay=${delayMs}|${delayMs}[${pop}]`);
      effectInputs.push(`[${whoosh}]`, `[${pop}]`);
    }
    const effectMix = effectInputs.join("");
    filterParts.push(`${effectMix}amix=inputs=${effectInputs.length}:duration=longest:dropout_transition=0,volume=0.35[fx]`);
    if (hasAudio) filterParts.push(`[0:a]aresample=44100[orig];[orig][fx]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14.1:TP=-2.0:LRA=11[aout]`);
    else filterParts.push(`anullsrc=r=44100:cl=stereo:d=${durationSec.toFixed(2)}[orig];[orig][fx]amix=inputs=2:duration=first:dropout_transition=0[aout]`);
    filterParts.push(`[${lastLayer}]ass=filename='${safeAssPath}':fontsdir='${safeFontsDir}'[outv]`);
    fs.writeFileSync(filterScriptPath, filterParts.join(";\n"), "utf8");
    const preview = process.env.LIME_RENDER_PREVIEW === "true";
    const preset = preview ? "superfast" : "medium";
    const crf = preview ? 23 : 18;
    const cmd = `"${ffmpeg}" -y ${inputsCmd} -filter_complex_script "${filterScriptPath}" -map [outv] -map [aout] -c:v libx264 -profile:v main -level 4.0 -preset ${preset} -crf ${crf} -pix_fmt yuv420p -c:a aac -ar 44100 -ac 2 -b:a 128k -movflags +faststart -t ${durationSec.toFixed(2)} "${outputPath}"`;
    try {
      await execAsync(cmd, { maxBuffer: 12 * 1024 * 1024, timeout: 60 * 60 * 1000 });
    } catch (error: any) {
      const details = String(error?.stderr || error?.message || "FFmpeg failed").split(/\r?\n/).filter(Boolean).slice(-12).join("\n");
      throw new Error(`Lime Slides FFmpeg composition failed: ${details.slice(-1800)}`);
    }
  };

  const qualityBeats: LimeSceneBeat[] = remotionScenes.map((scene, index) => ({
    startMs: Math.round(scene.start * 1000), endMs: Math.round(scene.end * 1000), sceneType: scene.sceneType,
    headline: scene.headline, badge: scene.badge, illustration: scene.illustration,
    illustrationProps: scene.illustrationProps, speakerMode: scene.speakerMode,
    emphasisWords: scene.emphasisWords, assetIntent: limeScenes[index].assetIntent || scene.headline,
    assetRequest: limeScenes[index].assetRequest,
  }));
  const qualityScenes: LimeQualityScene[] = qualityBeats.map((beat, index) => ({
    beat,
    asset: remotionScenes[index].asset || null,
    sceneSpec: remotionScenes[index].sceneSpec || null,
  }));

  const checkQuality = () => checkLimeSceneClips({
    sourceVideoPath: absVideoPath,
    scenes: qualityScenes,
    stillPaths: stills.map((scene) => scene.paths),
    sceneClipPaths: clips.map((clip) => clip.path),
    transcriptWords: transcriptWords || [],
    durationSec,
    faceTrackCoverage,
    faceFallbackContain,
    renderMs: Date.now() - renderStartedAt,
  });

  try {
    await compose();
    let report = await checkQuality();
    for (let retry = 0; report.failedScenes.length && retry < 2; retry++) {
      const retryIndexes = report.failedScenes.map((item) => item.index);
      for (const index of retryIndexes) {
        const revised = await reviseLimeBeat(qualityBeats[index], report.failedScenes.find((item) => item.index === index)!.failures);
        qualityBeats[index] = revised;
        qualityScenes[index].beat = revised;
        remotionScenes[index] = {
          ...remotionScenes[index], sceneType: revised.sceneType, speakerMode: revised.speakerMode,
          headline: revised.headline, badge: revised.badge, illustration: revised.illustration,
          illustrationProps: revised.illustrationProps, emphasisWords: revised.emphasisWords,
          asset: revised.assetRequest ? await resolveLimeAsset(limeAssetRequestSchema.parse(revised.assetRequest) as LimeAssetRequest) || undefined : undefined,
        };
      }
      const retried = await renderLimeSceneClips(retryIndexes.map((index) => remotionScenes[index]), `${safeId}-retry-${retry + 1}`);
      clipDirectories.push(retried.directory);
      retryIndexes.forEach((index, retryIndex) => { clips[index] = { ...clips[index], path: retried.clips[retryIndex].path, scene: remotionScenes[index] }; });
      const retriedStills = await renderLimeSceneStills(retryIndexes.map((index) => remotionScenes[index]), `${safeId}-retry-${retry + 1}`);
      stillDirectories.push(retriedStills.directory);
      retryIndexes.forEach((index, retryIndex) => {
        stills[index] = retriedStills.stills[retryIndex];
        qualityScenes[index].asset = remotionScenes[index].asset || null;
        qualityScenes[index].sceneSpec = remotionScenes[index].sceneSpec || null;
      });
      await compose();
      report = await checkQuality();
    }
    if (report.failedScenes.length) {
      const fallbackIndexes = report.failedScenes.map((item) => item.index);
      console.warn(`[Lime Slides QA] ${fallbackIndexes.length} scene(s) still failed after two revisions; rendering the proven LimeScene fallback.`);
      fallbackIndexes.forEach((index) => {
        remotionScenes[index] = { ...remotionScenes[index], sceneSpec: undefined };
        qualityScenes[index].sceneSpec = null;
      });
      const fallbackClips = await renderLimeSceneClips(fallbackIndexes.map((index) => remotionScenes[index]), `${safeId}-fallback`);
      clipDirectories.push(fallbackClips.directory);
      fallbackIndexes.forEach((index, fallbackIndex) => {
        clips[index] = { ...clips[index], path: fallbackClips.clips[fallbackIndex].path, scene: remotionScenes[index] };
      });
      const fallbackStills = await renderLimeSceneStills(fallbackIndexes.map((index) => remotionScenes[index]), `${safeId}-fallback`);
      stillDirectories.push(fallbackStills.directory);
      fallbackIndexes.forEach((index, fallbackIndex) => { stills[index] = fallbackStills.stills[fallbackIndex]; });
      await compose();
      report = await checkQuality();
    }
    lastLimeQualityReport = { ...report, numbers: { ...report.numbers, renderMs: Date.now() - renderStartedAt } };
    console.info(`[Lime Slides] Render report: ${report.numbers.visualChanges} visual changes / ${durationSec.toFixed(1)}s; max ${report.numbers.maxCaptionActive} active captions; face framing ${report.numbers.faceInsideCropPercent.toFixed(1)}%; motion ${report.numbers.motionCoveragePercent == null ? "not measured" : `${report.numbers.motionCoveragePercent.toFixed(1)}%`}; ${(lastLimeQualityReport.numbers.renderMs / 1000).toFixed(2)}s render.`);
    if (report.failedScenes.length) {
      const issues = report.failedScenes.flatMap((scene) => scene.failures).slice(0, 5).join("; ");
      throw new Error(`Lime Slides quality check failed after two scene retries: ${issues}`);
    }
  } finally {
    for (const directory of clipDirectories) {
      try { fs.rmSync(directory, { recursive: true, force: true }); } catch {}
    }
    for (const directory of stillDirectories) {
      try { fs.rmSync(directory, { recursive: true, force: true }); } catch {}
    }
    try { if (fs.existsSync(assPath)) fs.unlinkSync(assPath); } catch {}
    try { if (fs.existsSync(filterScriptPath)) fs.unlinkSync(filterScriptPath); } catch {}
  }
  return outputPath;
}
