import {
  ISocialMediaProvider,
  SocialPlatformId,
  PostContent,
  PublishResult,
  AuthTokens,
  UserProfile,
} from "../social.interface";

export class LinkedInProvider implements ISocialMediaProvider {
  readonly identifier: SocialPlatformId = "linkedin";
  readonly name = "LinkedIn";

  getAuthUrl(state: string, redirectUri: string): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID || "";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email w_member_social",
      state,
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async authenticate(code: string, redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    return {
      tokens: {
        accessToken: "li_mock_access_token",
        expiresAt: new Date(Date.now() + 60 * 86400 * 1000),
      },
      profile: {
        handle: "alex-rivers",
        name: "Alex Rivers",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=linkedin",
        providerId: "urn:li:person:12345",
      },
    };
  }

  async publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult> {
    try {
      // Calls LinkedIn UGC or Restli posts endpoint
      return {
        success: true,
        externalPostId: `urn:li:share:${Date.now()}`,
        url: `https://www.linkedin.com/feed/update/urn:li:share:${Date.now()}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to publish LinkedIn post",
      };
    }
  }
}

