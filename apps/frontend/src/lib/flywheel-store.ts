import fs from "fs";
import path from "path";

export interface DailyFlywheelConfig {
  id: string;
  workspaceId: string;
  enabled: boolean;
  niche: "tech_ai" | "dev_tools" | "science" | "crypto" | "custom";
  nicheLabel: string;
  preferredTheme: "futuretech" | "aipagedaily" | "tyches" | "inventionshark";
  brandHandle: string;
  feedSources: string[];
  scheduleTime: string; // e.g. "10:00"
  targetPlatforms: string[];
  notificationChannel: "discord" | "telegram" | "slack";
  webhookUrl: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  requireApproval: boolean;
  autoScheduleOnApproval: boolean;
  lastRunAt: string | null;
  lastRunStatus: "success" | "error" | "pending_review" | null;
  lastRunPostId: string | null;
  totalPostsGenerated: number;
  styleMemory: {
    detectedNiche: string;
    postCountInNiche: number;
    favoriteTemplate: string;
    promptToAutomateShown: boolean;
    userAcceptedAutomation: boolean;
  };
}

const DEFAULT_FLYWHEEL_CONFIG: DailyFlywheelConfig = {
  id: "flywheel_default",
  workspaceId: "workspace_default",
  enabled: false,
  niche: "tech_ai",
  nicheLabel: "Tech & AI Breakthroughs",
  preferredTheme: "futuretech",
  brandHandle: "@theaiseed",
  feedSources: ["tldr_ai", "tldr_tech", "techcrunch_ai"],
  scheduleTime: "10:00",
  targetPlatforms: ["instagram", "x", "linkedin", "threads"],
  notificationChannel: "discord",
  webhookUrl: "",
  requireApproval: true,
  autoScheduleOnApproval: true,
  lastRunAt: null,
  lastRunStatus: null,
  lastRunPostId: null,
  totalPostsGenerated: 0,
  styleMemory: {
    detectedNiche: "Tech & AI Breakthroughs",
    postCountInNiche: 2,
    favoriteTemplate: "futuretech",
    promptToAutomateShown: false,
    userAcceptedAutomation: false,
  },
};

function resolveStorePath(): string {
  const dataDir = path.resolve(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(dataDir, "daily-flywheel-config.json");
}

let inMemoryConfig: DailyFlywheelConfig | null = null;

export function getFlywheelConfig(): DailyFlywheelConfig {
  if (inMemoryConfig) return inMemoryConfig;

  const filePath = resolveStorePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      inMemoryConfig = { ...DEFAULT_FLYWHEEL_CONFIG, ...JSON.parse(raw) };
      return inMemoryConfig!;
    }
  } catch (err) {
    console.warn("Could not read flywheel config from disk, using defaults", err);
  }

  inMemoryConfig = { ...DEFAULT_FLYWHEEL_CONFIG };
  return inMemoryConfig;
}

export function saveFlywheelConfig(updates: Partial<DailyFlywheelConfig>): DailyFlywheelConfig {
  const current = getFlywheelConfig();
  const nextConfig: DailyFlywheelConfig = {
    ...current,
    ...updates,
    styleMemory: {
      ...current.styleMemory,
      ...(updates.styleMemory || {}),
    },
  };

  inMemoryConfig = nextConfig;

  const filePath = resolveStorePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(nextConfig, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write flywheel config to disk", err);
  }

  return nextConfig;
}

export function recordPostCreation(niche: string, template: string): DailyFlywheelConfig {
  const config = getFlywheelConfig();
  const memory = config.styleMemory;
  const currentCount = memory.detectedNiche === niche ? memory.postCountInNiche + 1 : 1;

  return saveFlywheelConfig({
    styleMemory: {
      ...memory,
      detectedNiche: niche,
      postCountInNiche: currentCount,
      favoriteTemplate: template,
      promptToAutomateShown: currentCount >= 2 && !memory.userAcceptedAutomation,
    },
  });
}

