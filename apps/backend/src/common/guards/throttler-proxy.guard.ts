import { ThrottlerGuard } from "@nestjs/throttler";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, any>): Promise<string> {
    // Extract real client IP through x-forwarded-for header
    const forwarded = String(req.headers?.["x-forwarded-for"] || "");
    const clientIp = forwarded.split(",")[0].trim() || req.ip || "127.0.0.1";
    
    // If tenant workspace header exists, combine IP + workspace for fair throttling
    const workspaceId = req.headers?.["x-reerts-workspace"] || req.query?.workspaceId || "";
    return workspaceId ? `ws_${workspaceId}_${clientIp}` : `ip_${clientIp}`;
  }
}

