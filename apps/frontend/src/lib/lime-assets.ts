import crypto from "crypto";
import dns from "dns/promises";
import fs from "fs";
import net from "net";
import os from "os";
import path from "path";
import type { LimeAssetRequest } from "./lime-director-schema";

export interface LimeResolvedAsset {
  type: Exclude<LimeAssetRequest["type"], "none">;
  dataUri: string;
  mimeType: string;
  alt: string;
  attribution?: string;
  attributionUrl?: string;
  sourceUrl?: string;
  cacheKey: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_JSON_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;
const cacheDirectory = path.join(os.tmpdir(), "lime-slides-assets");
const memoryCache = new Map<string, LimeResolvedAsset>();
const dnsChecks = new Map<string, Promise<void>>();
let simpleIconIndex: Map<string, any> | null = null;

function normalizedName(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 192 && b === 0 && c === 0)
    || (a === 192 && b === 88 && c === 99)
    || (a === 198 && (b === 18 || b === 19))
    || (a === 198 && b === 51 && c === 100)
    || (a === 203 && b === 0 && c === 113)
    || a === 240;
}

export function isPublicIpAddress(address: string) {
  const version = net.isIP(address);
  if (version === 4) return !isPrivateIpv4(address);
  if (version !== 6) return false;
  const value = address.toLowerCase().split("%")[0];
  if (value.startsWith("::ffff:")) return isPublicIpAddress(value.slice(7));
  if (value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd")
    || /^fe[89ab]/.test(value) || value.startsWith("ff") || value.startsWith("2001:db8:")) return false;
  // Only global unicast space is accepted. This also excludes IPv6 ULA and link-local ranges.
  return /^[23][0-9a-f]{0,3}:/i.test(value);
}

export async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error("Asset URL is malformed."); }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Asset URLs must use HTTP or HTTPS.");
  if (url.username || url.password) throw new Error("Credentials are not allowed in asset URLs.");
  const host = url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Private and local asset hosts are blocked.");
  }
  if (net.isIP(host)) {
    if (!isPublicIpAddress(host)) throw new Error("Private and reserved IP addresses are blocked.");
    return url;
  }

  let check = dnsChecks.get(host);
  if (!check) {
    check = dns.lookup(host, { all: true, verbatim: true }).then((records) => {
      if (!records.length || records.some((record) => !isPublicIpAddress(record.address))) {
        throw new Error("Asset host resolves to a private or reserved IP address.");
      }
    }).catch((error) => {
      dnsChecks.delete(host);
      throw error;
    });
    dnsChecks.set(host, check);
  }
  await check;
  return url;
}

async function readLimitedBody(response: Response, maxBytes: number): Promise<Buffer> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new Error("Asset response exceeds the size limit.");
  if (!response.body) {
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length > maxBytes) throw new Error("Asset response exceeds the size limit.");
    return body;
  }
  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      throw new Error("Asset response exceeds the size limit.");
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks, bytes);
}

async function guardedFetch(url: string, options: { headers?: Record<string, string>; maxBytes: number }): Promise<{ response: Response; body: Buffer; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let currentUrl = url;
    for (let redirects = 0; redirects <= 3; redirects++) {
      const safeUrl = await assertPublicHttpUrl(currentUrl);
      const response = await fetch(safeUrl, { headers: options.headers, signal: controller.signal, redirect: "manual" });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location || redirects === 3) throw new Error("Asset redirect limit exceeded.");
        currentUrl = new URL(location, safeUrl).toString();
        continue;
      }
      if (!response.ok) throw new Error(`Asset server returned HTTP ${response.status}.`);
      const body = await readLimitedBody(response, options.maxBytes);
      return { response, body, finalUrl: safeUrl.toString() };
    }
    throw new Error("Asset redirect limit exceeded.");
  } finally {
    clearTimeout(timeout);
  }
}

function cacheKeyFor(request: LimeAssetRequest) {
  return crypto.createHash("sha256").update(JSON.stringify(request)).digest("hex");
}

