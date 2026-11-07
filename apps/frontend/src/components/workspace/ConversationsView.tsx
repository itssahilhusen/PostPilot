"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  MoreVertical,
  CornerDownRight,
  User,
  Heart,
  Share2,
  RotateCw,
  Archive,
  Star,
  AtSign,
  LayoutGrid,
  Table as TableIcon,
  Info,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConversationMessage {
  id: string;
  sender: "user" | "follower";
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  platform: "threads" | "instagram" | "x";
  content: string;
  timestamp: string;
  postContext?: {
    title: string;
    snippet: string;
  };
}

interface ConversationThread {
  id: string;
  followerName: string;
  followerHandle: string;
  followerAvatar: string;
  platform: "threads" | "instagram" | "x";
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  starred?: boolean;
  postTitle: string;
  messages: ConversationMessage[];
}

const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: "conv-1",
    followerName: "Sarah Chen",
    followerHandle: "@sarahdesigns",
    followerAvatar: "/images/testimonials/oliviandtilly.jpg",
    platform: "threads",
    lastMessage: "Could you send me the free Notion template mentioned in slide 3?",
    timestamp: "12m ago",
    unread: true,
    starred: true,
    postTitle: "5 High-Conversion Strategies for Solo SaaS Founders",
    messages: [
      {
        id: "msg-1",
        sender: "follower",
        authorName: "Sarah Chen",
        authorHandle: "@sarahdesigns",
        authorAvatar: "/images/testimonials/oliviandtilly.jpg",
        platform: "threads",
        content: "Loved the breakdown on building scalable lead funnels! Could you send me the free Notion template mentioned in slide 3?",
        timestamp: "12m ago",
        postContext: {
          title: "5 High-Conversion Strategies for Solo SaaS Founders",
          snippet: "Slide 3: Systematizing your content repurposing pipeline with centralized asset libraries.",
        },
      },
    ],
  },
  {
    id: "conv-2",
    followerName: "Alex Rivera",
    followerHandle: "@arivera_dev",
    followerAvatar: "/images/testimonials/adrian.jpg",
    platform: "instagram",
    lastMessage: "Which AI models do you recommend for brand voice fine-tuning in 2026?",
    timestamp: "45m ago",
    unread: true,
    starred: false,
    postTitle: "Why Most Creators Fail with Generic AI Prompts",
    messages: [
      {
        id: "msg-2",
        sender: "follower",
        authorName: "Alex Rivera",
        authorHandle: "@arivera_dev",
        authorAvatar: "/images/testimonials/adrian.jpg",
        platform: "instagram",
        content: "Which AI models do you recommend for brand voice fine-tuning in 2026? Are you using Claude 3.7 or custom LoRAs?",
        timestamp: "45m ago",
        postContext: {
          title: "Why Most Creators Fail with Generic AI Prompts",
          snippet: "How personalized tone vectors outperform raw prompt engineering by 4.2x in comment conversion.",
        },
      },
    ],
  },
  {
    id: "conv-3",
    followerName: "Marcus Vance",
    followerHandle: "@marcus_growth",
    followerAvatar: "/images/testimonials/alyssa.jpg",
    platform: "x",
    lastMessage: "Thanks for the feedback! Just applied your hook advice to today's launch thread.",
    timestamp: "2h ago",
    unread: false,
    starred: true,
    postTitle: "The 3-Second Viral Hook Framework",
    messages: [
      {
        id: "msg-3",
        sender: "follower",
        authorName: "Marcus Vance",
        authorHandle: "@marcus_growth",
        authorAvatar: "/images/testimonials/alyssa.jpg",
        platform: "x",
        content: "Thanks for the feedback! Just applied your hook advice to today's launch thread. Engagement is already up 60%.",
        timestamp: "2h ago",
      },
      {
        id: "msg-3-reply",
        sender: "user",
        authorName: "Sahil Shaikh",
        authorHandle: "@itsmesahil3573",
        platform: "x",
        content: "Huge congrats Marcus! Keep testing different open loops in the second sentence. That's where you retain readers past the fold.",
        timestamp: "1h ago",
      },
    ],
  },
  {
    id: "conv-4",
    followerName: "Elena Rostova",
    followerHandle: "@elena_builds",
    followerAvatar: "/images/testimonials/brian.jpg",
    platform: "threads",
    lastMessage: "Are automated comment DMs compliant with the latest Meta API terms?",
    timestamp: "5h ago",
    unread: false,
    starred: false,
    postTitle: "Automating Instagram & Threads Lead Magnets",
    messages: [
      {
        id: "msg-4",
        sender: "follower",
        authorName: "Elena Rostova",
        authorHandle: "@elena_builds",
        authorAvatar: "/images/testimonials/brian.jpg",
        platform: "threads",
        content: "Are automated comment DMs compliant with the latest Meta API terms?",
        timestamp: "5h ago",
      },
    ],
  },
];

