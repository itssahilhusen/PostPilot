import {
  ISocialMediaProvider,
  SocialPlatformId,
  PostContent,
  PublishResult,
  AuthTokens,
  UserProfile,
} from "../social.interface";

export class InstagramProvider implements ISocialMediaProvider {
  readonly identifier: SocialPlatformId = "instagram";
  readonly name = "Instagram";

  getAuthUrl(state: string, redirectUri: string): string {
    const appId = process.env.META_APP_ID || "";
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: "instagram_basic,instagram_content_publish,pages_show_list",
      response_type: "code",
      state,
    });
    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  async authenticate(code: string, redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    return {
      tokens: {
        accessToken: "ig_mock_access_token",
        expiresAt: new Date(Date.now() + 60 * 86400 * 1000),
      },
      profile: {
        handle: "reerts.app",
        name: "Reerts",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=instagram",
        providerId: "ig_user_12345",
      },
    };
  }

  async publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult> {
    return {
      success: true,
      externalPostId: `ig_media_${Date.now()}`,
      url: `https://instagram.com/p/mock_${Date.now()}`,
    };
  }
}

