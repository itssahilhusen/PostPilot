import "reflect-metadata";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Module, type INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import request from "supertest";
import { HttpExceptionFilter } from "../../common/filters/http-exception.filter";
import { MetaOAuthController } from "./meta-oauth.controller";
import { MetaOAuthService } from "./meta-oauth.service";

@Module({ controllers: [MetaOAuthController], providers: [MetaOAuthService] })
class TestModule {}

describe("Meta OAuth Nest route", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await NestFactory.create(TestModule, { logger: false });
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  afterEach(() => vi.restoreAllMocks());

  it("requires a Better Auth session before connecting", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/integrations/meta/connect?returnTo=calendar");
    expect(response.status).toBe(401);
    expect(response.headers.location).toBeUndefined();
  });

  it("sets a browser state cookie and redirects an authenticated user to Meta", async () => {
    const meta = app.get(MetaOAuthService);
    vi.spyOn(meta, "identity").mockResolvedValue({ userId: "user-1", workspaceId: "workspace-1" });
    vi.spyOn(meta, "connect").mockResolvedValue("https://www.facebook.com/v27.0/dialog/oauth?state=test-state");

    const response = await request(app.getHttpServer())
      .get("/api/integrations/meta/connect?returnTo=calendar");
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("www.facebook.com");
    expect(response.headers["set-cookie"]?.[0]).toContain("meta_oauth_state=");
    expect(meta.connect).toHaveBeenCalledWith({ userId: "user-1", workspaceId: "workspace-1" }, "calendar");
  });
});
