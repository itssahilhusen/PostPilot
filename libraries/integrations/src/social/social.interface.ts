export type SocialPlatformId = "x" | "linkedin" | "threads" | "instagram" | "tiktok" | "facebook" | "youtube";

export interface PostContent {
  text: string;
  threads?: string[];
  mediaUrls?: string[];
  title?: string;
  options?: Record<string, any>;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  url?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  idToken?: string;
  scope?: string;
}

export interface UserProfile {
  handle: string;
  name: string;
  avatar?: string;
  followersCount?: number;
  providerId: string;
}

export interface ISocialMediaProvider {
  readonly identifier: SocialPlatformId;
  readonly name: string;

  getAuthUrl(state: string, redirectUri: string): string;
  authenticate(code: string, redirectUri: string): Promise<{ tokens: AuthTokens; profile: UserProfile }>;
  refreshToken?(refreshToken: string): Promise<AuthTokens>;
  publish(tokens: AuthTokens, content: PostContent): Promise<PublishResult>;
  deletePost?(tokens: AuthTokens, externalPostId: string): Promise<boolean>;
  getMetrics?(tokens: AuthTokens): Promise<{ followers: number; impressions?: number; engagementRate?: number }>;
}

