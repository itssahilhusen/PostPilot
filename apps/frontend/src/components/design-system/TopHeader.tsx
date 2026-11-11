"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { PostPilotLogo } from "./PostPilotLogo";

export interface WorkspaceTab {
  id: string;
  name: string;
  avatar: string;
}

const DEFAULT_WORKSPACES: WorkspaceTab[] = [
  {
    id: "halcyon",
    name: "Halcyon & Co",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBIcaKbtWRq3fPrDnztZf89159_1HRWOs8vUjGLIdeWU_xp1eDwfx4UkvGJ6hy37bTkeCgK6_heNwf17_g-bf1UeLNnhlwWGPIh28X1WmzhGdFdlpsw-cUMksiwcze8VhC6j2qgyOYsla2L5jUdFMku5PN3wSZednkvb0XlYAZW9vwNwxT_CfZ6HrQowePQHgk1xQRzplOEMgxsT6Fxsrlzuz212QYhjxplckP-rWk5N1q1jGj5FFMMnA",
  },
  {
    id: "kestrel",
    name: "Kestrel Brands",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABDk9j5EFgISEXmheCbBqL9Jd4J2S-yoryU4-Dh9B-8CNsd1m-RQBqRABXfEPKb5-zNY4w0tWRw4nIoJWF4HmV9Jl3IKFAZ4Y4XqkL0Bdhyub33KTk3CnkeDNncoKfHH8QD341U5Qb6XHPe4VhYnaTyw689lH5PI9M6iE16ojP7jzE5UM_j-1onaStRzow74WBv_CYZAf5ePrKlu3yg8gwdpeQj0oltQ_2JqmAq_mU0sk0Hk9SQ5N6bw",
  },
  {
    id: "rivet",
    name: "Rivet & Wren",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBeZFK3zQEz3SJOps-VrFCmhx-Akf7ShtXNwPTdZJNEmIWILVnOzv4UIox9592XhYoCxHsJd9rtMeY9rs3dneYesqqPJkf5Nn-BFKNQRCSHVrcZ8A5vwjJi6yKPNfXt4m5G_-uiDKFy-Ek9H-nwu7A6q1Uowef5WJ-KJxqthDBnu0bTAVdriBvaaHg4Be6SXmkYuUc5UXqGWEqw-R8uzLUO030tJj_yE8h3d_CS0EKia5tG27DMF__Nzg",
  },
];

export interface TopHeaderProps {
  className?: string;
  onAddWorkspace?: () => void;
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
  currentProjectTitle?: string;
  onProjectTitleChange?: (title: string) => void;
  saveStatus?: string;
  isEditorActive?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveAndPost?: () => void;
  onSendToSchedule?: () => Promise<void> | void;
  onProfileClick?: () => void;
}

export function TopHeader({
  className,
  onAddWorkspace,
  onOpenNotifications,
  onOpenHelp,
  currentProjectTitle,
  onProjectTitleChange,
  saveStatus,
  isEditorActive,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSaveAndPost,
  onSendToSchedule,
  onProfileClick,
}: TopHeaderProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceTab[]>(DEFAULT_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("halcyon");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const removeWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspaces.length > 1) {
      const remaining = workspaces.filter((w) => w.id !== id);
      setWorkspaces(remaining);
      if (activeWorkspaceId === id) {
        setActiveWorkspaceId(remaining[0].id);
      }
    }
  };

  return (
    <header
      className={cn(
        "h-14 flex items-center justify-between z-20 shrink-0 pr-4 pl-0 select-none",
        className
      )}
      style={{
        background: "rgba(14, 18, 19, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        boxShadow:
          "rgba(0, 0, 0, 0.4) 0px 10px 30px, rgba(255, 255, 255, 0.12) 0px 1px 0px inset",
      }}
    >
      {/* Left: Brand mark & Workspace tabs */}
      <div className="flex items-center min-w-0">
        {/* Brand Logo centered exactly across w-14 matching the left rail */}
        <div className="w-14 shrink-0 flex items-center justify-center">
          <Link href="/feed" title="PostPilot Feed">
            <PostPilotLogo variant="badge" size={40} />
          </Link>
        </div>

        {/* Workspace Tabs */}
        <nav className="flex items-center gap-1.5 ml-2 overflow-x-auto hide-scrollbar py-1">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <div
                key={ws.id}
                onClick={() => setActiveWorkspaceId(ws.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors whitespace-nowrap",
                  isActive
                    ? "text-white shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                style={
                  isActive
                    ? {
                        background: "rgba(255, 255, 255, 0.12)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "rgba(255, 255, 255, 0.15) 0px 1px 1px inset",
                      }
                    : {
                        background: "rgba(255, 255, 255, 0.06)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                }
              >
                <img
                  alt={ws.name}
                  className="w-4 h-4 rounded-full object-cover"
                  src={ws.avatar}
                />
                <span>{ws.name}</span>
                {isActive && (
                  <button
                    type="button"
                    onClick={(e) => removeWorkspace(ws.id, e)}
                    className="text-neutral-400 hover:text-white ml-1 p-0.5 rounded transition-colors"
                    title={`Close ${ws.name}`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddWorkspace}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px dashed rgba(255, 255, 255, 0.25)",
            }}
            title="Add New Workspace"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4v16m8-8H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </nav>
      </div>

      {/* Right: Utility Controls & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenHelp}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors hover:bg-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "rgba(255, 255, 255, 0.1) 0px 1px 1px inset",
          }}
          title="Help & Documentation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors relative hover:bg-white/10"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "rgba(255, 255, 255, 0.1) 0px 1px 1px inset",
          }}
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-lime ring-2 ring-black" />
        </button>

        <div className="relative">
          <div
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-1 cursor-pointer select-none"
            title="User Profile"
          >
            <div className="relative">
              <img
                alt="User"
                className="w-9 h-9 rounded-full object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
            </div>
            <svg
              className={cn(
                "w-3.5 h-3.5 text-neutral-400 transition-transform",
                profileDropdownOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl py-1 text-xs text-neutral-200 z-50"
              style={{
                background: "rgba(14, 18, 19, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "rgba(0, 0, 0, 0.6) 0px 10px 30px",
              }}
            >
              <div className="px-3 py-2 border-b border-white/10 font-semibold text-white">
                Elena Rostova
                <div className="text-[10px] text-neutral-400 font-normal">elena@halcyon.co</div>
              </div>
              <Link
                href="/settings"
                className="block px-3 py-2 hover:bg-white/10 transition-colors"
              >
                Workspace Settings
              </Link>
              <Link
                href="/feed"
                className="block px-3 py-2 hover:bg-white/10 transition-colors text-brand-lime"
              >
                Feed Dashboard
              </Link>
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-400 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
