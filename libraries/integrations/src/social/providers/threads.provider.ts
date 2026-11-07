import {
  ISocialMediaProvider,
  SocialPlatformId,
  PostContent,
  PublishResult,
  AuthTokens,
  UserProfile,
} from "../social.interface";

export class ThreadsProvider implements ISocialMediaProvider {
  readonly identifier: SocialPlatformId = "threads";
  readonly name = "Threads";

  getAuthUrl(state: string, redirectUri: string): string {
    const appId = process.env.THREADS_APP_ID || "";
    return `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=threads_basic,threads_content_publish&response_type=code&state=${state}`;
  }

  async authenticate(code: string, redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    return {
      tokens: { accessToken: "threads_token", expiresAt: new Date(Date.now() + 60 * 86400 * 1000) },
      profile: { handle: "@founder", name: "Founder", providerId: "threads_123" },
    };
  }

  async publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult> {
    return {
      success: true,
      externalPostId: `threads_post_${Date.now()}`,
    };
  }
}

