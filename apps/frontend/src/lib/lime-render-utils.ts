export interface LimeCaptionWord {
  word: string;
  start: number;
  end: number;
}

export interface LimeCaptionEvent {
  words: LimeCaptionWord[];
  start: number;
  end: number;
}

export interface HeadlineLayout {
  lines: [string, string?];
  fontSize: number;
}

const PLACEHOLDER_COPY = /^(?:KEY TAKEAWAY|VERIFIED RESULT|STEP\s*0?1|KEY POINT|KEY INSIGHT|KEY BENCHMARK|VISUAL PROOF|IN THIS BEAT|FINAL BEAT|THE BIG IDEA|FINAL THOUGHT)$/i;

export function assertRealSceneCopy(value: string, field = "Scene copy"): string {
  const copy = value.replace(/\s+/g, " ").trim();
  if (!copy || PLACEHOLDER_COPY.test(copy)) {
    throw new Error(`${field} is empty or generic placeholder text.`);
  }
  return copy;
}

/** Wraps copy using measured font widths without dropping any characters. */
export function layoutHeadline(
  text: string,
  maxWidth: number,
  measure: (text: string, fontSize: number) => number,
  options: { startFontSize?: number; minFontSize?: number } = {}
): HeadlineLayout {
  const copy = assertRealSceneCopy(text, "Headline").toUpperCase();
  const startFontSize = options.startFontSize ?? 140;
  const minFontSize = options.minFontSize ?? 48;
  const words = copy.split(/\s+/);

  for (let fontSize = startFontSize; fontSize >= minFontSize; fontSize -= 2) {
    const lines: string[] = [];
    let line = "";
    let overflow = false;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate, fontSize) <= maxWidth) {
        line = candidate;
      } else if (!line) {
        overflow = true;
        break;
      } else {
        lines.push(line);
        line = word;
        if (measure(line, fontSize) > maxWidth) {
          overflow = true;
          break;
        }
      }
      if (lines.length > 1) {
        overflow = true;
        break;
      }
    }
    if (!overflow) {
      if (line) lines.push(line);
      if (lines.length <= 2) return { lines: [lines[0] || "", lines[1]], fontSize };
    }
  }

  throw new Error(`Headline cannot fit inside two lines at ${minFontSize}px without clipping.`);
}

function splitLongCaptionToken(word: LimeCaptionWord): LimeCaptionWord[] {
  const text = word.word.trim();
  if (text.length <= 16) return [{ ...word, word: text }];
  const parts = text.match(/.{1,16}/g) || [];
  const span = Math.max(0.04, word.end - word.start);
  return parts.map((part, index) => ({
    word: part,
    start: word.start + span * index / parts.length,
    end: word.start + span * (index + 1) / parts.length,
  }));
}

/** Produce non-overlapping, one or two word caption events capped at 16 chars. */
export function chunkLimeCaptions(
  transcriptWords: LimeCaptionWord[],
  durationSec: number,
  gapSec = 0.02
): LimeCaptionEvent[] {
  const sorted = transcriptWords
    .filter((word) => word.word?.trim() && Number.isFinite(word.start) && Number.isFinite(word.end) && word.end > word.start)
    .sort((a, b) => a.start - b.start)
    .flatMap(splitLongCaptionToken);

  const chunks: LimeCaptionWord[][] = [];
  for (const word of sorted) {
    const current = chunks[chunks.length - 1];
    const candidate = current ? `${current.map((item) => item.word).join(" ")} ${word.word}` : word.word;
    if (!current || current.length >= 2 || candidate.length > 16) chunks.push([word]);
    else current.push(word);
  }

  let cursor = 0;
  return chunks.flatMap((chunk, index) => {
    const start = Math.max(cursor, chunk[0].start, 0);
    const desiredEnd = Math.min(durationSec, Math.max(start + 0.06, chunk[chunk.length - 1].end + 0.08));
    const nextRawStart = chunks[index + 1]?.[0].start;
    const end = Math.min(desiredEnd, Number.isFinite(nextRawStart) ? Math.max(start + 0.04, nextRawStart! - gapSec) : desiredEnd);
    if (start >= durationSec || end <= start) return [];
    cursor = end + gapSec;
    return [{ words: chunk, start, end }];
  });
}
