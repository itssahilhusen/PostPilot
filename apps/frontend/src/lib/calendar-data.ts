export interface Channel {
  id: string;
  name: string;
  handle: string;
  platform: "threads" | "facebook" | "instagram" | "discord" | "twitter" | "tiktok" | "linkedin" | "youtube";
  avatarUrl: string;
  badgeBg: string;
  badgeIcon: string;
  badgeBorder?: string;
}

export interface ScheduledPost {
  id: string;
  channelId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  platform: Channel["platform"];
  platformBadgeBg: string;
  platformBadgeIcon: string;
  dayIndex: number;
  dayNumber: number;
  dayName: string;
  timeSlot: string;
  topOffset: number;
  imageUrl: string;
  imageAlt: string;
  caption: string;
  fullCaption: string;
  tag: string;
  status: "scheduled" | "draft" | "published" | "failed" | "cancelled" | "pending_approval";
  scheduledTime: string;
}

export const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00"];

export const TIMEZONES = [
  "GMT+1 · Auto-detected",
  "UTC · Universal Coordinated Time",
  "EST · Eastern Standard Time (UTC-5)",
  "PST · Pacific Standard Time (UTC-8)",
  "CET · Central European Time (UTC+1)",
  "JST · Japan Standard Time (UTC+9)",
  "IST · India Standard Time (UTC+5:30)",
];
