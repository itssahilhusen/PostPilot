import fs from "fs";
import path from "path";
import { PersonaData, DEFAULT_SAMPLE_PERSONA_A, DEFAULT_SAMPLE_PERSONA_B } from "./persona-defaults";

const CACHE_FILE = path.join(process.cwd(), "prisma", "personas_cache.json");

function getInitialPersonas(): PersonaData[] {
  const now = new Date().toISOString();
  return [
    {
      id: "persona-a-default",
      workspace_id: "940355c0-a24b-4843-9687-bbf55198de44",
      social_account_id: "acc_threads_main",
      blog_account_id: null,
      ...DEFAULT_SAMPLE_PERSONA_A,
    },
    {
      id: "persona-b-default",
      workspace_id: "940355c0-a24b-4843-9687-bbf55198de44",
      social_account_id: "acc_threads_main",
      blog_account_id: null,
      ...DEFAULT_SAMPLE_PERSONA_B,
    },
  ];
}

export function loadPersonasStore(): PersonaData[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to read personas cache file:", e);
  }
  const initial = getInitialPersonas();
  savePersonasStore(initial);
  return initial;
}

export function savePersonasStore(personas: PersonaData[]): void {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(personas, null, 2), "utf8");
  } catch (e) {
    console.warn("Failed to write personas cache file:", e);
  }
}
