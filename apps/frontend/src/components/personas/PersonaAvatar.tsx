"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PersonaAvatarProps {
  name: string;
  platform?: string;
  profileImageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function PersonaAvatar({
  name,
  platform,
  profileImageUrl,
  size = "md",
  className,
}: PersonaAvatarProps) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "P";

  const sizeClasses = {
    xs: "size-5 text-[10px]",
    sm: "size-6 text-xs",
    md: "size-8 text-sm",
    lg: "size-10 text-base",
  };

  const getPlatformIcon = (prov?: string) => {
    switch (prov?.toLowerCase()) {
      case "threads":
        return "/images/platforms/threads.svg";
      case "x":
        return "/images/platforms/x-light.svg";
      case "linkedin":
        return "/images/platforms/linkedin.svg";
      case "instagram":
        return "/images/platforms/instagram.svg";
      case "tiktok":
        return "/images/platforms/tiktok-light.svg";
      default:
        return null;
    }
  };

  const platformIcon = getPlatformIcon(platform);

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center select-none", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-xs overflow-hidden ring-1 ring-black/10 dark:ring-white/20 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500",
          sizeClasses[size]
        )}
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Hide broken image and fall back to initial
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {platformIcon && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-background p-0.5 shadow-xs ring-1 ring-border",
            size === "xs" || size === "sm" ? "size-3.5" : "size-4"
          )}
          title={platform}
        >
          <img src={platformIcon} alt={platform} className="size-2.5 object-contain dark:invert" />
        </span>
      )}
    </div>
  );
}
