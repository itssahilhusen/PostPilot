export interface Channel {
  id: string;
  name: string;
  handle: string;
  platform: "instagram" | "discord" | "twitter" | "tiktok" | "linkedin" | "youtube";
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
  platform: "instagram" | "discord" | "twitter" | "tiktok" | "linkedin" | "youtube";
  platformBadgeBg: string;
  platformBadgeIcon: string;
  dayIndex: number; // 0=Sun 14, 1=Mon 15, 2=Tue 16, 3=Wed 17, 4=Thu 18
  dayNumber: number;
  dayName: string;
  timeSlot: string;
  topOffset: number; // px offset in grid column
  imageUrl: string;
  imageAlt: string;
  caption: string;
  fullCaption: string;
  tag: string;
  status: "scheduled" | "draft" | "published";
  scheduledTime: string;
}

export interface CalendarDay {
  dayNumber: number;
  dayName: string;
  dateStr: string;
  isToday?: boolean;
}

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: "ch-1",
    name: "Nevo David",
    handle: "@nevo_david",
    platform: "instagram",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj8lVIBo1JqKXzl-K_xWndvimCNBvjk2i76M9ZjL3Qal7MGlxmDSNmbed6k7iDdSGnMmzCkEThREDD2ws9Qal15iIENTpeoTQ07kdqZiSPEW-JjrMYgRelDAN8YsFyvy-cCT78DSUqAGqDJgqO_omxCUabOWBiWhT6KD78P0uLPD0pmXBSHQQ_OSQdweRYaqlaLePUovWaLw_PK3Lz1sdrtRbR8G49okM8IlwftVEtPdDm70ZL2ImppA",
    badgeBg: "bg-[#E1306C]",
    badgeIcon: "📷",
  },
  {
    id: "ch-2",
    name: "Nova Clay",
    handle: "@novaclay",
    platform: "discord",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAhGq4qAxGcWjOJkmZEXBqWfjwiHMn8uTDbf7fIWJG7UD-eVBuALdtMWVr6gMbTEs2AcLYjU_2YAWaSWIDfgYkSs7LoFQFQnAmg9efSBg5wEUvn6A8YX-ctfQSg5cWZAV99-t4NMG6mWnfxthepKdLhbSHrJ1LVGkXOC5cOI2Ffe-RAmfVkWNQlwaGpUVODeVftiCVpVv2WYqKuTksTKiS01adMqRDsxPscTNxKsLYlR6PSKdHFeNxKQ",
    badgeBg: "bg-[#5865F2]",
    badgeIcon: "💬",
  },
  {
    id: "ch-3",
    name: "Acme Co",
    handle: "@acmeco",
    platform: "twitter",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgo0kOGij5CC2AkGo6zvTJfB2UPCT5-PvyO1VPf_XmSGG2RXQovrodaxs2ZYNylf1K21hmiYM9_utA3bkX2_XaLaB-qh3ZuMY-qXKrW4U7MU9zXRQdrAkTsr-klbYhiGntovfgDhjwR5TRbeAK22rtJy8WVroosGkG5gz5aX9pOW3TD0DiojUNV4aTYDzJOGtWvkNYgqAsvq-V3rW-w4Uu6OLwwpScE4c0D2HrMHosng6w4Naefpx_mw",
    badgeBg: "bg-black border border-neutral-700",
    badgeIcon: "𝕏",
  },
];

export const CALENDAR_DAYS: CalendarDay[] = [
  { dayNumber: 14, dayName: "Sun", dateStr: "2026-08-14" },
  { dayNumber: 15, dayName: "Mon", dateStr: "2026-08-15" },
  { dayNumber: 16, dayName: "Tue", dateStr: "2026-08-16" },
  { dayNumber: 17, dayName: "Wed", dateStr: "2026-08-17" },
  { dayNumber: 18, dayName: "Thu", dateStr: "2026-08-18" },
];

export const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00"];

