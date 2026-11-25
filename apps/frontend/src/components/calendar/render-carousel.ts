interface Slide { title: string; body: string }

export function isSlide(value: unknown): value is Slide {
  return !!value && typeof value === "object" && "title" in value && typeof value.title === "string"
    && "body" in value && typeof value.body === "string";
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.trim().split(/\s+/)) {
    const next = line + word;
    if (line && ctx.measureText(next).width > width) { lines.push(line); line = ""; }
    for (const char of word) {
      if (ctx.measureText(line + char).width > width) { lines.push(line); line = ""; }
      line += char;
    }
    line += " ";
  }
  if (line) lines.push(line.trim());
  return lines;
}

export async function renderSlide(slide: Slide, index: number, total: number): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image rendering unavailable");
  ctx.fillStyle = "#101412";
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = "#c5f52a";
  ctx.fillRect(72, 96, 108, 12);
  ctx.textBaseline = "top";
  let size = 68;
  let headings: string[];
  let lines: string[];
  do {
    ctx.font = "bold " + size + "px sans-serif";
    headings = wrap(ctx, slide.title, 936);
    ctx.font = Math.round(size * 0.62) + "px sans-serif";
    lines = wrap(ctx, slide.body, 936);
    if (headings.length * size * 1.15 + lines.length * size * 0.83 < 1030) break;
    size -= 2;
  } while (size > 20);
  ctx.font = "bold " + size + "px sans-serif";
  ctx.fillStyle = "#fff";
  let y = 175;
  for (const line of headings) { ctx.fillText(line, 72, y); y += size * 1.15; }
  y += 42;
  ctx.fillStyle = "#d5dcd7";
  ctx.font = Math.round(size * 0.62) + "px sans-serif";
  for (const line of lines) { ctx.fillText(line, 72, y); y += size * 0.83; }
  ctx.fillStyle = "#c5f52a";
  ctx.font = "28px monospace";
  ctx.fillText((index + 1) + " / " + total, 72, 1250);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("Could not render slide")), "image/jpeg", 0.9));
  return new File([blob], "slide-" + (index + 1) + ".jpg", { type: "image/jpeg" });
}
