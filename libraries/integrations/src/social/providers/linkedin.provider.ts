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

  async authenticate(_code: string, _redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    throw new Error("LinkedIn account connection is not implemented");
  }

  async publish(_tokens: AuthTokens, _content: PostContent): Promise<PublishResult> {
    return { success: false, error: "LinkedIn publishing is not implemented" };
  }
}
