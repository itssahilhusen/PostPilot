"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, NavTabId } from "./Sidebar";
import { TopHeader } from "./TopHeader";

interface AppShellProps {
  activeTab?: NavTabId | string;
  children: React.ReactNode;
  className?: string;
  onAddWorkspace?: () => void;
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
}

export function AppShell({
  activeTab = "feed",
  children,
  className,
  onAddWorkspace,
  onOpenNotifications,
  onOpenHelp,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-screen w-screen overflow-hidden bg-black font-sans text-neutral-200 antialiased select-none",
        className
      )}
      style={{
        background: "rgb(0, 0, 0)",
        padding: "12px",
        gap: "12px",
      }}
    >
      {/* 1. Top Header (Floating Glassmorphic Header) */}
      <TopHeader
        onAddWorkspace={onAddWorkspace}
        onOpenNotifications={onOpenNotifications}
        onOpenHelp={onOpenHelp}
      />

      {/* 2. Body Container (Floating Glassmorphic Grid Architecture) */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          gap: "12px",
        }}
      >
        {/* Left Rail (56px / w-14) */}
        <Sidebar activeTab={activeTab} />

        {/* Main Content Workspace */}
        {children}
      </div>
    </div>
  );
}
