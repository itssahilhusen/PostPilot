"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

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
  authModalMode = "signin",
}: WorkspaceShellProps) {
  const router = useRouter();

  useEffect(() => {
    if (!showAuthModal) {
      if (initialView === "pipelines" || initialView === "videos") {
        router.replace("/raw");
      } else if (initialView === "calendar" || initialView === "schedule" || initialView === "publish") {
        router.replace("/calendar");
      } else if (initialView === "media-library" || initialView === "images") {
        router.replace("/media");
      } else if (initialView === "brand" || initialView === "personas") {
        router.replace("/style");
      } else if (initialView === "studio" || initialView === "carousel") {
        router.replace("/result");
      } else {
        router.replace("/feed");
      }
    }
  }, [initialView, showAuthModal, router]);

  if (showAuthModal) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
        <AuthForm initialMode={authModalMode} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center text-neutral-400">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading PostPilot...</span>
      </div>
    </div>
  );
}

export default WorkspaceShell;
