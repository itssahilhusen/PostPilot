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

    if (!process.env.NEXTAUTH_SECRET) {
      this.issues.push("NEXTAUTH_SECRET is using default development secret. Please set a strong secret in production.");
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

