import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle("Reerts Social Management API")
    .setDescription("Enterprise-grade REST API for social media scheduling, AI personas, automations, and multi-platform analytics.")
    .setVersion("1.0.0")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter your workspace API token or JWT session token",
    })
    .addTag("Posts", "Post creation, scheduling, drafts, and queue publication")
    .addTag("Accounts", "Connected social media channels (X, LinkedIn, Meta, Threads, TikTok)")
    .addTag("Personas", "AI Brand Voice cloning, style analysis, and parameters")
    .addTag("Automations", "Auto-DM triggers, lead qualification, and comments listener")
    .addTag("Health", "Service health check and telemetry")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Reerts API Docs",
  });
}

