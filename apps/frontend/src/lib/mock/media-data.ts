export interface MediaChannel {
  id: string;
  name: string;
  accountHandle?: string;
  subtitle: string;
  connected: boolean;
  active: boolean;
  iconType: "instagram" | "facebook" | "threads" | "twitter" | "tiktok" | "linkedin" | "youtube" | "pinterest";
  brandColor?: string;
  gradient?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  fileName: string;
  resolution: string;
  fileSize: string;
  badgeFormat: string;
  type: "images" | "videos" | "carousels" | "audio";
  channelId: string;
  channelName: string;
  placement: string;
  tag: string;
  tagColor: "lime" | "purple" | "amber" | "neutral";
  imageUrl: string;
  altText: string;
  selected?: boolean;
  linkedPostsCount?: number;
  uploadedAt: string;
  dimensions: { width: number; height: number };
}

export const MEDIA_CHANNELS: MediaChannel[] = [
  {
    id: "instagram",
    name: "Instagram",
    accountHandle: "@nevo_david",
    subtitle: "Connected Account (@nevo_david)",
    connected: true,
    active: true,
    iconType: "instagram",
    gradient: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
  },
  {
    id: "facebook",
    name: "Facebook",
    subtitle: "Connect your Facebook account",
    connected: false,
    active: false,
    iconType: "facebook",
    brandColor: "#1877F2",
  },
  {
    id: "threads",
    name: "Threads",
    subtitle: "Connect your Threads account",
    connected: false,
    active: false,
    iconType: "threads",
    brandColor: "#000000",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    subtitle: "Connect your Twitter / X account",
    connected: false,
    active: false,
    iconType: "twitter",
    brandColor: "#000000",
  },
  {
    id: "tiktok",
    name: "TikTok",
    subtitle: "Connect your TikTok account",
    connected: false,
    active: false,
    iconType: "tiktok",
    brandColor: "#000000",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    subtitle: "Connect your LinkedIn account",
    connected: false,
    active: false,
    iconType: "linkedin",
    brandColor: "#0077B5",
  },
  {
    id: "youtube",
    name: "YouTube",
    subtitle: "Connect your YouTube account",
    connected: false,
    active: false,
    iconType: "youtube",
    brandColor: "#FF0000",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    subtitle: "Connect your Pinterest account",
    connected: false,
    active: false,
    iconType: "pinterest",
    brandColor: "#E60023",
  },
];

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "media-1",
    title: "Smeraldo Emerald Campaign",
    fileName: "Smeraldo_Emerald_Campaign.png",
    resolution: "2528 × 1696 px",
    fileSize: "4.8 MB",
    badgeFormat: "4K PNG",
    type: "images",
    channelId: "instagram",
    channelName: "Instagram",
    placement: "Instagram Feed",
    tag: "2 Linked Posts",
    tagColor: "lime",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNCPHH5quzytudMAz1fflSgC5CDcsDv_IPLC6O26Rey5rASlnUy_4cpE4joVpXP1V029K-0-swu185irCJO_DHKNp2eEmucSqhJRdoVwVmRMnmUDYRYeT6ADQXwJ1PLtnpn6OTMdGuEv26uzrKOGlNJVDwnVMmsup-MOj494UB7_w7f9A7NQn7JPLTtN1_OpOYbCplj8OcurbXAQi8rV87OgyLkeBd4OMqePB0DC4xaR1T34FKCdn4HQ",
    altText: "Emerald Smeraldo Fragrance",
    selected: true,
    linkedPostsCount: 2,
    uploadedAt: "2026-08-14T08:30:00Z",
    dimensions: { width: 2528, height: 1696 },
  },
  {
    id: "media-2",
    title: "Baccarat 540 Glitter Red",
    fileName: "Baccarat_540_Glitter_Red.jpg",
    resolution: "514 × 514 px",
    fileSize: "2.1 MB",
    badgeFormat: "1080×1080",
    type: "images",
    channelId: "instagram",
    channelName: "Instagram",
    placement: "Instagram Post",
    tag: "Ready",
    tagColor: "neutral",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_p9PN0cw57QDs_YZGwK-Yp7MSUp8PD6YnZbO84CZttRnJBZBRsSenLeRTPld29_NPUfef_i9vcaV-Ep-uWwrsvdsTgbDfk8o5SwCUFVC9CcDe-yXcxxUoGRQMb8ofLyOcHYZLPT-l4DQmPck22l4HDqwog0vPt_HJN3iagWn739ka8j71lb80HeXVCPGmPXGB7xKnLBh_X5UEO-z5DKFIjTkf2jaxum8mJzqXo-VvdQrYqhrRvj1C9w",
    altText: "Baccarat Rouge Fragrance",
    selected: false,
    linkedPostsCount: 1,
    uploadedAt: "2026-08-13T14:15:00Z",
    dimensions: { width: 514, height: 514 },
  },
  {
    id: "media-3",
    title: "L'Aura Rose Silky Pedestal",
    fileName: "LAura_Rose_Silky_Pedestal.png",
    resolution: "800 × 800 px",
    fileSize: "3.4 MB",
    badgeFormat: "1080×1080",
    type: "carousels",
    channelId: "instagram",
    channelName: "Instagram",
    placement: "Instagram Reel",
    tag: "Carousel #1",
    tagColor: "purple",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcNNjwFZYFJH2No0i8UKeWJKcblf9Xpfl0kv_Zm1KtW4gFxgokom9jE-9FkYU0VvGLSuB01dhCXYyV4l-U_ji4Y4IQTGNlZ9JeZoXbdCe3o0kXcVqJv_eqzjLACcnGHHrf0BAkCUCErzJYarizECJDwu3VzybnB2JBbbdRNR1DHPSqCv3wArl885Ja71DY1bQa75wVK32yDl0DlMgCQvrjQjzbFoS9Vy0C3oP88WaA2kAMfiV9b9lTGQ",
    altText: "L'Aura Rose Perfume",
    selected: false,
    linkedPostsCount: 3,
    uploadedAt: "2026-08-12T11:00:00Z",
    dimensions: { width: 800, height: 800 },
  },
  {
    id: "media-4",
    title: "Golden Amber Oud Satin",
    fileName: "Golden_Amber_Oud_Satin.jpg",
    resolution: "1920 × 1080 px",
    fileSize: "5.9 MB",
    badgeFormat: "16:9 Banner",
    type: "videos",
    channelId: "instagram",
    channelName: "Instagram",
    placement: "Instagram Story",
    tag: "Hero Asset",
    tagColor: "amber",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwWQieDM4TuRgQ1ZzP75Z5O56QxWjtnGHrSr6ICsBxl6RB1FghKLHY0WSSzg129mrgirME1HmAK7Nhz6B6tQRRRxvf_7FV9V0StuigdO60qMFwUf2XcuzkW2MbZ4uN0W6KYmPVhqQ3PYeeh2eall5TCLFJR-HaIXaxSP175tS3gZv4iVPcD1aV7Zmw84qjrXLGQ8PjxYCDnw5Xqgf-PZ9Ln2fJQdYQHATFXmNY3Xm7tCFSUPHOSxWBug",
    altText: "Amber Perfume Satin Background",
    selected: false,
    linkedPostsCount: 1,
    uploadedAt: "2026-08-11T16:45:00Z",
    dimensions: { width: 1920, height: 1080 },
  },
  {
    id: "media-5",
    title: "Amouage Line 618 Fluted",
    fileName: "Amouage_Line618_Fluted.png",
    resolution: "2048 × 2048 px",
    fileSize: "3.7 MB",
    badgeFormat: "Square HD",
    type: "images",
    channelId: "instagram",
    channelName: "Instagram",
    placement: "Instagram Post",
    tag: "Single Post",
    tagColor: "neutral",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJYf7hAuZSqS_V2dgSJedl5gHwv0VzbHvhHgwG6TY9L0bChrGpB2bfsWVPwZ7gy-u-yOZgWf0Nuh43oQOTw9I-qe8PNl-71YnW_Q87yeTW2CL4bYscTOxWIJTIOAQrlzfkvleKSQjvXK3_LxH6ac5-bjcHqwydt-92iuEsUibyWBnu1cXP_YBmqlaAHKjhK1e_a9HQa-DD70kwW8kKud7rzkz0tJi4kUQnVMsVC-7FLVlIxstdI30NkQ",
    altText: "Amouage Line 618 Minimalist Bottle",
    selected: false,
    linkedPostsCount: 1,
    uploadedAt: "2026-08-10T09:20:00Z",
    dimensions: { width: 2048, height: 2048 },
  },
];