function readCache(cacheKey: string): LimeResolvedAsset | null {
  const memory = memoryCache.get(cacheKey);
  if (memory) return memory;
  try {
    const record = JSON.parse(fs.readFileSync(path.join(cacheDirectory, `${cacheKey}.json`), "utf8"));
    if (record?.cacheKey === cacheKey && typeof record.dataUri === "string" && typeof record.type === "string") {
      memoryCache.set(cacheKey, record as LimeResolvedAsset);
      return record as LimeResolvedAsset;
    }
  } catch {}
  return null;
}

function writeCache(asset: LimeResolvedAsset) {
  try {
    fs.mkdirSync(cacheDirectory, { recursive: true });
    const target = path.join(cacheDirectory, `${asset.cacheKey}.json`);
    fs.writeFileSync(target, JSON.stringify(asset), "utf8");
    memoryCache.set(asset.cacheKey, asset);
  } catch (error: any) {
    console.warn("[Lime assets] Could not write the local asset cache:", error?.message || error);
  }
}

function findChromeExecutable() {
  const candidates = [
    process.env.LIME_CHROME_EXECUTABLE_PATH,
    process.env.CHROME_EXECUTABLE_PATH,
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe") : undefined,
    process.env["PROGRAMFILES(X86)"] ? path.join(process.env["PROGRAMFILES(X86)"], "Google/Chrome/Application/chrome.exe") : undefined,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe") : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function loadPuppeteer(): any | null {
  try { return require("puppeteer"); } catch {}
  for (const start of [process.cwd(), __dirname]) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 7; depth++) {
      const candidate = path.join(current, "node_modules", ".pnpm", "puppeteer@25.16.0", "node_modules", "puppeteer");
      try { if (fs.existsSync(candidate)) return require(candidate); } catch {}
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }
  return null;
}

