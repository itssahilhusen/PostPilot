import { Logger } from "@nestjs/common";

export class ConfigurationChecker {
  private readonly issues: string[] = [];

  check(): void {
    if (!process.env.DATABASE_URL) {
      this.issues.push("DATABASE_URL is not defined in environment variables.");
    }

    if (!process.env.REDIS_URL) {
      this.issues.push("REDIS_URL is not set. Defaulting to redis://localhost:6379");
    }

    if (!process.env.BETTER_AUTH_SECRET) {
      this.issues.push("BETTER_AUTH_SECRET is using default development secret. Please set a strong secret in production.");
    }
    const metaVariables = ["META_APP_ID", "META_APP_SECRET", "META_LOGIN_CONFIG_ID", "BETTER_AUTH_URL"];
    const metaEnabled = Boolean(process.env.META_APP_ID || process.env.META_APP_SECRET);
    if (metaEnabled) {
      const missing = metaVariables.filter((name) => !process.env[name]);
      if (missing.length) this.issues.push(`Meta OAuth is disabled until these variables are set: ${missing.join(", ")}`);
      if (process.env.NODE_ENV === "production" && !process.env.META_REDIRECT_URI) this.issues.push("META_REDIRECT_URI is required for production Meta OAuth.");
      if (!process.env.ENCRYPTION_SECRET && (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32)) this.issues.push("Set ENCRYPTION_SECRET or a strong BETTER_AUTH_SECRET for Meta token encryption.");
      if (process.env.ENCRYPTION_SECRET && process.env.ENCRYPTION_SECRET.length < 32) this.issues.push("ENCRYPTION_SECRET must have at least 32 characters for Meta OAuth.");
      if (process.env.META_GRAPH_API_VERSION && !/^v\d+\.\d+$/.test(process.env.META_GRAPH_API_VERSION)) this.issues.push("META_GRAPH_API_VERSION must look like v27.0.");
    }
    if (process.env.META_REDIRECT_URI) {
      try {
        const uri = new URL(process.env.META_REDIRECT_URI);
        if (uri.pathname !== "/api/integrations/meta/callback" || !["http:", "https:"].includes(uri.protocol)) this.issues.push("META_REDIRECT_URI must point to /api/integrations/meta/callback.");
        if (process.env.NODE_ENV === "production" && uri.protocol !== "https:") this.issues.push("META_REDIRECT_URI must use HTTPS in production.");
      } catch { this.issues.push("META_REDIRECT_URI is not a valid URL."); }
    }
  }

  hasIssues(): boolean {
    return this.issues.length > 0;
  }

  getIssues(): string[] {
    return this.issues;
  }

  logReport(): void {
    if (this.hasIssues()) {
      for (const issue of this.issues) {
        Logger.warn(issue, "ConfigChecker");
      }
    } else {
      Logger.log("✅ All required environment variables validated successfully.", "ConfigChecker");
    }
  }
}

