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

  async authenticate(_code: string, _redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    throw new Error("X account connection is not implemented");
  }

  async publish(_tokens: AuthTokens, _content: PostContent): Promise<PublishResult> {
    return { success: false, error: "X publishing is not implemented" };
  }
}
