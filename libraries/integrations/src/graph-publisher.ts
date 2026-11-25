import { setTimeout as wait } from "node:timers/promises";

export interface Publication {
  provider: string;
  externalId: string;
  token: string;
  caption: string;
  assets: string[];
}

interface GraphResult {
  id?: string;
  post_id?: string;
  status?: string;
  status_code?: string;
  error?: { code?: number; error_subcode?: number; fbtrace_id?: string };
}

export async function publishGraph(input: Publication, request = fetch): Promise<string> {
  const { provider, externalId, token, caption, assets } = input;
  if (!["facebook", "instagram", "threads"].includes(provider)) throw new Error("Unsupported publishing provider");
  if (!/^\d+$/.test(externalId)) throw new Error("Reconnect the channel to obtain its platform ID");
  if (assets.some(asset => new URL(asset).protocol !== "https:")) throw new Error("Media requires public HTTPS URLs");
  const threads = provider === "threads";
  const base = threads ? "https://graph.threads.com/v1.0" : `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v27.0"}`;
  async function graph(path: string, fields?: Record<string, string>): Promise<GraphResult> {
    const send = () => request(`${base}/${path}`, {
      method: fields ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}` },
      body: fields ? new URLSearchParams(fields) : undefined,
      signal: AbortSignal.timeout(30_000), redirect: "error",
    });
    let response = await send();
    for (let retry = 0; response.status === 429 && retry < 2; retry++) {
      const seconds = Number(response.headers.get("retry-after") || 2 ** retry);
      if (!Number.isFinite(seconds) || seconds > 60) break;
      await response.body?.cancel();
      await wait(Math.max(1, seconds) * 1000);
      response = await send();
    }
    const data: GraphResult = await response.json();
    if (!response.ok || data.error) throw new Error(`${provider} ${path.split("?")[0]} HTTP ${response.status}, code ${data.error?.code ?? "-"}, subcode ${data.error?.error_subcode ?? "-"}, trace ${data.error?.fbtrace_id ?? "-"}`);
    return data;
  }
  async function create(edge: string, fields: Record<string, string>) {
    const result = await graph(`${externalId}/${edge}`, fields);
    const id = result.post_id || result.id;
    if (typeof id !== "string" || !id) throw new Error("Provider returned no publication ID");
    return id;
  }
  const video = (url: string) => /\.(mp4|mov|webm|m4v)$/i.test(new URL(url).pathname);
  if (provider === "facebook") {
    if (assets.length === 1 && video(assets[0])) return create("videos", { file_url: assets[0], description: caption });
    if (assets.some(video)) throw new Error("Facebook multi-photo posts require images");
    const attachments = [];
    for (const url of assets) attachments.push({ media_fbid: await create("photos", { published: "false", url }) });
    return create("feed", { message: caption, ...(attachments.length && { attached_media: JSON.stringify(attachments) }) });
  }
  if (!threads && !assets.length) throw new Error("Instagram requires an image or video");
  const edge = threads ? "threads" : "media";
  const text = threads ? "text" : "caption";
  async function ready(id: string) {
    const field = threads ? "status" : "status_code";
    for (let i = 0; i < 30; i++) {
      const status = (await graph(`${encodeURIComponent(id)}?fields=${field}`))[field];
      if (status === "FINISHED") return id;
      if (status !== "IN_PROGRESS") throw new Error(`Media processing returned ${status ?? "unknown"} for ${id}`);
      await wait(3000);
    }
    throw new Error(`Media processing timed out for ${id}`);
  }
  const children: string[] = [];
  for (const url of assets) {
    const isVideo = video(url);
    const fields: Record<string,string> = { [isVideo ? "video_url" : "image_url"]: url };
    if (isVideo || threads) fields.media_type = isVideo ? (!threads && assets.length === 1 ? "REELS" : "VIDEO") : "IMAGE";
    if (assets.length > 1) fields.is_carousel_item = "true";
    else fields[text] = caption;
    children.push(await ready(await create(edge, fields)));
  }
  const container = children.length === 1 ? children[0] : await ready(await create(edge, children.length
    ? { media_type: "CAROUSEL", children: children.join(","), [text]: caption }
    : { media_type: "TEXT", text: caption }));
  return create(threads ? "threads_publish" : "media_publish", { creation_id: container });
}


export async function publishChannelContent(provider: string, tokens: import("./social/social.interface").AuthTokens, content: import("./social/social.interface").PostContent) {
  try {
    if (!content.externalId) throw new Error("Channel platform ID required");
    const externalPostId = await publishGraph({ provider, externalId: content.externalId, token: tokens.accessToken, caption: content.text, assets: content.mediaUrls || [] });
    return { success: true, externalPostId };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : "Publication failed" }; }
}
