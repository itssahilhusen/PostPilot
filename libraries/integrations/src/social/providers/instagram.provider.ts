import { publishChannelContent } from "../../graph-publisher";
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

  async authenticate(_code: string, _redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }> {
    throw new Error("Instagram account connection is not implemented");
  }

  async publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult> {
    return publishChannelContent(this.identifier, tokens, content);
  }
}
