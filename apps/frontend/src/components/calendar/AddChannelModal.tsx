"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

export interface ChannelPlatform {
  id: string;
  name: string;
  action: string;
  tooltip?: string;
  isMeta?: boolean;
  iconSrc: string;
  keywords: string[];
}

export const ALL_PLATFORMS: ChannelPlatform[] = [
  // Row 1
  {
    id: "x",
    name: "X",
    action: "+ Connect",
    tooltip: "Connect personal or corporate X handle",
    iconSrc: "/icons/platforms/x.png",
    keywords: ["x", "twitter", "tweet", "social"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    action: "Profile",
    iconSrc: "/icons/platforms/linkedin.png",
    keywords: ["linkedin", "profile", "professional", "career"],
  },
  {
    id: "linkedin_page",
    name: "LinkedIn Page",
    action: "Company",
    iconSrc: "/icons/platforms/linkedin-page.png",
    keywords: ["linkedin", "page", "company", "business", "brand"],
  },
  {
    id: "reddit",
    name: "Reddit",
    action: "+ Connect",
    iconSrc: "/icons/platforms/reddit.png",
    keywords: ["reddit", "subreddit", "community"],
  },
  {
    id: "instagram_business",
    name: "Instagram (Facebook Business)",
    action: "Business",
    tooltip: "Instagram must be business and connected to a Facebook page",
    isMeta: true,
    iconSrc: "/icons/platforms/instagram.png",
    keywords: ["instagram", "ig", "business", "meta", "facebook"],
  },

  // Row 2
  {
    id: "instagram_standalone",
    name: "Instagram (Standalone)",
    action: "Standalone",
    isMeta: true,
    iconSrc: "/icons/platforms/instagram-standalone.png",
    keywords: ["instagram", "ig", "creator", "standalone", "reels"],
  },
  {
    id: "facebook_page",
    name: "Facebook Page",
    action: "+ Connect",
    isMeta: true,
    iconSrc: "/icons/platforms/facebook.png",
    keywords: ["facebook", "fb", "meta", "page"],
  },
  {
    id: "threads",
    name: "Threads",
    action: "+ Connect",
    isMeta: true,
    iconSrc: "/icons/platforms/threads.png",
    keywords: ["threads", "meta", "instagram", "text"],
  },
  {
    id: "youtube",
    name: "YouTube",
    action: "Channel",
    iconSrc: "/icons/platforms/youtube.svg",
    keywords: ["youtube", "yt", "video", "google", "channel"],
  },
  {
    id: "gmb",
    name: "Google My Business",
    action: "Locations",
    iconSrc: "/icons/platforms/gmb.png",
    keywords: ["google", "business", "gmb", "maps", "location", "places"],
  },

  // Row 3
  {
    id: "tiktok",
    name: "Tiktok",
    action: "Personal",
    iconSrc: "/icons/platforms/tiktok.png",
    keywords: ["tiktok", "video", "shorts", "personal"],
  },
  {
    id: "tiktok_business",
    name: "TikTok (Business)",
    action: "Business",
    iconSrc: "/icons/platforms/tiktok-business.png",
    keywords: ["tiktok", "business", "ads", "commercial", "video"],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    action: "Boards",
    iconSrc: "/icons/platforms/pinterest.png",
    keywords: ["pinterest", "pin", "boards", "visual", "moodboard"],
  },
  {
    id: "dribbble",
    name: "Dribbble",
    action: "Portfolio",
    iconSrc: "/icons/platforms/dribbble.png",
    keywords: ["dribbble", "design", "portfolio", "ui", "shots"],
  },
  {
    id: "discord",
    name: "Discord",
    action: "Webhook / Bot",
    iconSrc: "/icons/platforms/discord.png",
    keywords: ["discord", "server", "bot", "webhook", "community"],
  },

  // Row 4
  {
    id: "slack",
    name: "Slack",
    action: "Community",
    iconSrc: "/icons/platforms/slack.png",
    keywords: ["slack", "workspace", "community", "channels"],
  },
  {
    id: "kick",
    name: "Kick",
    action: "Live Feed",
    iconSrc: "/icons/platforms/kick.png",
    keywords: ["kick", "streaming", "live", "gaming"],
  },
  {
    id: "twitch",
    name: "Twitch",
    action: "Channel",
    iconSrc: "/icons/platforms/twitch.png",
    keywords: ["twitch", "streaming", "gaming", "live"],
  },
  {
    id: "mastodon",
    name: "Mastodon",
    action: "Fediverse",
    iconSrc: "/icons/platforms/mastodon.png",
    keywords: ["mastodon", "fediverse", "decentralized", "activitypub"],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    action: "AT Protocol",
    tooltip: "AT Protocol handle supported",
    iconSrc: "/icons/platforms/bluesky.png",
    keywords: ["bluesky", "bsky", "atproto", "butterfly"],
  },

  // Row 5
  {
    id: "lemmy",
    name: "Lemmy",
    action: "Community",
    iconSrc: "/icons/platforms/lemmy.png",
    keywords: ["lemmy", "fediverse", "link-aggregator", "reddit-alternative"],
  },
  {
    id: "farcaster",
    name: "Farcaster",
    action: "Warpcast",
    iconSrc: "/icons/platforms/wrapcast.png",
    keywords: ["farcaster", "warpcast", "web3", "crypto", "social"],
  },
  {
    id: "telegram",
    name: "Telegram",
    action: "Channel / Bot",
    iconSrc: "/icons/platforms/telegram.png",
    keywords: ["telegram", "tg", "bot", "broadcast", "channel"],
  },
  {
    id: "nostr",
    name: "Nostr",
    action: "Relays",
    tooltip: "Make sure you provide a HEX key of your Nostr private key, you can get it from websites like iris.to",
    iconSrc: "/icons/platforms/nostr.png",
    keywords: ["nostr", "npub", "relays", "damus", "lightning"],
  },
  {
    id: "vk",
    name: "VK",
    action: "Community",
    iconSrc: "/icons/platforms/vk.png",
    keywords: ["vk", "vkontakte", "social", "russia"],
  },

  // Row 6
  {
    id: "medium",
    name: "Medium",
    action: "Publication",
    iconSrc: "/icons/platforms/medium.png",
    keywords: ["medium", "blog", "articles", "publication", "stories"],
  },
  {
    id: "devto",
    name: "Dev.to",
    action: "Articles",
    iconSrc: "/icons/platforms/devto.png",
    keywords: ["dev.to", "devto", "developer", "blog", "code"],
  },
  {
    id: "hashnode",
    name: "Hashnode",
    action: "Publication",
    iconSrc: "/icons/platforms/hashnode.png",
    keywords: ["hashnode", "blog", "developer", "engineering"],
  },
  {
    id: "wordpress",
    name: "WordPress",
    action: "REST API",
    iconSrc: "/icons/platforms/wordpress.png",
    keywords: ["wordpress", "wp", "blog", "site", "rest api", "cms"],
  },
  {
    id: "listmonk",
    name: "ListMonk",
    action: "Newsletter",
    iconSrc: "/icons/platforms/listmonk.png",
    keywords: ["listmonk", "newsletter", "email", "campaigns", "mailing list"],
  },

  // Row 7
  {
    id: "moltbook",
    name: "Moltbook",
    action: "Feed",
    iconSrc: "/icons/platforms/moltbook.png",
    keywords: ["moltbook", "social", "feed", "crab"],
  },
  {
    id: "whop",
    name: "Whop",
    action: "Forums",
    tooltip: "Schedule posts to forums",
    iconSrc: "/icons/platforms/whop.png",
    keywords: ["whop", "community", "forums", "commerce", "membership"],
  },
  {
    id: "skool",
    name: "Skool",
    action: "Community",
    iconSrc: "/icons/platforms/skool.png",
    keywords: ["skool", "community", "courses", "education"],
  },
  {
    id: "mewe",
    name: "MeWe",
    action: "Feed",
    iconSrc: "/icons/platforms/mewe.png",
    keywords: ["mewe", "social", "network", "privacy"],
  },
  {
    id: "tumblr",
    name: "Tumblr",
    action: "Blog",
    iconSrc: "/icons/platforms/tumblr.png",
    keywords: ["tumblr", "microblog", "blog", "fandom"],
  },
];

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platform: ChannelPlatform) => void;
  error?: string | null;
}

