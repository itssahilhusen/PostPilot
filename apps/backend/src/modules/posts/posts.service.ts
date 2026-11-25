import { BadGatewayException, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class PostsService {
  // Reuse the frontend's session, workspace and scheduling transaction for both APIs.
  private async request(cookie: string | undefined, path: string, method = "GET", body?: object) {
    if (!cookie) throw new UnauthorizedException();
    const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const response = await fetch(new URL("/api/posts" + path, origin), {
      method, headers: { cookie, "Content-Type": "application/json" }, redirect: "error",
      body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => { throw new BadGatewayException("Scheduling service unavailable"); });
    if (!response.ok) throw new HttpException(data.error || "Post request failed", response.status);
    return data;
  }
  async getPosts(cookie?: string, status?: string) {
    return (await this.request(cookie, status ? "?status=" + encodeURIComponent(status) : "")).posts;
  }
  async getPostById(id: string, cookie?: string) {
    return (await this.request(cookie, "/" + encodeURIComponent(id))).post;
  }
  async createPost(dto: CreatePostDto, cookie?: string) {
    const { workspaceId: _workspace, ...input } = dto;
    return (await this.request(cookie, "", "POST", input)).post;
  }
  async deletePost(id: string, cookie?: string) {
    return this.request(cookie, "/" + encodeURIComponent(id), "DELETE");
  }
}
