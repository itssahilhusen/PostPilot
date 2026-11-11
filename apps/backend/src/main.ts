import "reflect-metadata";
import * as dns from "node:dns";
import compression from "compression";
import cookieParser from "cookie-parser";
import { json } from "express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { setupSwagger } from "./swagger/swagger.setup";
import { ConfigurationChecker } from "./config/configuration.checker";

// 1. Performance: Force IPv4 first to avoid DNS lookup delays on cloud and local networks
dns.setDefaultResultOrder("ipv4first");

// 2. Best Practice: Ensure UTC timezone globally
process.env.TZ = "UTC";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // 3. Security: Boot diagnostics validation
  const checker = new ConfigurationChecker();
  checker.check();
  checker.logReport();

  // 4. Security & Speed: Initialize Nest application with rawBody for webhooks
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "auth",
        "x-reerts-workspace",
        "x-reerts-org",
      ],
      exposedHeaders: ["reload", "onboarding", "activate"],
    },
  });

  // 5. Speed: High-throughput HTTP compression (Gzip / Deflate)
  app.use(compression());

  // 6. Security: Secure cookie parsing
  app.use(cookieParser());

  // 7. Security: Scoped payload limit (50MB for rich media & carousels, default for other routes)
  app.use(["/posts", "/media", "/carousel"], (req: any, res: any, next: any) => {
    json({ limit: "50mb" })(req, res, next);
  });

  // 8. Security: Strict input validation and sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  );

  // 9. Security: Global exception sanitization (prevents stack leaks)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 10. Best Practice: Enable clean graceful shutdown
  app.enableShutdownHooks();

  // 11. Best Practice: Swagger / OpenAPI 3.0 Documentation at /docs
  setupSwagger(app);

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 NestJS Backend running at: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation at: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error("Fatal error during backend bootstrap:", err);
  process.exit(1);
});
