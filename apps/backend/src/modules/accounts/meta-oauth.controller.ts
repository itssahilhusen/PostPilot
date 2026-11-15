import { Controller, Get, Post, Delete, Inject, Param, Query, Req, Res, BadRequestException, ForbiddenException } from "@nestjs/common";
import type { Request, Response } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { MetaOAuthService } from "./meta-oauth.service";

@Controller("api/integrations/meta")
export class MetaOAuthController {
  constructor(@Inject(MetaOAuthService) private readonly meta: MetaOAuthService) {}

  private requireFrontendOrigin(request: Request) {
    const allowed = new URL(process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").origin;
    if (request.headers.origin !== allowed) throw new ForbiddenException("Invalid request origin");
  }

  @Get("connect")
  async connect(@Req() request: Request, @Res() response: Response, @Query("returnTo") returnTo?: string) {
    const identity = await this.meta.identity(request.headers.cookie);
    const url = await this.meta.connect(identity, returnTo);
    const state = new URL(url).searchParams.get("state")!;
    response.cookie("meta_oauth_state", createHash("sha256").update(state).digest("hex"), {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 10 * 60_000, path: "/api/integrations/meta/callback",
    });
    return response.redirect(url);
  }

  @Get("callback")
  async callback(@Query("state") state: string, @Query("code") code: string | undefined, @Query("error") error: string | undefined, @Req() request: Request, @Res() response: Response) {
    const frontend = process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
    let destination = new URL("/settings?tab=integrations", frontend);
    const cookieHash = request.cookies?.meta_oauth_state;
    response.clearCookie("meta_oauth_state", { path: "/api/integrations/meta/callback" });
    if (!state || !cookieHash || !/^[a-f0-9]{64}$/.test(cookieHash)) throw new BadRequestException("Invalid OAuth state");
    const expected = createHash("sha256").update(state).digest();
    if (!timingSafeEqual(expected, Buffer.from(cookieHash, "hex"))) throw new BadRequestException("Invalid OAuth state");
    try {
      const identity = await this.meta.consumeState(state);
      if (identity.returnTo === "calendar") destination = new URL("/calendar", frontend);
      if (error) {
        destination.searchParams.set("meta", "denied");
      } else if (!code) {
        destination.searchParams.set("meta", "missing_code");
      } else {
        const count = await this.meta.complete(code, identity);
        destination.searchParams.set("meta", count ? "connected" : "no_pages");
        destination.searchParams.set("count", String(count));
      }
    } catch (failure) {
      const reason = failure instanceof Error ? failure.message : "";
      destination.searchParams.set("meta", reason === "META_CODE_EXCHANGE_FAILED" ? "code_exchange_failed" : reason === "META_PAGES_SHOW_LIST_MISSING" ? "missing_pages_permission" : reason === "META_PAGE_ACCESS_MISSING" ? "page_access_missing" : "error");
    }
    return response.redirect(destination.toString());
  }

  @Get("accounts")
  async accounts(@Req() request: Request) {
    return { accounts: await this.meta.accounts(await this.meta.identity(request.headers.cookie)) };
  }

  @Delete("accounts/:id")
  async disconnect(@Param("id") id: string, @Req() request: Request) {
    this.requireFrontendOrigin(request);
    await this.meta.disconnect(await this.meta.identity(request.headers.cookie), id);
    return { success: true };
  }

  @Post("accounts/:id/refresh")
  async refresh(@Param("id") id: string, @Req() request: Request) {
    this.requireFrontendOrigin(request);
    return this.meta.refresh(await this.meta.identity(request.headers.cookie), id);
  }
}
