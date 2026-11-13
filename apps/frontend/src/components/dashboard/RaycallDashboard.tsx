"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Layers,
  Bot,
  Pencil,
  Rss,
  Calendar as CalendarIcon,
  CheckSquare,
  FolderOpen,
  UserCheck,
  Sliders,
  HelpCircle,
  Search,
  Plus,
  Mic,
  Send,
  CornerDownLeft,
  ChevronDown,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  CreditCard,
  Video,
  Clock,
  FileText,
  Images as ImagesIcon,
  Globe
} from "lucide-react";

export type SidebarTabId =
  | "pipelines"
  | "auto-dm"
  | "studio"
  | "ideas"
  | "news-sources"
  | "carousel"
  | "videos"
  | "schedule"
  | "publish"
  | "calendar"
  | "posts"
  | "media-library"
  | "accounts"
  | "settings"
  | "support";

interface NavItem {
  id: SidebarTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: "soon" | "new";
  href: string;
  soon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function RaycallDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<SidebarTabId>("studio");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [promptText, setPromptText] = useState("");
  const [selectedActionCard, setSelectedActionCard] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync active tab from pathname if navigating directly
  useEffect(() => {
    if (!pathname) return;
    if (pathname.includes("/pipelines")) setActiveTab("pipelines");
    else if (pathname.includes("/auto-dm") || pathname.includes("/engagement-automation")) setActiveTab("auto-dm");
    else if (pathname.includes("/news-sources")) setActiveTab("news-sources");
    else if (pathname.includes("/ideas")) setActiveTab("ideas");
    else if (pathname.includes("/images") || pathname.includes("/images")) setActiveTab("carousel");
    else if (pathname.includes("/videos")) setActiveTab("videos");
    else if (pathname.includes("/schedule")) setActiveTab("schedule");
    else if (pathname.includes("/publish")) setActiveTab("publish");
    else if (pathname.includes("/calendar")) setActiveTab("calendar");
    else if (pathname.includes("/posts")) setActiveTab("posts");
    else if (pathname.includes("/media-library")) setActiveTab("media-library");
    else if (pathname.includes("/accounts")) setActiveTab("accounts");
    else if (pathname.includes("/settings")) setActiveTab("settings");
    else setActiveTab("studio");
  }, [pathname]);

  // Handle ⌘K shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sections matching exact dashboard tabs requested by user
  const NAV_SECTIONS: NavSection[] = [
    {
      title: "Automation",
      items: [
        {
          id: "pipelines",
          label: "Pipelines",
          icon: Layers,
          badge: "Soon",
          badgeType: "soon",
          href: "/pipelines",
          soon: true,
        },
        {
          id: "auto-dm",
          label: "Auto DM",
          icon: Bot,
          href: "/engagement-automation",
        },
      ],
    },
    {
      title: "Create",
      items: [
        {
          id: "studio",
          label: "Studio",
          icon: Pencil,
          href: "/studio",
        },
        {
          id: "ideas",
          label: "Ideas",
          icon: Rss,
          href: "/ideas",
        },
        {
          id: "news-sources",
          label: "News Sources",
          icon: Globe,
          badge: "100",
          badgeType: "new",
          href: "/news-sources",
        },
        {
          id: "carousel",
          label: "Images",
          icon: ImagesIcon,
          badge: "new",
          badgeType: "new",
          href: "/carousel",
        },
        {
          id: "videos",
          label: "Videos",
          icon: Video,
          badge: "Soon",
          badgeType: "soon",
          href: "/videos",
          soon: true,
        },
        {
          id: "schedule",
          label: "Schedule",
          icon: Clock,
          href: "/schedule",
        },
        {
          id: "publish",
          label: "Publish",
          icon: Send,
          href: "/publish",
        },
      ],
    },
    {
      title: "Operation",
      items: [
        {
          id: "calendar",
          label: "Calendar",
          icon: CalendarIcon,
          href: "/calendar",
        },
        {
          id: "posts",
          label: "Posts",
          icon: CheckSquare,
          href: "/posts",
        },
        {
          id: "media-library",
          label: "Media Library",
          icon: FolderOpen,
          href: "/media-library",
        },
      ],
    },
  ];

  const SETTINGS_ITEMS: NavItem[] = [
    {
      id: "accounts",
      label: "Accounts",
      icon: UserCheck,
      href: "/accounts",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Sliders,
      href: "/settings",
    },
  ];

