"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavTabId =
  | "pipeline"
  | "feed"
  | "style"
  | "create"
  | "raw"
  | "video"
  | "caption"
  | "calendar"
  | "media";

export interface SidebarProps {
  activeTab?: NavTabId | string;
  className?: string;
  onOpenTeam?: () => void;
  onOpenBilling?: () => void;
  onOpenSettings?: () => void;
  onTabChange?: (tab: any) => void;
  profileName?: string;
  onProfileClick?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  activeTab = "feed",
  className,
  onOpenTeam,
  onOpenBilling,
  onOpenSettings,
  onTabChange,
  profileName,
  onProfileClick,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const isFeed = activeTab === "feed" || pathname === "/feed" || pathname === "/ideas";
  const isPipeline = activeTab === "pipeline" || pathname === "/pipelines";
  const isStyle = activeTab === "style" || pathname === "/style";
  const isCreate = activeTab === "create" || pathname === "/result";
  const isVideo = activeTab === "raw" || activeTab === "video" || pathname === "/raw" || pathname === "/videos";
  const isMedia = activeTab === "media" || activeTab === "caption" || pathname === "/media" || pathname === "/media-library";
  const isCalendar = activeTab === "calendar" || pathname === "/calendar";

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "w-14 flex flex-col justify-between items-center py-4 shrink-0 z-10 select-none",
        className
      )}
      style={{
        background: "rgba(14, 18, 19, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        boxShadow:
          "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.05) 0px 1px 0px inset",
        overflow: "hidden",
      }}
    >
      {/* Top App Navigation Icons */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* 1. Pipeline */}
        <Link
          href="/raw"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isPipeline
              ? "bg-brand-lime text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="Pipeline"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="6" x2="6" y1="3" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        </Link>

        {/* 2. Feed (Active on this page) */}
        <Link
          href="/feed"
          className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center transition-transform",
            isFeed
              ? "bg-brand-lime text-black shadow-sm"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="Feed"
        >
          <svg
            className="w-5 h-5 fill-none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" fill="currentColor" r="1.5" />
          </svg>
        </Link>

        {/* 3. Style */}
        <Link
          href="/style"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isStyle
              ? "bg-brand-lime text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="Style"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C21.438 6.22 17.18 2 12 2z" />
          </svg>
        </Link>

        {/* 4. Create */}
        <Link
          href="/result"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isCreate
              ? "bg-brand-lime text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="Create"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
        </Link>

        {/* 5. Video Studio (Active on /raw) */}
        <Link
          href="/raw"
          className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
            isVideo
              ? "bg-[#C5F52A] text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="AI Video Studio"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm6 4.5l6 3.5-6 3.5v-7z" />
          </svg>
        </Link>

        {/* 6. Caption & Media Library */}
        <Link
          href="/media"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isMedia
              ? "bg-brand-lime text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="Caption & Media Library"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
        </Link>

        {/* 6. Calendar */}
        <Link
          href="/calendar"
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            isCalendar
              ? "bg-brand-lime text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
          )}
          title="Calendar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </Link>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-4">
        {/* Community / Collaboration */}
        <button
          type="button"
          onClick={onOpenTeam}
          className="w-10 h-10 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/60 flex items-center justify-center transition-colors"
          title="Team & Access"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* Storage / Credit Cards */}
        <button
          type="button"
          onClick={onOpenBilling}
          className="w-10 h-10 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/60 flex items-center justify-center transition-colors"
          title="Billing & Usage"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* Settings Gear */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/60 flex items-center justify-center transition-colors"
          title="Workspace Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
