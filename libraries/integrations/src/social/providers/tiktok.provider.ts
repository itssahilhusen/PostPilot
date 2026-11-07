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

  async authenticate(code: string, redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    return {
      tokens: { accessToken: "tiktok_token", expiresAt: new Date(Date.now() + 86400 * 1000) },
      profile: { handle: "@founder_tok", name: "Founder Tok", providerId: "tt_123" },
    };
  }

  async publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult> {
    return {
      success: true,
      externalPostId: `tiktok_video_${Date.now()}`,
    };
  }
}