  const handleCardClick = (cardName: string, promptPrefill: string) => {
    setSelectedActionCard(cardName);
    setPromptText(promptPrefill);
    textareaRef.current?.focus();
    toast.success(`${cardName} action selected`);
  };

  const handleSendPrompt = () => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    toast.success(`Prompt submitted: "${promptText.slice(0, 40)}..."`);
    setPromptText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const userInitial = session?.user?.name
    ? session.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AM";
  const userName = session?.user?.name || "Alex Martis";
  const userEmail = session?.user?.email || "alex.dev@studio.io";
  const firstName = userName.split(" ")[0] || "Alex";

  return (
    <div className="bg-surface font-sans text-slate-900 antialiased h-screen flex overflow-hidden selection:bg-brand-100 selection:text-brand-700 w-full">
      {/* BEGIN: LeftSidebar */}
      <aside
        className={`bg-surface-subtle border-r border-surface-border flex flex-col justify-between h-full select-none flex-shrink-0 z-20 transition-all duration-200 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
        data-purpose="sidebar-navigation"
      >
        {/* Top Area: Logo, Search, Nav Items */}
        <div className="flex flex-col flex-1 overflow-y-auto px-3.5 py-3.5 space-y-4">
          {/* Brand & Collapse Row */}
          <div className="flex items-center justify-between pb-1">
            <Link href="/" className="flex items-center space-x-2.5 group overflow-hidden">
              {/* Stepped geometric brand logo */}
              <div className="w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center text-white font-bold text-sm tracking-tighter shadow-xs group-hover:bg-brand-600 transition-colors flex-shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M4 4h4v6h8V4h4v16h-4v-6H8v6H4V4z" />
                </svg>
              </div>
              {!isSidebarCollapsed && (
                <span className="font-bold text-base tracking-tight text-slate-900">
                  Reerts
                </span>
              )}
            </Link>
            <button
              aria-label="Collapse Sidebar"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
              type="button"
            >
              <svg className="w-4 h-4 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Quick Search Bar */}
          {!isSidebarCollapsed && (
            <div className="relative" data-purpose="search-box">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-9 py-1.5 bg-white border border-surface-border text-xs sm:text-[13px] rounded-md shadow-2xs placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono"
                placeholder="Search..."
                type="text"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <kbd className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          {NAV_SECTIONS.map((section) => {
            const filteredItems = searchQuery
              ? section.items.filter((item) =>
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : section.items;

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2 mb-1.5">
                    {section.title}
                  </h3>
                )}
                {filteredItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  if (isActive) {
                    return (
                      <div key={item.id} className="relative tech-bracket-container tech-corner-tl">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            if (!item.soon) router.push(item.href);
                          }}
                          className={`w-full flex items-center ${
                            isSidebarCollapsed ? "justify-center px-1" : "px-2.5"
                          } py-2 text-xs sm:text-[13px] font-semibold text-brand-600 bg-white shadow-2xs border border-brand-500/30 rounded-md cursor-pointer`}
                          title={item.label}
                        >
                          <Icon className={`w-4 h-4 ${isSidebarCollapsed ? "" : "mr-2.5"} text-brand-500 flex-shrink-0`} />
                          {!isSidebarCollapsed && (
                            <span className="truncate flex-1 text-left">{item.label}</span>
                          )}
                          {!isSidebarCollapsed && item.badge && (
                            <span
                              className={`ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                item.badgeType === "soon"
                                  ? "text-amber-700 bg-amber-50 border-amber-200/60"
                                  : "text-brand-600 bg-brand-50 border-brand-200/60"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.soon) {
                          toast.info(`${item.label} module is coming soon!`);
                          return;
                        }
                        setActiveTab(item.id);
                        router.push(item.href);
                      }}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? "justify-center px-1" : "px-2.5"
                      } py-2 text-xs sm:text-[13px] font-medium text-slate-600 rounded-md hover:bg-white hover:text-slate-900 transition-colors group cursor-pointer ${
                        item.soon ? "opacity-75" : ""
                      }`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 ${isSidebarCollapsed ? "" : "mr-2.5"} text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {!isSidebarCollapsed && item.badge && (
                        <span
                          className={`ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            item.badgeType === "soon"
                              ? "text-amber-700 bg-amber-50 border-amber-200/60"
                              : "text-brand-600 bg-brand-50 border-brand-200/60"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Auxiliary Settings */}
          <div className="space-y-1 pt-2 border-t border-surface-border" data-purpose="nav-section-settings">
            {SETTINGS_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (isActive) {
                return (
                  <div key={item.id} className="relative tech-bracket-container tech-corner-tl">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        router.push(item.href);
                      }}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? "justify-center px-1" : "px-2.5"
                      } py-2 text-xs sm:text-[13px] font-semibold text-brand-600 bg-white shadow-2xs border border-brand-500/30 rounded-md cursor-pointer`}
                      title={item.label}
                    >
                      <Icon className={`w-4 h-4 ${isSidebarCollapsed ? "" : "mr-2.5"} text-brand-500 flex-shrink-0`} />
                      {!isSidebarCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    router.push(item.href);
                  }}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? "justify-center px-1" : "px-2.5"
                  } py-2 text-xs sm:text-[13px] font-medium text-slate-600 rounded-md hover:bg-white hover:text-slate-900 transition-colors group cursor-pointer`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 ${isSidebarCollapsed ? "" : "mr-2.5"} text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Card & User Profile */}
        <div className="p-3 border-t border-surface-border bg-surface-subtle/80 space-y-3">
          {/* Balance & Credits Technical Card */}
          {!isSidebarCollapsed ? (
            <div className="bg-white border border-surface-border rounded-lg p-3 shadow-2xs" data-purpose="credit-metric-box">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <div className="text-[10px] font-mono uppercase font-semibold text-slate-400">Balance</div>
                  <div className="text-sm font-bold font-mono text-slate-900 tracking-tight">$24.80</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase font-semibold text-slate-400">Credits</div>
                  <div className="text-sm font-bold font-mono text-brand-600 tracking-tight">12.4%</div>
                </div>
              </div>
              {/* Technical segmented progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex mb-2.5">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: "12.4%" }} />
                <div className="h-full bg-slate-200" style={{ width: "87.6%" }} />
              </div>
              <button
                type="button"
                onClick={() => toast.info("Opening credit purchase dialog...")}
                className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 text-xs font-mono font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <path d="M12 8v8m-4-4h8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Buy Credits</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <button
                type="button"
                onClick={() => toast.info("Credits: 12.4% left ($24.80)")}
                className="p-1.5 rounded-lg bg-white border border-surface-border text-brand-500 hover:bg-brand-50 transition-colors"
                title="Balance: $24.80 | Credits: 12.4%"
              >
                <CreditCard className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Profile Identifier */}
          <div className="flex items-center justify-between pt-1 px-1" data-purpose="user-profile-badge">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 ring-1 ring-white">
                {userInitial}
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate leading-tight">
                  <div className="text-xs font-semibold text-slate-900 truncate">{userName}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">{userEmail}</div>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                aria-label="Switch workspace"
                onClick={() => toast.info("Switching workspace...")}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                type="button"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 9l4-4 4 4m0 6l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
      {/* END: LeftSidebar */}

      {/* BEGIN: MainContentArea */}
      <main className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto">
        {/* Top Right Utility Header */}
        <header className="w-full flex justify-end items-center px-6 py-3 gap-2 border-b border-surface-border/50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <button
            type="button"
            onClick={() => router.push("/conversations")}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-700 bg-white hover:bg-slate-50 border border-surface-border rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Threads</span>
          </button>
          <button
            aria-label="New thread"
            type="button"
            onClick={() => {
              setPromptText("");
              textareaRef.current?.focus();
              toast.info("Started a new thread");
            }}
            className="p-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-surface-border rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </header>

        {/* Center Workspace Area */}
        <section className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:py-10 max-w-4xl mx-auto w-full">
          {/* Headline & Introduction */}
          <div className="text-center mb-9 space-y-2" data-purpose="dashboard-greeting">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 font-mono">
              Hi {firstName}, how can I help?
            </h1>
            <p className="text-sm sm:text-base font-normal text-slate-500 font-mono">
              Build agents, debug calls, and everything in-between
            </p>
          </div>

          {/* Action Cards (Build, Debug, Analyze) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-9" data-purpose="quick-action-cards">
            {/* Card 1: Build */}
            <div
              onClick={() => handleCardClick("Build", "Build an agent workflow to ")}
              className="tech-card bg-surface-subtle/50 hover:bg-white border border-surface-border hover:border-slate-300 rounded-lg p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group"
            >
              <div className="text-brand-500 mb-3.5 flex items-center justify-between">
                <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M12 6v14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  01
                </span>
              </div>
              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-1.5 font-mono">Build</h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-mono">
                Build agents, debug calls, and everything in-between
              </p>
            </div>

            {/* Card 2: Debug */}
            <div
              onClick={() => handleCardClick("Debug", "Analyze and debug call session logs for ")}
              className="tech-card bg-surface-subtle/50 hover:bg-white border border-surface-border hover:border-slate-300 rounded-lg p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group"
            >
              <div className="text-brand-500 mb-3.5 flex items-center justify-between">
                <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v1m6 11h2m-6 0a4 4 0 01-8 0m8 0V9a4 4 0 00-8 0v7m-2 0H4m4-7h8m-8-3l-2-2m10 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  02
                </span>
              </div>
              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-1.5 font-mono">Debug</h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-mono">
                Build agents, debug calls, and everything in-between
              </p>
            </div>

            {/* Card 3: Analyze */}
            <div
              onClick={() => handleCardClick("Analyze", "Analyze agent performance metrics and conversion rates for ")}
              className="tech-card bg-surface-subtle/50 hover:bg-white border border-surface-border hover:border-slate-300 rounded-lg p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs group"
            >
              <div className="text-brand-500 mb-3.5 flex items-center justify-between">
                <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  03
                </span>
              </div>
              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 mb-1.5 font-mono">Analyze</h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-mono">
                Build agents, debug calls, and everything in-between
              </p>
            </div>
          </div>

          {/* Bottom Interactive Composer Bar */}
          <div className="w-full space-y-3" data-purpose="composer-prompt-container">
            <div className="bg-white border border-surface-border hover:border-slate-400/80 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 rounded-xl p-4 sm:p-5 shadow-xs transition-all duration-200">
              {/* Text Prompt Field */}
              <textarea
                ref={textareaRef}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full resize-none border-0 p-0 text-slate-800 placeholder-slate-400 font-mono text-sm sm:text-[15px] focus:ring-0 bg-transparent leading-relaxed focus:outline-none min-h-[84px]"
                placeholder="Find my longest..."
                rows={3}
              />

              {/* Composer Toolbar Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                {/* Left: Attach Button */}
                <button
                  type="button"
                  onClick={() => toast.info("Attach file or document")}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-[13px] font-mono font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  <span className="text-slate-400 font-bold">+</span>
                  <span>Attach</span>
                </button>

                {/* Right: Voice & Submit Action */}
                <div className="flex items-center space-x-2">
                  <button
                    aria-label="Audio record"
                    type="button"
                    onClick={() => {
                      setIsRecording(!isRecording);
                      toast.info(isRecording ? "Voice recording stopped" : "Listening for voice prompt...");
                    }}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      isRecording ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                  <button
                    aria-label="Send prompt"
                    type="button"
                    onClick={handleSendPrompt}
                    className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <svg className="w-4.5 h-4.5 transform rotate-45 -translate-y-0.5 translate-x-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Shortcuts & Quick Prompts Bar */}
            <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400 px-1 pt-0.5" data-purpose="quick-command-shortcuts">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center">
                  <kbd className="text-slate-600 font-bold mr-1 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[11px]">↵</kbd> to send
                </span>
                <span className="inline-flex items-center">
                  <kbd className="text-slate-600 font-bold mr-1 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-[11px]">⇧↵</kbd> for new line
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setPromptText("/ Research competitors in my niche: ");
                    textareaRef.current?.focus();
                  }}
                  className="hover:text-slate-600 hover:underline cursor-pointer"
                >
                  / Research
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromptText("/ Performance-review for recent campaigns: ");
                    textareaRef.current?.focus();
                  }}
                  className="hover:text-slate-600 hover:underline cursor-pointer"
                >
                  / Performance-review
                </button>
                <span>•</span>
                <span
                  onClick={() => toast.info("Additional commands: /ideas, /carousel, /pipeline, /debug")}
                  className="cursor-pointer hover:text-slate-600"
                >
                  ···
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* END: MainContentArea */}
    </div>
  );
}
export default RaycallDashboard;

