"use client";

import React from "react";
import { SwiperaStudioWorkspace, StudioTab } from "./SwiperaStudioWorkspace";

export type WorkspaceTab =
  | "pipelines"
  | "studio"
  | "ideas"
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
  | "carousel"
  | "images"
  | "image"
  | "schedule"
  | "publish"
  | "media-library"
  | "settings";

interface WorkspaceShellProps {
  initialView?: WorkspaceTab;
  children?: React.ReactNode;
  showAuthModal?: boolean;
  authModalMode?: "signin" | "signup";
}

export function WorkspaceShell({
  initialView = "pipelines",
  children,
  showAuthModal = false,
  authModalMode = "signup",
}: WorkspaceShellProps) {
  let mappedTab: StudioTab = "pipeline";

  if (initialView === "pipelines") {
    mappedTab = "pipeline";
  } else if (initialView === "ideas") {
    mappedTab = "ideas";
  } else if (initialView === "calendar" || initialView === "schedule") {
    mappedTab = "calendar";
  } else if (initialView === "create" || initialView === "studio") {
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
    mappedTab = "pipeline";
  }

  return (
    <React.Suspense fallback={<div className="h-screen w-full bg-[var(--bg,#0a0a0c)]" />}>
      <SwiperaStudioWorkspace
        initialTab={mappedTab}
        showAuthModal={showAuthModal}
        authModalMode={authModalMode}
      />
    </React.Suspense>
  );
}
export default WorkspaceShell;
