import { ISocialMediaProvider, SocialPlatformId } from "../social.interface";
import { XProvider } from "./x.provider";
import { LinkedInProvider } from "./linkedin.provider";
import { InstagramProvider } from "./instagram.provider";
import { ThreadsProvider } from "./threads.provider";
import { TikTokProvider } from "./tiktok.provider";

export const socialProviders: Record<SocialPlatformId, ISocialMediaProvider> = {
  x: new XProvider(),
  linkedin: new LinkedInProvider(),
  instagram: new InstagramProvider(),
  threads: new ThreadsProvider(),
  tiktok: new TikTokProvider(),
  facebook: new InstagramProvider(), // Facebook Graph shared
  youtube: new XProvider(), // Default stub
};

export function getSocialProvider(id: SocialPlatformId): ISocialMediaProvider {
  const provider = socialProviders[id];
  if (!provider) {
    throw new Error(`Social provider "${id}" is not supported`);
  }
  return provider;
}

export * from "./x.provider";
export * from "./linkedin.provider";
export * from "./instagram.provider";
export * from "./threads.provider";
export * from "./tiktok.provider";

