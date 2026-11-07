import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Backend service health & telemetry" })
  check() {
    return {
      status: "healthy",
      service: "reerts-backend-nest",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      timezone: process.env.TZ || "UTC",
    };
  }
}

