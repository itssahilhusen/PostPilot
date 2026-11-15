import {
  ISocialMediaProvider,
  SocialPlatformId,
  PostContent,
  PublishResult,
  AuthTokens,
  UserProfile,
} from "../social.interface";

export class TikTokProvider implements ISocialMediaProvider {
  readonly identifier: SocialPlatformId = "tiktok";
  readonly name = "TikTok";

  getAuthUrl(state: string, redirectUri: string): string {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
    return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.upload&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  }

  async authenticate(_code: string, _redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    throw new Error("TikTok account connection is not implemented");
  }

  async publish(_tokens: AuthTokens, _content: PostContent): Promise<PublishResult> {
    return { success: false, error: "TikTok publishing is not implemented" };
  }
}
