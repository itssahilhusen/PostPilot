export type PlatformId = "x" | "linkedin" | "threads" | "instagram" | "tiktok" | "facebook" | "youtube";

export type PostStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";

export interface ThreadItem {
  id: string;
  content: string;
  mediaUrls?: string[];
}

export interface PostRecord {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  rawThreads: ThreadItem[];
  mediaUrls: string[];
  platforms: PlatformId[];
  status: PostStatus;
  scheduledAt: string | null;
  publishedAt: string | null;
  failureReason: string | null;
  impressions: number;
  engagements: number;
  createdAt: string;
  updatedAt: string;
}

export interface BrandVoiceRecord {
  id: string;
  workspaceId: string;
  name: string;
  formality: number;
  directness: number;
  humor: number;
  targetAudience: string;
  bannedWords: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaRecord {
  id: string;
  workspaceId: string;
  title: string;
  excerpt?: string | null;
  sourceType: string;
  viralityScore: number;
  tags: string[];
  convertedPostId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CarouselSlideType =
  | "cover"
  | "body"
  | "stat"
  | "steps"
  | "keypoints"
  | "compare"
  | "timeline"
  | "statement"
  | "quote"
  | "cta"
  | "COVER"
  | "PROBLEM"
  | "CONTENT"
  | "COMPARISON"
  | "CLOSING";

export interface CarouselSlideStep {
  title: string;
  description?: string;
}

export interface CarouselSlideChartBar {
  label: string;
  value: string;
  ratio?: number;
}

export interface CarouselSlideOverrides {
  titleScale?: number;
  bodyScale?: number;
  align?: "left" | "center";
  verticalAlign?: "top" | "center" | "bottom";
  paddingScale?: number;
  fontFamily?: string;
  decoration?: "none" | "frame" | "band" | "circle";
  coverStyle?: "plain" | "accent";
  imageFocus?: { x: number; y: number };
  imageOpacity?: number;
}

export interface CarouselSlideItem {
  id: string;
  order: number;
  slideType: CarouselSlideType;
  headline?: string;
  title?: string;
  body?: string;
  subtitle?: string;
  tag?: string;
  kicker?: string;
  bullets?: string[];
  statValue?: string;
  statLabel?: string;
  statDescription?: string;
  chart?: {
    type: "bars";
    bars: CarouselSlideChartBar[];
  };
  steps?: CarouselSlideStep[];
  quote?: string;
  attribution?: string;
  ctaTitle?: string;
  ctaBody?: string;
  bgGradient?: string;
  imageUrl?: string;
  overrides?: CarouselSlideOverrides;
}

export interface CarouselRecord {
  id: string;
  workspaceId: string;
  title: string;
  theme: "dark" | "gradient" | "minimal" | "light";
  primaryColor?: string;
  footer?: string;
  caption?: string;
  sourceUrl?: string | null;
  aspectRatio: "1:1" | "3:4" | "4:5" | "9:16" | "16:9";
  slides: CarouselSlideItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRecord {
  id: string;
  workspaceId: string;
  name: string;
  active: boolean;
  triggerType: "comment" | "dm";
  targetPostId?: string | null;
  keywords: string;
  actionType: "dm" | "reply" | "email";
  dmContent: string;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  replyVariants: string[];
  requireFollow: boolean;
  followGateText?: string | null;
  captureEmail: boolean;
  emailGateText?: string | null;
  sentCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorRecord {
  id: string;
  workspaceId: string;
  platform: "threads" | "tiktok" | "x";
  handle: string;
  name: string;
  avatar?: string | null;
  followers: number;
  growthRate: string;
  posts: {
    id: string;
    content: string;
    likes: number;
    replies: number;
    shares: number;
    postedAt: string;
    remixed: boolean;
  }[];
}

export interface MediaAssetRecord {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  folder: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalReach: string;
  reachChange: string;
  engagementRate: string;
  engagementChange: string;
  followersGained: string;
  followersChange: string;
  hoursSaved: string;
  platforms: {
    platform: string;
    reach: string;
    engagement: string;
    posts: number;
    icon: string;
    invert?: boolean;
  }[];
  recentActivity: {
    date: string;
    reach: number;
    engagement: number;
  }[];
}
