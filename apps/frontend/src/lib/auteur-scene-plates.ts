import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { PlannedScene } from "./gemini-video-pipeline";
import { StyleVisualConfig } from "./auteur-ass-composer";

export interface ScenePlateOptions {
  scene: PlannedScene;
  sceneIndex: number;
  totalScenes: number;
  theme: StyleVisualConfig;
}

function getFfmpegPath(): string {
  try {
    const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
    if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
      return ffmpegInstaller.path;
    }
  } catch {}
  return "ffmpeg";
}

function escXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanStepText(raw: string, maxChars = 26): string {
  const stripped = String(raw || "")
    .replace(/^\s*0?[1-9]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxChars
    ? stripped.slice(0, maxChars).trim()
    : stripped;
}

/**
 * Renders the Top Hook Header:
 * - Line 1: Bold Condensed Uppercase Title
 * - Line 2: Colored Highlighter Box with Bold Italic Serif text
 */
function buildTopHookHeaderSvg(
  headline: string,
  subAccent: string,
  theme: StyleVisualConfig,
  isDarkStage: boolean
): string {
  const h1 = escXml((headline || "KEY FOCUS").slice(0, 24));
  const h2 = escXml((subAccent || "CRITICAL INSIGHT").slice(0, 26));
  const titleFill = isDarkStage ? "#FFFFFF" : "#111111";
  const boxFill = theme.highlightHex || "#FACC15";
  const boxTextFill = theme.highlightTextHex || "#0B0B0E";
  const boxWidth = Math.min(920, Math.max(460, h2.length * 34 + 80));
  const boxX = Math.round((1080 - boxWidth) / 2);

  return `
    <!-- Top Hook Header -->
    <text x="540" y="138" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-size="66" font-weight="900" fill="${titleFill}" text-anchor="middle" letter-spacing="-1">${h1}</text>
    <rect x="${boxX}" y="164" width="${boxWidth}" height="86" rx="8" fill="${boxFill}" />
    <text x="540" y="226" font-family="Liberation Serif, DejaVu Serif, serif" font-size="52" font-weight="700" font-style="italic" fill="${boxTextFill}" text-anchor="middle">${h2}</text>
  `;
}

/**
 * Renders the Split-Screen Browser Proof Stage:
 * - Top half (y=0..1260): Dark studio grid background + Top Hook Header + Browser Window
 *   with live verified counter/data, highlight box, modal, and alert badge
 * - Bottom half (y=1260..1920): Cutout for live speaker video
 */
function buildBrowserProofStageSvg(
  scene: PlannedScene,
  sceneIndex: number,
  theme: StyleVisualConfig
): string {
  const isLossBeat =
    scene.visualType === "counter" ||
    sceneIndex === 1 ||
    sceneIndex === 3 ||
    sceneIndex === 7;
  const badgeText = escXml(scene.badgeText || "source.reference.internal");
  const line0 = escXml(
    cleanStepText(scene.onScreenText?.[0] || "VERIFIED DATA BEAT", 24)
  );
  const line1 = escXml(
    cleanStepText(
      scene.onScreenText?.[1] ||
        (isLossBeat ? "CRITICAL METRIC" : "KEY AUDIT POINT"),
      22
    )
  );
  const stampLabel = escXml(
    (scene as any).stampText || (isLossBeat ? "IMPACT" : "VERIFIED")
  );
  const topBg = theme.isDarkCanvas
    ? "#" + theme.canvasBgHex.replace(/^0x/i, "")
    : "#0D0E12";
  const domainHeader = escXml(badgeText.toUpperCase().split("/")[0].slice(0, 16));

  return `
    <!-- Top Stage Background (y=0..1260) -->
    <rect x="0" y="0" width="1080" height="1260" fill="${topBg}" />
    <!-- Subtle Grid Lines on Top Stage -->
    <line x1="0" y1="290" x2="1080" y2="290" stroke="#27272A" stroke-width="2" />
    <line x1="0" y1="1258" x2="1080" y2="1258" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="4" />

    ${buildTopHookHeaderSvg(scene.headline, scene.subAccent, theme, true)}

    <!-- Browser Window Card (x=56, y=300, w=968, h=860) -->
    <rect x="56" y="300" width="968" height="860" rx="22" fill="#14161D" stroke="#3F3F46" stroke-width="3" />
    <!-- Browser Top Chrome Bar -->
    <rect x="56" y="300" width="968" height="64" rx="22" fill="#1F222B" />
    <circle cx="96" cy="332" r="9" fill="#EF4444" />
    <circle cx="124" cy="332" r="9" fill="#F59E0B" />
    <circle cx="152" cy="332" r="9" fill="#10B981" />
    <rect x="190" y="314" width="460" height="36" rx="8" fill="#111318" stroke="#2E323E" stroke-width="1.5" />
    <text x="212" y="338" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="700" fill="#E4E4E7">${badgeText}</text>
    <rect x="820" y="316" width="176" height="32" rx="6" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="908" y="338" font-family="Liberation Sans, sans-serif" font-size="16" font-weight="900" fill="#0B0B0E" text-anchor="middle">OFFICIAL CAPTURE</text>

    <!-- Source Bar inside Browser -->
    <rect x="84" y="388" width="28" height="28" rx="6" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="126" y="411" font-family="Liberation Sans, sans-serif" font-size="26" font-weight="900" fill="${theme.highlightHex || "#FACC15"}" letter-spacing="1">${domainHeader}</text>
    <text x="320" y="409" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="700" fill="#A1A1AA">Overview   Metrics   Analysis   Timeline   Sources</text>
    <rect x="884" y="384" width="110" height="34" rx="6" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="939" y="407" font-family="Liberation Sans, sans-serif" font-size="17" font-weight="900" fill="#111111" text-anchor="middle">Verified</text>

    <!-- Left Column: Primary Callout Metric Box -->
    <rect x="84" y="454" width="510" height="236" rx="14" fill="#1D202A" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="5" />
    <text x="110" y="532" font-family="Liberation Sans, sans-serif" font-size="46" font-weight="900" fill="${theme.highlightHex || "#FACC15"}">${line0}</text>
    <text x="110" y="592" font-family="Liberation Sans, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">${line1}</text>
    <text x="110" y="646" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="700" fill="#94A3B8">${stampLabel}</text>

    <!-- Right Column: Verification Notice Modal -->
    <rect x="616" y="454" width="380" height="330" rx="16" fill="#1C1E26" stroke="#52525B" stroke-width="2.5" />
    <circle cx="806" cy="516" r="28" fill="#422006" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="3" />
    <text x="806" y="528" font-family="Liberation Sans, sans-serif" font-size="34" font-weight="900" fill="${theme.highlightHex || "#FACC15"}" text-anchor="middle">✓</text>
    <text x="806" y="582" font-family="Liberation Sans, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" text-anchor="middle">FACT CHECK</text>
    <text x="806" y="618" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="600" fill="#A1A1AA" text-anchor="middle">Primary Audio Sync</text>
    <text x="806" y="646" font-family="Liberation Sans, sans-serif" font-size="18" font-weight="600" fill="#A1A1AA" text-anchor="middle">Verified Frame Alignment</text>
    <rect x="652" y="688" width="308" height="58" rx="10" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="806" y="725" font-family="Liberation Sans, sans-serif" font-size="22" font-weight="900" fill="#0B0B0E" text-anchor="middle">CONFIRMED</text>

    <!-- Bottom Callout Banner inside Browser -->
    ${
      isLossBeat
        ? `
      <rect x="84" y="820" width="912" height="295" rx="18" fill="#2A0A10" stroke="#EF4444" stroke-width="4" />
      <text x="540" y="925" font-family="Liberation Sans, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle">${line0}</text>
      <rect x="310" y="960" width="460" height="108" rx="14" fill="#EF4444" />
      <text x="540" y="1034" font-family="Liberation Sans, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${stampLabel}</text>
    `
        : `
      <rect x="84" y="726" width="510" height="175" rx="14" fill="#181B23" stroke="#2E323E" stroke-width="2" />
      <text x="112" y="776" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="700" fill="#94A3B8">VALIDATED RECORD</text>
      <text x="112" y="835" font-family="Liberation Sans, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF">${line0}</text>
      <text x="112" y="876" font-family="DejaVu Sans Mono, monospace" font-size="18" font-weight="700" fill="${theme.highlightHex || "#FACC15"}">${line1}</text>

      <!-- Alert Stamp Pill -->
      <rect x="270" y="965" width="540" height="125" rx="62" fill="#450A0A" stroke="#EF4444" stroke-width="4" />
      <circle cx="340" cy="1027" r="14" fill="#EF4444" />
      <text x="565" y="1044" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#FECACA" text-anchor="middle">${stampLabel}</text>
    `
    }

    <!-- Seam Caption Backdrop Bar at y=1192..1278 -->
    <rect x="110" y="1192" width="860" height="86" rx="16" fill="#09090B" fill-opacity="0.92" stroke="#27272A" stroke-width="2" />
  `;
}

/**
 * Renders the Visual Proof Card Stage
 */
function buildBitcoinCoinStageSvg(
  scene: PlannedScene,
  theme: StyleVisualConfig
): string {
  const topBg = theme.isDarkCanvas
    ? "#" + theme.canvasBgHex.replace(/^0x/i, "")
    : "#0D0E12";
  const badgeLabel = escXml(scene.badgeText || "EVIDENCE");
  const headline = escXml(scene.onScreenText?.[0] || "CRITICAL RECORD");

  return `
    <!-- Top Stage Background -->
    <rect x="0" y="0" width="1080" height="1260" fill="${topBg}" />
    <line x1="0" y1="1258" x2="1080" y2="1258" stroke="#F59E0B" stroke-width="4" />

    ${buildTopHookHeaderSvg(scene.headline, scene.subAccent, theme, true)}

    <!-- Viewfinder Card (x=56, y=300, w=968, h=860) -->
    <rect x="56" y="300" width="968" height="860" rx="22" fill="#151310" stroke="#F59E0B" stroke-width="3" />

    <!-- Viewfinder Corner Brackets -->
    <path d="M 96 380 L 96 340 L 136 340" fill="none" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" />
    <path d="M 984 380 L 984 340 L 944 340" fill="none" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" />
    <path d="M 96 1080 L 96 1120 L 136 1120" fill="none" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" />
    <path d="M 984 1080 L 984 1120 L 944 1120" fill="none" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" />

    <!-- Center Seal / Medallion -->
    <circle cx="540" cy="690" r="220" fill="#1E293B" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="10" />
    <circle cx="540" cy="690" r="180" fill="#0F172A" stroke="#94A3B8" stroke-width="4" stroke-dasharray="14,8" />
    <text x="540" y="670" font-family="Liberation Sans, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" text-anchor="middle">${badgeLabel}</text>
    <text x="540" y="740" font-family="DejaVu Sans Mono, monospace" font-size="28" font-weight="700" fill="${theme.highlightHex || "#FACC15"}" text-anchor="middle">${headline}</text>

    <!-- Attribution Pill -->
    <rect x="86" y="1062" width="490" height="46" rx="10" fill="#09090B" fill-opacity="0.85" stroke="#3F3F46" stroke-width="1.5" />
    <text x="110" y="1092" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="700" fill="#E4E4E7">Reference · CC BY-SA 4.0</text>

    <!-- Seam Caption Backdrop Bar -->
    <rect x="110" y="1192" width="860" height="86" rx="16" fill="#09090B" fill-opacity="0.92" stroke="#27272A" stroke-width="2" />
  `;
}

/**
 * Renders the Full-Screen 01 / 02 / 03 Numbered List + Verdict Stamp Stage
 */
function buildNumberedStepsStageSvg(
  scene: PlannedScene,
  theme: StyleVisualConfig
): string {
  const row1 = escXml(
    cleanStepText(scene.onScreenText?.[0] || "INITIAL NARRATIVE POINT", 24)
  );
  const row2 = escXml(
    cleanStepText(scene.onScreenText?.[1] || "CRITICAL CORROBORATION", 24)
  );
  const row3 = escXml(
    cleanStepText(scene.onScreenText?.[2] || "FINAL LOGICAL TAKEAWAY", 24)
  );
  const stamp = escXml(
    (scene as any).stampText || scene.onScreenText?.[3] || "KEY TAKEAWAY"
  );
  const bgHex = theme.isDarkCanvas
    ? "#" + theme.canvasBgHex.replace(/^0x/i, "")
    : "#0D0E12";

  return `
    <!-- Full-Screen 1080x1920 Dark Stage -->
    <rect x="0" y="0" width="1080" height="1920" fill="${bgHex}" />
    <!-- Subtle Grid Lines -->
    <line x1="0" y1="300" x2="1080" y2="300" stroke="#27272A" stroke-width="2" />
    <line x1="0" y1="1480" x2="1080" y2="1480" stroke="#27272A" stroke-width="2" />
    <line x1="60" y1="0" x2="60" y2="1920" stroke="#27272A" stroke-width="2" />
    <line x1="1020" y1="0" x2="1020" y2="1920" stroke="#27272A" stroke-width="2" />

    ${buildTopHookHeaderSvg(scene.headline, scene.subAccent, theme, true)}

    <!-- Row 01 -->
    <rect x="84" y="420" width="912" height="185" rx="18" fill="#171922" stroke="#3F3F46" stroke-width="2.5" />
    <text x="135" y="538" font-family="DejaVu Sans Mono, monospace" font-size="64" font-weight="900" fill="#A1A1AA">01</text>
    <line x1="255" y1="455" x2="255" y2="570" stroke="#3F3F46" stroke-width="3" />
    <text x="295" y="532" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">${row1}</text>

    <!-- Row 02 -->
    <rect x="84" y="645" width="912" height="185" rx="18" fill="#171922" stroke="#3F3F46" stroke-width="2.5" />
    <text x="135" y="763" font-family="DejaVu Sans Mono, monospace" font-size="64" font-weight="900" fill="#A1A1AA">02</text>
    <line x1="255" y1="680" x2="255" y2="795" stroke="#3F3F46" stroke-width="3" />
    <text x="295" y="757" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">${row2}</text>

    <!-- Row 03 (Active Highlighted Yellow Bar) -->
    <rect x="84" y="870" width="912" height="195" rx="18" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="135" y="994" font-family="DejaVu Sans Mono, monospace" font-size="68" font-weight="900" fill="${theme.highlightTextHex || "#0B0B0E"}">03</text>
    <line x1="255" y1="905" x2="255" y2="1030" stroke="${theme.highlightTextHex || "#0B0B0E"}" stroke-width="4" />
    <text x="295" y="988" font-family="Liberation Sans, sans-serif" font-size="46" font-weight="900" fill="${theme.highlightTextHex || "#0B0B0E"}">${row3}</text>

    <!-- Seam Caption Backdrop Bar -->
    <rect x="110" y="1192" width="860" height="86" rx="16" fill="#09090B" fill-opacity="0.92" stroke="#27272A" stroke-width="2" />

    <!-- Tilted Red Stamp Verdict Box -->
    <g transform="translate(540, 1520) rotate(-3)">
      <rect x="-340" y="-100" width="680" height="200" rx="18" fill="#3B0A0A" stroke="#EF4444" stroke-width="8" />
      <text x="0" y="32" font-family="Liberation Sans, sans-serif" font-size="74" font-weight="900" fill="#EF4444" text-anchor="middle" letter-spacing="4">${stamp}</text>
    </g>
  `;
}

/**
 * Renders the Full-Screen Kinetic Typography Slam Stage
 */
function buildKineticSlamStageSvg(
  scene: PlannedScene,
  theme: StyleVisualConfig
): string {
  const topLine = escXml(
    cleanStepText(scene.onScreenText?.[0] || "CRITICAL MOMENTUM", 28)
  );
  const slamWord = escXml(
    (scene as any).stampText || scene.onScreenText?.[2] || "IMPACT"
  );
  const subLine = escXml(
    cleanStepText(scene.onScreenText?.[1] || "VERIFIED SYSTEM EVENT", 24)
  );

  return `
    <rect x="0" y="0" width="1080" height="1920" fill="#090A0F" />
    <line x1="60" y1="0" x2="60" y2="1920" stroke="#27272A" stroke-width="2" />
    <line x1="1020" y1="0" x2="1020" y2="1920" stroke="#27272A" stroke-width="2" />

    ${buildTopHookHeaderSvg(scene.headline, scene.subAccent, theme, true)}

    <rect x="84" y="420" width="912" height="680" rx="28" fill="#12141D" stroke="#EF4444" stroke-width="4" />
    <text x="540" y="555" font-family="Liberation Sans, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle">${topLine}</text>

    <rect x="160" y="625" width="760" height="240" rx="22" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="540" y="802" font-family="Liberation Sans, sans-serif" font-size="140" font-weight="900" fill="${theme.highlightTextHex || "#0B0B0E"}" text-anchor="middle" letter-spacing="6">${slamWord}</text>

    <rect x="260" y="925" width="560" height="86" rx="14" fill="#450A0A" stroke="#EF4444" stroke-width="3" />
    <text x="540" y="982" font-family="DejaVu Sans Mono, monospace" font-size="34" font-weight="900" fill="#FCA5A5" text-anchor="middle" letter-spacing="2">${subLine}</text>

    <!-- Seam Caption Backdrop Bar -->
    <rect x="110" y="1192" width="860" height="86" rx="16" fill="#09090B" fill-opacity="0.92" stroke="#27272A" stroke-width="2" />
  `;
}

/**
 * Renders the Full-Screen 3-Node Connected Architecture Diagram Stage
 */
function buildNodeDiagramStageSvg(
  scene: PlannedScene,
  theme: StyleVisualConfig
): string {
  const rootLabel = escXml(scene.onScreenText?.[0] || scene.headline || "CORE ARCHITECTURE");
  const child1 = escXml(scene.onScreenText?.[1] || "LAYER 01");
  const child2 = escXml(scene.onScreenText?.[2] || "LAYER 02");
  const child3 = escXml(scene.onScreenText?.[3] || "LAYER 03");
  const bgHex = theme.isDarkCanvas
    ? "#" + theme.canvasBgHex.replace(/^0x/i, "")
    : "#0D0E12";

  return `
    <!-- Full-Screen 1080x1920 Dark Stage -->
    <rect x="0" y="0" width="1080" height="1920" fill="${bgHex}" />
    <line x1="60" y1="0" x2="60" y2="1920" stroke="#27272A" stroke-width="2" />
    <line x1="1020" y1="0" x2="1020" y2="1920" stroke="#27272A" stroke-width="2" />

    ${buildTopHookHeaderSvg(scene.headline, scene.subAccent, theme, true)}

    <!-- Connector Lines from Root Node (540, 620) to 3 Child Nodes (200, 540, 880 at y=960) -->
    <line x1="540" y1="620" x2="200" y2="960" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" stroke-dasharray="14,10" />
    <line x1="540" y1="620" x2="540" y2="960" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" stroke-dasharray="14,10" />
    <line x1="540" y1="620" x2="880" y2="960" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" stroke-dasharray="14,10" />

    <!-- Top Root Node -->
    <rect x="290" y="450" width="500" height="170" rx="22" fill="#181A24" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="6" />
    <text x="540" y="555" font-family="Liberation Sans, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle">${rootLabel}</text>

    <!-- Bottom Left Node -->
    <rect x="56" y="960" width="290" height="165" rx="18" fill="#161821" stroke="#52525B" stroke-width="3" />
    <circle cx="201" cy="1012" r="14" fill="#10B981" />
    <text x="201" y="1082" font-family="Liberation Sans, sans-serif" font-size="30" font-weight="800" fill="#FFFFFF" text-anchor="middle">${child1}</text>

    <!-- Bottom Center Node -->
    <rect x="395" y="960" width="290" height="165" rx="18" fill="#161821" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="4" />
    <circle cx="540" cy="1012" r="14" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="540" y="1082" font-family="Liberation Sans, sans-serif" font-size="32" font-weight="900" fill="${theme.highlightHex || "#FACC15"}" text-anchor="middle">${child2}</text>

    <!-- Bottom Right Node -->
    <rect x="734" y="960" width="290" height="165" rx="18" fill="#161821" stroke="#52525B" stroke-width="3" />
    <circle cx="879" cy="1012" r="14" fill="#EF4444" />
    <text x="879" y="1082" font-family="Liberation Sans, sans-serif" font-size="30" font-weight="800" fill="#FFFFFF" text-anchor="middle">${child3}</text>

    <!-- Seam Caption Backdrop Bar -->
    <rect x="110" y="1192" width="860" height="86" rx="16" fill="#09090B" fill-opacity="0.92" stroke="#27272A" stroke-width="2" />

    <!-- Bottom Summary Box -->
    <rect x="120" y="1380" width="840" height="320" rx="22" fill="#14161F" stroke="#3F3F46" stroke-width="3" />
    <text x="540" y="1495" font-family="Liberation Sans, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle">CORROBORATED LOGICAL LINK</text>
    <rect x="260" y="1545" width="560" height="96" rx="14" fill="#1E293B" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="3" />
    <text x="540" y="1608" font-family="Liberation Sans, sans-serif" font-size="38" font-weight="900" fill="#FFFFFF" text-anchor="middle">VERIFIED PIPELINE BEAT</text>
  `;
}

/**
 * Renders the Closer CTA Stage
 */
function buildCloserCtaStageSvg(
  scene: PlannedScene,
  theme: StyleVisualConfig
): string {
  const cta = escXml(scene.onScreenText?.[0] || "FOLLOW FOR MORE");
  const sub = escXml(
    cleanStepText(scene.onScreenText?.[1] || "CRITICAL SUMMARY & RECAP", 24)
  );

  return `
    <!-- Top Stage Background (y=0..1260) -->
    <rect x="0" y="0" width="1080" height="1260" fill="#0D0E12" />
    <line x1="0" y1="1258" x2="1080" y2="1258" stroke="${theme.highlightHex || "#FACC15"}" stroke-width="4" />

    ${buildTopHookHeaderSvg(scene.headline, scene.subAccent, theme, true)}

    <!-- Pill Card -->
    <rect x="120" y="450" width="840" height="270" rx="36" fill="${theme.highlightHex || "#FACC15"}" />
    <text x="540" y="618" font-family="Liberation Sans, sans-serif" font-size="80" font-weight="900" fill="${theme.highlightTextHex || "#0B0B0E"}" text-anchor="middle" letter-spacing="4">${cta}</text>

    <rect x="200" y="790" width="680" height="104" rx="18" fill="#181A24" stroke="#EF4444" stroke-width="4" />
    <text x="540" y="856" font-family="DejaVu Sans Mono, monospace" font-size="32" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${sub}</text>

    <!-- Seam Caption Backdrop Bar -->
    <rect x="110" y="1192" width="860" height="86" rx="16" fill="#09090B" fill-opacity="0.92" stroke="#27272A" stroke-width="2" />
  `;
}

/**
 * Renders the Dry Erase & Receipt Roll Chin-Board Overlay
 */
function buildChinBoardOverlaySvg(
  scene: PlannedScene,
  sceneIndex: number,
  theme: StyleVisualConfig
): string {
  const isReceipt = theme.layoutFamily === "receipt_roll";
  const h1 = escXml((scene.headline || "KEY SUMMARY").slice(0, 22));
  const h2 = escXml((scene.subAccent || "CORE INSIGHT").slice(0, 24));
  const items =
    scene.onScreenText && scene.onScreenText.length > 0
      ? scene.onScreenText
      : ["Point 01: Core Topic", "Point 02: Corroboration", "Point 03: Final Result"];

  const item0 = escXml(cleanStepText(items[0] || "Point 01: Core Topic", 24));
  const item1 = escXml(cleanStepText(items[1] || "Point 02: Corroboration", 24));
  const item2 = escXml(
    cleanStepText(items[2] || (scene as any).stampText || "KEY ALERT", 20)
  );

  const vt = String(scene.visualType || "");
  const isFullScreenBoard =
    vt === "steps" ||
    vt === "numbered-steps" ||
    vt === "diagram" ||
    vt === "node-diagram";

  if (isFullScreenBoard) {
    return `
      <!-- Full-Screen Dry Erase Whiteboard / Receipt Stage -->
      <rect x="0" y="0" width="1080" height="1920" fill="${isReceipt ? "#EFECE6" : "#F1F5F9"}" />
      <rect x="44" y="60" width="992" height="1780" rx="24" fill="#FFFFFF" stroke="${isReceipt ? "#18181B" : "#94A3B8"}" stroke-width="10" />
      <!-- Corner Mounting Rivets -->
      <circle cx="80" cy="96" r="10" fill="#64748B" />
      <circle cx="1000" cy="96" r="10" fill="#64748B" />
      <circle cx="80" cy="1804" r="10" fill="#64748B" />
      <circle cx="1000" cy="1804" r="10" fill="#64748B" />

      <!-- Top Marker Title -->
      <rect x="96" y="110" width="340" height="54" rx="10" fill="${isReceipt ? "#18181B" : "#1D4ED8"}" />
      <text x="266" y="147" font-family="DejaVu Sans Mono, monospace" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">${isReceipt ? "RECEIPT ROLL #0" + (sceneIndex + 1) : "DRY ERASE BOARD"}</text>

      <text x="540" y="265" font-family="Liberation Sans, sans-serif" font-size="64" font-weight="900" fill="#0F172A" text-anchor="middle">${h1}</text>
      <text x="540" y="345" font-family="Liberation Serif, serif" font-size="52" font-weight="700" font-style="italic" fill="#DC2626" text-anchor="middle">${h2}</text>
      <path d="M 180 370 Q 540 388 900 366" fill="none" stroke="#DC2626" stroke-width="8" stroke-linecap="round" />

      <!-- Marker Point 1 -->
      <rect x="96" y="425" width="888" height="185" rx="18" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4" />
      <rect x="130" y="472" width="86" height="86" rx="16" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="4" />
      <text x="173" y="532" font-family="DejaVu Sans Mono, monospace" font-size="44" font-weight="900" fill="#1D4ED8" text-anchor="middle">01</text>
      <text x="250" y="534" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#1E293B">${item0}</text>

      <!-- Marker Point 2 -->
      <rect x="96" y="640" width="888" height="185" rx="18" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4" />
      <rect x="130" y="687" width="86" height="86" rx="16" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="4" />
      <text x="173" y="747" font-family="DejaVu Sans Mono, monospace" font-size="44" font-weight="900" fill="#1D4ED8" text-anchor="middle">02</text>
      <text x="250" y="749" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#1E293B">${item1}</text>

      <!-- Marker Point 3 (Red Marker Highlight) -->
      <rect x="96" y="855" width="888" height="185" rx="18" fill="#FEF2F2" stroke="#DC2626" stroke-width="6" />
      <rect x="130" y="902" width="86" height="86" rx="16" fill="#DC2626" />
      <text x="173" y="962" font-family="DejaVu Sans Mono, monospace" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle">03</text>
      <text x="250" y="964" font-family="Liberation Sans, sans-serif" font-size="44" font-weight="900" fill="#DC2626">${item2}</text>

      <!-- Caption Bar at y=1068 -->
      <rect x="110" y="1068" width="860" height="82" rx="16" fill="#0F172A" fill-opacity="0.92" />

      <!-- Red Stamp Box at Bottom of Whiteboard -->
      <g transform="translate(540, 1450) rotate(-2)">
        <rect x="-320" y="-90" width="640" height="180" rx="16" fill="#FEF2F2" stroke="#DC2626" stroke-width="8" />
        <text x="0" y="26" font-family="Liberation Sans, sans-serif" font-size="68" font-weight="900" fill="#DC2626" text-anchor="middle">${escXml((scene as any).stampText || "CONFIRMED")}</text>
      </g>

      <!-- Marker Tray at Bottom -->
      <rect x="280" y="1785" width="180" height="22" rx="8" fill="#1D4ED8" />
      <rect x="490" y="1785" width="180" height="22" rx="8" fill="#DC2626" />
      <rect x="700" y="1785" width="110" height="26" rx="6" fill="#334155" />
    `;
  }

  return `
    <!-- Top Header Strip above Speaker Window (y=24..116) -->
    <rect x="54" y="24" width="972" height="92" rx="16" fill="#FFFFFF" stroke="${isReceipt ? "#18181B" : "#1D4ED8"}" stroke-width="4" />
    <rect x="74" y="42" width="200" height="56" rx="10" fill="${isReceipt ? "#18181B" : "#1D4ED8"}" />
    <text x="174" y="79" font-family="DejaVu Sans Mono, monospace" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">${isReceipt ? "RECEIPT ROLL" : "DRY ERASE"}</text>
    <text x="298" y="80" font-family="Liberation Sans, sans-serif" font-size="31" font-weight="900" fill="#0F172A">${h1} — ${h2}</text>

    <!-- Caption Backdrop Pill at Bottom of Top Speaker Window (y=1068..1150) -->
    <rect x="110" y="1068" width="860" height="82" rx="16" fill="#0F172A" fill-opacity="0.92" />

    <!-- Chin Board (y=1165..1845) -->
    <rect x="48" y="1165" width="984" height="680" rx="22" fill="${isReceipt ? "#FAF8F5" : "#FFFFFF"}" stroke="${isReceipt ? "#18181B" : "#94A3B8"}" stroke-width="10" />
    <circle cx="82" cy="1198" r="9" fill="#64748B" />
    <circle cx="998" cy="1198" r="9" fill="#64748B" />
    <circle cx="82" cy="1812" r="9" fill="#64748B" />
    <circle cx="998" cy="1812" r="9" fill="#64748B" />

    <!-- Whiteboard Header -->
    <text x="105" y="1256" font-family="Liberation Sans, sans-serif" font-size="46" font-weight="900" fill="#1D4ED8">${h1}</text>
    <rect x="640" y="1208" width="340" height="62" rx="10" fill="#FEE2E2" stroke="#DC2626" stroke-width="3" />
    <text x="810" y="1249" font-family="DejaVu Sans Mono, monospace" font-size="23" font-weight="900" fill="#DC2626" text-anchor="middle">SCENE 0${sceneIndex + 1} NOTES</text>
    <path d="M 100 1282 Q 520 1298 980 1278" fill="none" stroke="#DC2626" stroke-width="6" stroke-linecap="round" />

    <!-- Hand-Drawn Marker Bullet 1 -->
    <rect x="105" y="1325" width="54" height="54" rx="10" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="4" />
    <text x="132" y="1364" font-family="Liberation Sans, sans-serif" font-size="34" font-weight="900" fill="#1D4ED8" text-anchor="middle">1</text>
    <text x="185" y="1365" font-family="Liberation Sans, sans-serif" font-size="38" font-weight="800" fill="#0F172A">${item0}</text>

    <!-- Hand-Drawn Marker Bullet 2 -->
    <rect x="105" y="1425" width="54" height="54" rx="10" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="4" />
    <text x="132" y="1464" font-family="Liberation Sans, sans-serif" font-size="34" font-weight="900" fill="#1D4ED8" text-anchor="middle">2</text>
    <text x="185" y="1465" font-family="Liberation Sans, sans-serif" font-size="38" font-weight="800" fill="#0F172A">${item1}</text>

    <!-- Hand-Drawn Red Marker Highlight Box -->
    <rect x="100" y="1520" width="880" height="120" rx="16" fill="#FEF2F2" stroke="#DC2626" stroke-width="4" stroke-dasharray="14,8" />
    <text x="540" y="1594" font-family="Liberation Serif, serif" font-size="40" font-weight="700" font-style="italic" fill="#DC2626" text-anchor="middle">${h2} — ${item2}</text>

    <!-- Marker Tray -->
    <rect x="280" y="1785" width="180" height="22" rx="8" fill="#1D4ED8" />
    <rect x="490" y="1785" width="180" height="22" rx="8" fill="#DC2626" />
    <rect x="700" y="1785" width="110" height="26" rx="6" fill="#334155" />
  `;
}

/**
 * Generates a 1080x1920 RGBA PNG buffer for the given scene and style theme
 */
export async function renderScenePlatePng(
  options: ScenePlateOptions
): Promise<Buffer> {
  const { scene, sceneIndex, theme } = options;

  let bodySvg = "";

  if (
    theme.layoutFamily === "whiteboard_marker" ||
    theme.layoutFamily === "receipt_roll"
  ) {
    bodySvg = buildChinBoardOverlaySvg(scene, sceneIndex, theme);
  } else {
    switch (String(scene.visualType)) {
      case "steps":
      case "numbered-steps":
        bodySvg = buildNumberedStepsStageSvg(scene, theme);
        break;
      case "freeze-slam":
      case "kinetic-slam":
        bodySvg = buildKineticSlamStageSvg(scene, theme);
        break;
      case "diagram":
      case "node-diagram":
        bodySvg = buildNodeDiagramStageSvg(scene, theme);
        break;
      case "coin-proof":
      case "cc-card":
        bodySvg = buildBitcoinCoinStageSvg(scene, theme);
        break;
      case "cta":
      case "closer-cta":
        bodySvg = buildCloserCtaStageSvg(scene, theme);
        break;
      case "counter":
      case "split-hook":
      case "browser-proof":
      case "split-proof":
      default:
        bodySvg = buildBrowserProofStageSvg(scene, sceneIndex, theme);
        break;
    }
  }

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    ${bodySvg}
  </svg>`;

  const rand = Math.random().toString(36).slice(2, 9);
  const tmpDir = os.tmpdir();
  const svgPath = path.join(tmpDir, `scene_plate_${sceneIndex}_${rand}.svg`);
  const pngPath = path.join(tmpDir, `scene_plate_${sceneIndex}_${rand}.png`);

  fs.writeFileSync(svgPath, fullSvg, "utf8");
  try {
    const ffmpegBin = getFfmpegPath();
    execFileSync(
      ffmpegBin,
      ["-y", "-loglevel", "error", "-i", svgPath, "-pix_fmt", "rgba", pngPath],
      { stdio: "pipe" }
    );
    const pngBuf = fs.readFileSync(pngPath);
    return pngBuf;
  } finally {
    try {
      if (fs.existsSync(svgPath)) fs.unlinkSync(svgPath);
      if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath);
    } catch {}
  }
}
