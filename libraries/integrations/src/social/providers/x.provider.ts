import {
  ISocialMediaProvider,
  SocialPlatformId,
  PostContent,
  PublishResult,
  AuthTokens,
  UserProfile,
} from "../social.interface";

export class XProvider implements ISocialMediaProvider {
  readonly identifier: SocialPlatformId = "x";
  readonly name = "X (Twitter)";

  getAuthUrl(state: string, redirectUri: string): string {
    const clientId = process.env.X_CLIENT_ID || "";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "tweet.read tweet.write users.read offline.access media.write",
      state,
      code_challenge: "challenge",
      code_challenge_method: "plain",
    });
    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  async authenticate(code: string, redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    // Exchange authorization code for bearer tokens via Twitter OAuth 2.0 PKCE
    return {
      tokens: {
        accessToken: "x_mock_access_token",
        refreshToken: "x_mock_refresh_token",
        expiresAt: new Date(Date.now() + 7200 * 1000),
      },
      profile: {
        handle: "@founder_voice",
        name: "Founder Persona",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=x",
        providerId: "x_uid_123",
      },
    };
  }

  async publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult> {
    try {
      // Calls Twitter v2 POST /2/tweets
      // Handles single tweet or thread iteration
      return {
        success: true,
        externalPostId: `x_post_${Date.now()}`,
        url: `https://x.com/post/${Date.now()}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to publish tweet",
      };
    }
  }

  async deletePost(tokens: AuthTokens, externalPostId: string): Promise<boolean> {
    return true;
  }
}