const DUMMY_POSTS = [
  {
    id: "post-4",
    author: "my_dummy_4",
    avatarBg: "bg-rose-500",
    content: "This week's highlights recap! 1/3",
    stat: "0/2...",
  },
  {
    id: "post-1",
    author: "my_dummy_1",
    avatarBg: "bg-indigo-600",
    content: "Started a new project! Your support would mean a lot. 🚀 #project #launch",
    stat: "0/3...",
  },
  {
    id: "post-2",
    author: "my_dummy_2",
    avatarBg: "bg-amber-600",
    content: "Working from a cafe today ☕ The focus here is amazing!",
    stat: "0/1...",
  },
  {
    id: "post-3",
    author: "my_dummy_3",
    avatarBg: "bg-emerald-600",
    content: "Here's a demo of our new feature. What do you think?",
    stat: "",
  },
];

const DUMMY_COMMENTS = [
  {
    id: "comm-1",
    author: "seoul_techie",
    time: "2 days ago",
    avatarBg: "bg-amber-700",
    text: "This is a great point. Can you elaborate more?",
  },
  {
    id: "comm-2",
    author: "digital_nomad",
    time: "2 days ago",
    avatarBg: "bg-blue-600",
    text: "Thanks for bringing this up. Very insightful.",
  },
];

