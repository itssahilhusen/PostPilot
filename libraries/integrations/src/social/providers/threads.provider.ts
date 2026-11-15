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

  async authenticate(_code: string, _redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    throw new Error("Threads account connection is not implemented");
  }

  async publish(_tokens: AuthTokens, _content: PostContent): Promise<PublishResult> {
    return { success: false, error: "Threads publishing is not implemented" };
  }
}
