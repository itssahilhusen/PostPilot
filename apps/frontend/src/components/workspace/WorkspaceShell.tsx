"use client";

import React from "react";
import { SwiperaStudioWorkspace, StudioTab } from "./SwiperaStudioWorkspace";

export type WorkspaceTab =
  | "studio"
  | "ideas"
  | "videos"
  | "create"
  | "templates"
  | "design"
  | "brand"
  | "caption"
  | "calendar"
  | "posts"
  | "personas"
  | "analytics"
  | "accounts"
  | "spy"
  | "pipelines"
  | "carousel"
  | "images"
  | "image"
  | "schedule"
  | "publish"
  | "conversations"
  | "media-library"
  | "engagement-automation"
  | "affiliate"
  | "guide"
  | "support"
  | "settings";

interface WorkspaceShellProps {
  initialView?: WorkspaceTab;
  children?: React.ReactNode;
  showAuthModal?: boolean;
  authModalMode?: "signin" | "signup";
}

export function WorkspaceShell({
  initialView = "studio",
  children,
  showAuthModal = false,
  authModalMode = "signup",
}: WorkspaceShellProps) {
  let mappedTab: StudioTab = "create";
  if (initialView === "ideas") {
    mappedTab = "ideas";
  } else if (initialView === "videos") {
    mappedTab = "videos";
  } else if (initialView === "calendar" || initialView === "schedule") {
    mappedTab = "calendar";
  } else if (initialView === "create") {
    mappedTab = "create";
  } else if (initialView === "templates" || initialView === "images" || initialView === "image" || initialView === "carousel") {
    mappedTab = "templates";
  } else if (initialView === "design") {
    mappedTab = "design";
  } else if (initialView === "brand") {
    mappedTab = "brand";
  } else if (initialView === "caption") {
    mappedTab = "caption";
  } else {
    mappedTab = "create";
  }

  return (
    <React.Suspense fallback={<div className="h-screen w-full bg-[var(--bg)]" />}>
      <SwiperaStudioWorkspace
        initialTab={mappedTab}
        showAuthModal={showAuthModal}
        authModalMode={authModalMode}
      />
    </React.Suspense>
  );
}