export const INITIAL_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: "post-1",
    channelId: "ch-1",
    authorName: "Nevo David",
    authorHandle: "@nevo_da...",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj8lVIBo1JqKXzl-K_xWndvimCNBvjk2i76M9ZjL3Qal7MGlxmDSNmbed6k7iDdSGnMmzCkEThREDD2ws9Qal15iIENTpeoTQ07kdqZiSPEW-JjrMYgRelDAN8YsFyvy-cCT78DSUqAGqDJgqO_omxCUabOWBiWhT6KD78P0uLPD0pmXBSHQQ_OSQdweRYaqlaLePUovWaLw_PK3Lz1sdrtRbR8G49okM8IlwftVEtPdDm70ZL2ImppA",
    platform: "instagram",
    platformBadgeBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
    platformBadgeIcon: "📷",
    dayIndex: 0,
    dayNumber: 14,
    dayName: "Sun",
    timeSlot: "08:45",
    topOffset: 70,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHfb4nQTkFyzAoIQVD162kPVgg4205N78FjaAttZXdgsw8ONxmtARej1pfnB7i-YiZlNVRgwmIJgFOEmLG2FRUfUGJEPWkdb_L65DJt62xaBMN29Q5I78bf0SYCG_PUwu8XRaPCUPEvqR0YQJzOfNHghpF1nIDb-3HzI8PjZySnF36ejYN_m_clz_mbqxcqA8bNLum3c7a3qVYN75Pc4ZCIkO46x2fNNXNXaEev7QEoFxyfemc5KxgHg",
    imageAlt: "Emerald green perfume bottle",
    caption: "Meet the new eau de...",
    fullCaption: "Meet the new eau de parfum collection. Handcrafted botanical notes with sustained emerald aura. Available exclusively this Sunday.",
    tag: "#newdrop",
    status: "scheduled",
    scheduledTime: "Sun, Aug 14 at 08:45 AM",
  },
  {
    id: "post-2",
    channelId: "ch-2",
    authorName: "Nova Clay",
    authorHandle: "@novaclay",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAhGq4qAxGcWjOJkmZEXBqWfjwiHMn8uTDbf7fIWJG7UD-eVBuALdtMWVr6gMbTEs2AcLYjU_2YAWaSWIDfgYkSs7LoFQFQnAmg9efSBg5wEUvn6A8YX-ctfQSg5cWZAV99-t4NMG6mWnfxthepKdLhbSHrJ1LVGkXOC5cOI2Ffe-RAmfVkWNQlwaGpUVODeVftiCVpVv2WYqKuTksTKiS01adMqRDsxPscTNxKsLYlR6PSKdHFeNxKQ",
    platform: "discord",
    platformBadgeBg: "bg-[#5865F2]",
    platformBadgeIcon: "💬",
    dayIndex: 1,
    dayNumber: 15,
    dayName: "Mon",
    timeSlot: "09:30",
    topOffset: 110,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfYy4uv71W1zrnysFSrJCj_0XTDaxc5UJUPW0rLxdHbox-uaZWVE_1O3uVWV3fZ84lGGasL_Op4spJdQPxqzyxN-J_EHjOOtPZO-Bc-GHPyT1kXueqPp1NhusNZMxyK1zx8EvSMElM_ITjYnbanVYm4c_sJOIJkN5NZpO3URGUSiJwfw1_yKukPD1LDQEVtXaVt-q04se7pDo6nqZqMjkJ8dBIpausO5z8Lx0hGwKUzvTC5RN4GH9Q",
    imageAlt: "Warm perfume bottle",
    caption: "Discover our new 30ml...",
    fullCaption: "Discover our new 30ml travel editions. Compact luxury that travels wherever your creative journey leads.",
    tag: "#discovery",
    status: "scheduled",
    scheduledTime: "Mon, Aug 15 at 09:30 AM",
  },
  {
    id: "post-3",
    channelId: "ch-1",
    authorName: "Nevo David",
    authorHandle: "@nevo_david",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDj8lVIBo1JqKXzl-K_xWndvimCNBvjk2i76M9ZjL3Qal7MGlxmDSNmbed6k7iDdSGnMmzCkEThREDD2ws9Qal15iIENTpeoTQ07kdqZiSPEW-JjrMYgRelDAN8YsFyvy-cCT78DSUqAGqDJgqO_omxCUabOWBiWhT6KD78P0uLPD0pmXBSHQQ_OSQdweRYaqlaLePUovWaLw_PK3Lz1sdrtRbR8G49okM8IlwftVEtPdDm70ZL2ImppA",
    platform: "instagram",
    platformBadgeBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
    platformBadgeIcon: "📷",
    dayIndex: 2,
    dayNumber: 16,
    dayName: "Tue",
    timeSlot: "08:30",
    topOffset: 50,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvYu47WhnoGOQeI0Z0DnxZn6UjBtoHgvurOTL5gfQG6aK9UQVST45xKxf5hjxqleT-PGJFQIcrvZILwusNxYe03eqNDcviZ2JEeQpcjBhLCs1FfpVfyvJgfXx-xb74yAWS7QfblBcMKBmfliSos0tBm3ocdAB4SGm2BY29ed2eOx_suINrYo5x9u8AMT-gmaqCrPlFMK19JkSDLv0NM0dPO-PnlH1rQjXIDH7K1_9RH68HQ-qVredF0w",
    imageAlt: "Golden amber perfume bottle",
    caption: "We're partnering with...",
    fullCaption: "We're partnering with visionary independent perfumers across Milan and Grasse to formulate the next season of scents.",
    tag: "#collaboration",
    status: "scheduled",
    scheduledTime: "Tue, Aug 16 at 08:30 AM",
  },
  {
    id: "post-4",
    channelId: "ch-2",
    authorName: "Nova Clay",
    authorHandle: "@novaclay",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAhGq4qAxGcWjOJkmZEXBqWfjwiHMn8uTDbf7fIWJG7UD-eVBuALdtMWVr6gMbTEs2AcLYjU_2YAWaSWIDfgYkSs7LoFQFQnAmg9efSBg5wEUvn6A8YX-ctfQSg5cWZAV99-t4NMG6mWnfxthepKdLhbSHrJ1LVGkXOC5cOI2Ffe-RAmfVkWNQlwaGpUVODeVftiCVpVv2WYqKuTksTKiS01adMqRDsxPscTNxKsLYlR6PSKdHFeNxKQ",
    platform: "discord",
    platformBadgeBg: "bg-[#5865F2]",
    platformBadgeIcon: "💬",
    dayIndex: 3,
    dayNumber: 17,
    dayName: "Wed",
    timeSlot: "10:00",
    topOffset: 130,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZM4teeGNcZbDURqMX4ALEvbcDugLKgDOrFUcqgOXYgN_WKER6L7OQRDN3BJx1jPSoBDMuBCgi5YTvcTHNd7TyMm9vuyu-FCmYgKzKYC6PEUwTQsEuGKFbJjr1StPhiHr2qz6NTiwyYt3bNOjijH8gXTYbwpNWsYm2k-svPVte2t2A3L36QLGGGR_QeTlWo14ZNzXkkt2tbdRp5INXZ775pqX6kekEaTsHuuvSC7laHejZ5Mcf3Mi0Lw",
    imageAlt: "Crimson Baccarat perfume bottle",
    caption: "Limited bottle, weeke...",
    fullCaption: "Limited bottle, weekend release. The crimson glass edition brings deep amber and vanilla undertones.",
    tag: "#limited",
    status: "scheduled",
    scheduledTime: "Wed, Aug 17 at 10:00 AM",
  },
  {
    id: "post-5",
    channelId: "ch-3",
    authorName: "Acme Co",
    authorHandle: "@acmeco",
    authorAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgo0kOGij5CC2AkGo6zvTJfB2UPCT5-PvyO1VPf_XmSGG2RXQovrodaxs2ZYNylf1K21hmiYM9_utA3bkX2_XaLaB-qh3ZuMY-qXKrW4U7MU9zXRQdrAkTsr-klbYhiGntovfgDhjwR5TRbeAK22rtJy8WVroosGkG5gz5aX9pOW3TD0DiojUNV4aTYDzJOGtWvkNYgqAsvq-V3rW-w4Uu6OLwwpScE4c0D2HrMHosng6w4Naefpx_mw",
    platform: "twitter",
    platformBadgeBg: "bg-black border border-neutral-700",
    platformBadgeIcon: "𝕏",
    dayIndex: 4,
    dayNumber: 18,
    dayName: "Thu",
    timeSlot: "09:00",
    topOffset: 85,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTGfYy4uv71W1zrnysFSrJCj_0XTDaxc5UJUPW0rLxdHbox-uaZWVE_1O3uVWV3fZ84lGGasL_Op4spJdQPxqzyxN-J_EHjOOtPZO-Bc-GHPyT1kXueqPp1NhusNZMxyK1zx8EvSMElM_ITjYnbanVYm4c_sJOIJkN5NZpO3URGUSiJwfw1_yKukPD1LDQEVtXaVt-q04se7pDo6nqZqMjkJ8dBIpausO5z8Lx0hGwKUzvTC5RN4GH9Q",
    imageAlt: "Pink glass perfume bottle",
    caption: "New collection drops...",
    fullCaption: "New collection drops this Thursday. Experience the ethereal floral notes engineered with clean ingredients.",
    tag: "#teaser",
    status: "scheduled",
    scheduledTime: "Thu, Aug 18 at 09:00 AM",
  },
];

export const TIMEZONES = [
  "GMT+1 · Auto-detected",
  "UTC · Universal Coordinated Time",
  "EST · Eastern Standard Time (UTC-5)",
  "PST · Pacific Standard Time (UTC-8)",
  "CET · Central European Time (UTC+1)",
  "JST · Japan Standard Time (UTC+9)",
  "IST · India Standard Time (UTC+5:30)",
];