export function ConversationsView() {
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>("conv-1");
  const [activeSubTab, setActiveSubTab] = useState<"comments" | "mentions" | "by_post" | "table">("comments");
  const [commentsOnly, setCommentsOnly] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState("post-1");
  const [filterPlatform, setFilterPlatform] = useState<"all" | "threads" | "instagram" | "x">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const activeThread = conversations.find((c) => c.id === activeId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    if (filterPlatform !== "all" && c.platform !== filterPlatform) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.followerName.toLowerCase().includes(q) ||
        c.followerHandle.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = conversations.filter((c) => c.unread).length;

  const handleSelectThread = (id: string) => {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const newMessage: ConversationMessage = {
      id: `reply-${Date.now()}`,
      sender: "user",
      authorName: "Sahil Shaikh",
      authorHandle: "@itsmesahil3573",
      platform: activeThread.platform,
      content: replyText.trim(),
      timestamp: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeThread.id) {
          return {
            ...c,
            lastMessage: replyText.trim(),
            timestamp: "Just now",
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    setReplyText("");
    toast.success(`Reply sent on ${activeThread.platform.toUpperCase()}!`);
  };

  const handleGenerateAiReply = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      let smartReply = "Hey! Thanks so much for reaching out. ";
      if (activeThread.platform === "threads") {
        smartReply += "I've sent the complete Notion workspace template directly over to your DM inbox. Let me know what you think!";
      } else if (activeThread.platform === "instagram") {
        smartReply += "We use personalized tone vectoring on top of Claude 3.7 with a specialized vocabulary index. It keeps consistency across all social hooks!";
      } else {
        smartReply += "Appreciate the support! Keep iterating on the opening loop.";
      }
      setReplyText(smartReply);
      setIsGeneratingAi(false);
      toast.success("AI draft generated in your Brand Voice!");
    }, 600);
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background px-4 lg:px-6 py-5 font-sans min-w-0">
      {/* 1. Conversations Title Row (Exact Studio Standard) */}
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center text-foreground">
            <MessageSquare className="size-7 shrink-0 text-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Conversations
          </h1>
          {unreadCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setConversations((prev) => prev.map((c) => ({ ...c, unread: false })));
              toast.success("Marked all conversations as read");
            }}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <CheckCircle2 className="size-3.5 text-muted-foreground" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Reerts Sub-Tabs Row: Comments, @ Mentions, By post, Table + Connected Accounts */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 shrink-0 select-none">
        <div className="flex items-center gap-5 text-sm">
          <button
            type="button"
            onClick={() => setActiveSubTab("comments")}
            className={cn(
              "flex items-center gap-1.5 font-semibold transition-colors pb-1 cursor-pointer",
              activeSubTab === "comments"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="size-4" />
            <span>Comments</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("mentions")}
            className={cn(
              "flex items-center gap-1.5 font-semibold transition-colors pb-1 cursor-pointer",
              activeSubTab === "mentions"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <AtSign className="size-4" />
            <span>@ Mentions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("by_post")}
            className={cn(
              "flex items-center gap-1.5 font-semibold transition-colors pb-1 cursor-pointer",
              activeSubTab === "by_post"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-4" />
            <span>By post</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("table")}
            className={cn(
              "flex items-center gap-1.5 font-semibold transition-colors pb-1 cursor-pointer",
              activeSubTab === "table"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TableIcon className="size-4" />
            <span>Table</span>
          </button>
        </div>

        {/* Connected social accounts cluster matching screenshot */}
        <div className="flex items-center gap-2">
          <Check className="size-3.5 text-muted-foreground" />
          <div className="flex items-center -space-x-1.5">
            <span className="size-5 rounded-full border border-background bg-zinc-900 text-[9px] text-white font-bold flex items-center justify-center">X</span>
            <span className="size-5 rounded-full border border-background bg-gradient-to-tr from-amber-500 to-rose-500 text-[8px] text-white font-bold flex items-center justify-center">IG</span>
            <span className="size-5 rounded-full border border-background bg-blue-600 text-[8px] text-white font-bold flex items-center justify-center">in</span>
            <span className="size-5 rounded-full border border-background bg-black text-[8px] text-white font-bold flex items-center justify-center">@</span>
            <span className="size-5 rounded-full border border-background bg-rose-600 text-[8px] text-white font-bold flex items-center justify-center">TT</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Inbox Canvas */}
      <div className="flex-1 min-h-0 border border-border rounded-2xl bg-card overflow-hidden flex flex-col md:flex-row shadow-xs">
        {/* Left Column: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0 bg-card/60">
          {/* Search & Platform Filter Bar */}
          <div className="p-3 border-b border-border space-y-2 shrink-0">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary shadow-2xs"
              />
            </div>

            {/* Platform Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {(["all", "threads", "instagram", "x"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPlatform(p)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all shrink-0 cursor-pointer",
                    filterPlatform === p
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {p === "all" ? "All Channels" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No matching conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeThread?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectThread(c.id)}
                    className={cn(
                      "p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative group",
                      isSelected
                        ? "bg-muted/90 dark:bg-muted/40"
                        : "hover:bg-muted/40"
                    )}
                  >
                    {/* Unread indicator dot */}
                    {c.unread && (
                      <span className="size-2 rounded-full bg-primary absolute top-4 left-1.5 shrink-0" />
                    )}

                    {/* Avatar */}
                    <div className="relative size-10 rounded-full overflow-hidden bg-primary/10 shrink-0 border border-border">
                      <Image
                        src={c.followerAvatar}
                        alt={c.followerName}
                        width={40}
                        height={40}
                        className="size-full object-cover"
                      />
                      {/* Platform Icon Badge */}
                      <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-background border border-border flex items-center justify-center">
                        <Image
                          src={
                            c.platform === "x"
                              ? "/images/platforms/x-light.svg"
                              : `/images/platforms/${c.platform}.svg`
                          }
                          alt={c.platform}
                          width={10}
                          height={10}
                          className={cn("size-2.5", c.platform === "x" && "dark:invert")}
                        />
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-foreground truncate">
                          {c.followerName}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {c.timestamp}
                        </span>
                      </div>

                      <span className="text-[11px] text-muted-foreground block truncate mb-1">
                        {c.followerHandle}
                      </span>

                      <p
                        className={cn(
                          "text-xs truncate",
                          c.unread ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {c.lastMessage}
                      </p>
                    </div>

                    {/* Star Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-amber-500"
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          c.starred && "fill-amber-400 text-amber-400 opacity-100"
                        )}
                      />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Thread Detail */}
        {activeThread ? (
          <div className="flex-1 flex flex-col min-w-0 bg-background/50">
            {/* Header info */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-card/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-full overflow-hidden bg-primary/10 shrink-0 border border-border">
                  <Image
                    src={activeThread.followerAvatar}
                    alt={activeThread.followerName}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground truncate">
                      {activeThread.followerName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                      {activeThread.platform}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground block truncate">
                    {activeThread.followerHandle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Replying to: <strong className="text-foreground font-semibold">{activeThread.postTitle}</strong>
                </span>
              </div>
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* Linked Post Context Banner */}
              <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CornerDownRight className="size-3.5 text-primary" />
                  <span>Referenced Social Post</span>
                </div>
                <div className="text-muted-foreground font-medium pl-5">
                  &ldquo;{activeThread.postTitle}&rdquo;
                </div>
              </div>

              {/* Chat Bubbles */}
              {activeThread.messages.map((m) => {
                const isMe = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col max-w-xl",
                      isMe ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.authorName}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs",
                        isMe
                          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-tr-xs"
                          : "bg-card border border-border text-foreground rounded-tl-xs"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Composer Box */}
            <div className="p-3 sm:p-4 border-t border-border bg-card/60 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={handleGenerateAiReply}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold text-xs disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="size-3.5" />
                  <span>{isGeneratingAi ? "Generating in Brand Voice..." : "Suggest AI reply in Brand Voice"}</span>
                </button>
                <span className="text-[11px] text-muted-foreground">
                  Press Enter to send
                </span>
              </div>

              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder={`Reply to ${activeThread.followerName} on ${activeThread.platform}...`}
                  className="flex-1 resize-none rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="rounded-xl bg-primary text-primary-foreground p-3 hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
                  title="Send message"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
            Select a conversation to reply
          </div>
        )}
      </div>
    </div>
  );
}