async function captureScreenshot(request: Extract<LimeAssetRequest, { type: "screenshot" }>, cacheKey: string): Promise<LimeResolvedAsset | null> {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) return null;
  await assertPublicHttpUrl(request.url);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: findChromeExecutable(),
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    timeout: REQUEST_TIMEOUT_MS,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    page.setDefaultNavigationTimeout(REQUEST_TIMEOUT_MS);
    await page.setRequestInterception(true);
    page.on("request", async (requestEvent: any) => {
      const requestUrl = requestEvent.url();
      if (!/^https?:/i.test(requestUrl)) {
        if (/^(data:|blob:|about:)/i.test(requestUrl)) await requestEvent.continue().catch(() => {});
        else await requestEvent.abort().catch(() => {});
        return;
      }
      try {
        await assertPublicHttpUrl(requestUrl);
        await requestEvent.continue();
      } catch {
        await requestEvent.abort().catch(() => {});
      }
    });
    const response = await page.goto(request.url, { waitUntil: "networkidle2", timeout: REQUEST_TIMEOUT_MS });
    if (!response?.ok()) return null;
    if (request.highlightBox) {
      await page.evaluate((box) => {
        const marker = document.createElement("div");
        marker.dataset.limeHighlight = "true";
        Object.assign(marker.style, {
          position: "fixed", left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px`,
          border: "5px solid #CCFF08", boxShadow: "0 0 0 9999px rgba(0,0,0,.08)", borderRadius: "12px", zIndex: "2147483647", pointerEvents: "none",
        });
        document.body.appendChild(marker);
      }, request.highlightBox);
    }
    const screenshot = Buffer.from(await page.screenshot({ type: "png", fullPage: false }));
    if (screenshot.length > MAX_IMAGE_BYTES) throw new Error("Screenshot exceeds the size limit.");
    return {
      type: "screenshot", dataUri: `data:image/png;base64,${screenshot.toString("base64")}`, mimeType: "image/png",
      alt: request.query || `Screenshot of ${new URL(request.url).hostname}`, sourceUrl: request.url, cacheKey,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

async function capturePexelsPhoto(request: Extract<LimeAssetRequest, { type: "photo" }>, cacheKey: string): Promise<LimeResolvedAsset | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;
  const searchUrl = new URL("https://api.pexels.com/v1/search");
  searchUrl.searchParams.set("query", request.query);
  searchUrl.searchParams.set("orientation", "landscape");
  searchUrl.searchParams.set("per_page", "1");
  const search = await guardedFetch(searchUrl.toString(), { headers: { Authorization: apiKey }, maxBytes: MAX_JSON_BYTES });
  const data = JSON.parse(search.body.toString("utf8"));
  const photo = data?.photos?.[0];
  const imageUrl = photo?.src?.large || photo?.src?.medium;
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const image = await guardedFetch(imageUrl, { maxBytes: MAX_IMAGE_BYTES });
  const mimeType = (image.response.headers.get("content-type") || "image/jpeg").split(";")[0].trim().toLowerCase();
  if (!mimeType.startsWith("image/")) throw new Error("Pexels returned a non-image asset.");
  return {
    type: "photo", dataUri: `data:${mimeType};base64,${image.body.toString("base64")}`, mimeType,
    alt: typeof photo.alt === "string" && photo.alt.trim() ? photo.alt : request.query,
    attribution: typeof photo.photographer === "string" ? `Photo by ${photo.photographer} on Pexels` : "Photo provided by Pexels",
    attributionUrl: typeof photo.url === "string" ? photo.url : "https://www.pexels.com/",
    sourceUrl: image.finalUrl, cacheKey,
  };
}

async function getSimpleIcon(query: string): Promise<any | null> {
  if (!simpleIconIndex) {
    const icons = await import("simple-icons");
    const index = new Map<string, any>();
    for (const [exportName, icon] of Object.entries(icons)) {
      if (!icon || typeof icon !== "object" || !("slug" in icon)) continue;
      index.set(normalizedName(String((icon as any).slug)), icon);
      index.set(normalizedName(String((icon as any).title)), icon);
      if (exportName.startsWith("si")) index.set(normalizedName(exportName.slice(2)), icon);
    }
    simpleIconIndex = index;
  }
  return simpleIconIndex.get(normalizedName(query)) || null;
}

async function captureSimpleIcon(request: Extract<LimeAssetRequest, { type: "logo" }>, cacheKey: string): Promise<LimeResolvedAsset | null> {
  const icon = await getSimpleIcon(request.query);
  if (!icon) return null;
  const svg = String(icon.svg).replace("<svg ", `<svg fill="#${String(icon.hex || "111111").replace(/[^0-9a-f]/gi, "")}" `);
  return {
    type: "logo", dataUri: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`, mimeType: "image/svg+xml",
    alt: `${icon.title} logo`, attribution: `Logo: ${icon.title}`, attributionUrl: icon.source, sourceUrl: icon.source, cacheKey,
  };
}

export async function resolveLimeAsset(request: LimeAssetRequest): Promise<LimeResolvedAsset | null> {
  if (request.type === "none") return null;
  const cacheKey = cacheKeyFor(request);
  const cached = readCache(cacheKey);
  if (cached) return cached;
  try {
    const asset = request.type === "screenshot" ? await captureScreenshot(request, cacheKey)
      : request.type === "photo" ? await capturePexelsPhoto(request, cacheKey)
      : await captureSimpleIcon(request, cacheKey);
    if (asset) writeCache(asset);
    return asset;
  } catch (error: any) {
    console.warn(`[Lime assets] ${request.type} asset unavailable; using the illustration fallback:`, error?.message || error);
    return null;
  }
}

export async function resolveLimeAssets(requests: Array<LimeAssetRequest | undefined>): Promise<Array<LimeResolvedAsset | null>> {
  const results: Array<LimeResolvedAsset | null> = new Array(requests.length).fill(null);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(4, requests.length) }, async () => {
    while (cursor < requests.length) {
      const index = cursor++;
      const request = requests[index];
      if (request) results[index] = await resolveLimeAsset(request);
    }
  });
  await Promise.all(workers);
  return results;
}