export function AddChannelModal({
  isOpen,
  onClose,
  onSelectPlatform,
  error,
}: AddChannelModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input on open and reset search
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter platforms
  const filteredPlatforms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_PLATFORMS;

    return ALL_PLATFORMS.filter((platform) => {
      if (platform.name.toLowerCase().includes(query)) return true;
      if (platform.action.toLowerCase().includes(query)) return true;
      if (platform.keywords.some((kw) => kw.toLowerCase().includes(query))) return true;
      return false;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      data-purpose="modal-backdrop"
      onClick={onClose}
    >
      <section
        className="w-full max-w-4xl max-h-[92vh] bg-[#161819] border border-[#2b2e31] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        data-purpose="add-channel-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <header className="px-6 py-4 border-b border-[#24272a] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-start">
            <h1 className="text-lg font-bold text-white tracking-tight shrink-0">
              Add Channel
            </h1>
          </div>

          <div className="relative w-full max-w-md mx-auto">
            <svg
              className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              ref={searchInputRef}
              className="w-full bg-[#101112] border border-[#26292c] focus:border-lime focus:ring-1 focus:ring-lime text-xs text-white placeholder-neutral-500 rounded-xl pl-10 pr-4 py-2 transition outline-none"
              placeholder="Search platform or network (e.g. X, Threads, TikTok, Whop, Skool)..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-8 h-8 rounded-lg border border-neutral-800 hover:border-neutral-600 bg-[#121415] text-neutral-400 hover:text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {error && (
          <div className="px-6 py-2 bg-red-950/40 border-b border-red-800/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Modal Body: Platform Grid (35 channels in 5 columns = 7 rows) */}
        <main className="p-6 overflow-y-auto max-h-[66vh] pb-6">
          {filteredPlatforms.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => onSelectPlatform(platform)}
                  className="group bg-[#111314] hover:bg-[#1c1f21] border border-[#222528] hover:border-lime/60 rounded-xl p-3 flex flex-col items-center justify-between text-center transition duration-150 cursor-pointer relative shadow-sm min-h-[110px]"
                  data-purpose="channel-tile"
                >
                  {platform.tooltip && (
                    <span
                      className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-300 text-[11px] cursor-help transition-colors"
                      title={platform.tooltip}
                      onClick={(e) => e.stopPropagation()}
                    >
                      ?
                    </span>
                  )}

                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow group-hover:scale-105 transition shrink-0 my-1">
                    <img
                      src={platform.iconSrc}
                      alt={platform.name}
                      className="w-8 h-8 object-contain rounded-full"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-1.5 text-center w-full px-1">
                    <span className="block text-xs font-semibold text-neutral-100 group-hover:text-white truncate">
                      {platform.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-lime transition leading-none mt-0.5 block">
                      {platform.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-neutral-400">
                No platforms found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Try searching for X, Threads, Instagram, TikTok, Whop, Skool, or Lemmy.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 px-3 py-1.5 text-xs text-lime bg-[#1a1c1d] border border-[#2b2e31] hover:border-lime/50 rounded-lg transition"
              >
                Clear filter
              </button>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default AddChannelModal;
