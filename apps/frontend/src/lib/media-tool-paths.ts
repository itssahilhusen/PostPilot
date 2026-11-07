import fs from "fs";
import path from "path";

function resolveInstallerPath(packageName: string): string | null {
  try {
    const installer = require(packageName);
    return installer?.path && fs.existsSync(installer.path) ? installer.path : null;
  } catch {
    return null;
  }
}

function findWindowsPnpmBinary(packagePrefix: string, installerScope: string, binaryName: string): string | null {
  const searchRoots = new Set<string>();
  for (const start of [process.cwd(), __dirname]) {
    let current = path.resolve(start);
    for (let depth = 0; depth < 8; depth++) {
      searchRoots.add(current);
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
  }

  for (const root of searchRoots) {
    const pnpmRoot = path.join(root, "node_modules", ".pnpm");
    if (!fs.existsSync(pnpmRoot)) continue;
    let packages: string[];
    try {
      packages = fs.readdirSync(pnpmRoot).filter((entry) => entry.startsWith(packagePrefix));
    } catch {
      continue;
    }
    for (const packageDirectory of packages) {
      const candidate = path.join(
        pnpmRoot,
        packageDirectory,
        "node_modules",
        installerScope,
        "win32-x64",
        binaryName
      );
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

export function getFfmpegPath(): string {
  const installed = resolveInstallerPath("@ffmpeg-installer/ffmpeg");
  if (installed) return installed;
  if (process.platform === "win32") {
    const pnpmBinary = findWindowsPnpmBinary("@ffmpeg-installer+ffmpeg@", "@ffmpeg-installer", "ffmpeg.exe");
    if (pnpmBinary) return pnpmBinary;
    const candidates = [
      path.join(process.cwd(), "bin", "ffmpeg.exe"),
      path.join(process.cwd(), "apps", "frontend", "bin", "ffmpeg.exe"),
      ...((process.env.PATH || "").split(path.delimiter).filter(Boolean).map((directory) => path.join(directory, "ffmpeg.exe"))),
    ];
    const local = candidates.find((candidate) => fs.existsSync(candidate));
    if (local) return local;
  }
  return "ffmpeg";
}

export function getFfprobePath(): string {
  const installed = resolveInstallerPath("@ffprobe-installer/ffprobe");
  if (installed) return installed;
  if (process.platform === "win32") {
    const pnpmBinary = findWindowsPnpmBinary("@ffprobe-installer+ffprobe@", "@ffprobe-installer", "ffprobe.exe");
    if (pnpmBinary) return pnpmBinary;
    const candidates = [
      path.join(process.cwd(), "bin", "ffprobe.exe"),
      path.join(process.cwd(), "apps", "frontend", "bin", "ffprobe.exe"),
      ...((process.env.PATH || "").split(path.delimiter).filter(Boolean).map((directory) => path.join(directory, "ffprobe.exe"))),
    ];
    const local = candidates.find((candidate) => fs.existsSync(candidate));
    if (local) return local;
  }
  return "ffprobe";
}
