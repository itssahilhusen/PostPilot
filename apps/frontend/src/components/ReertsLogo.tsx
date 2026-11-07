"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ReertsLogoProps {
  className?: string;
  iconClassName?: string;
  forceDarkBackground?: boolean;
  forceLightBackground?: boolean;
  showWordmark?: boolean;
  variant?: "symbol" | "full";
  priority?: boolean;
  size?: number;
}

export function ReertsLogo({
  className,
  iconClassName,
  forceDarkBackground = false,
  forceLightBackground = false,
  showWordmark = false,
  variant = "symbol",
  priority = false,
  size,
}: ReertsLogoProps) {
  const isFull = variant === "full" || showWordmark;

  // 1. Full Brand Logo (Symbol + Wordmark)
  if (isFull) {
    if (forceDarkBackground) {
      return (
        <div className={cn("inline-flex items-center shrink-0 select-none", className)}>
          <Image
            src="/images/logos/header.black.logo.svg"
            alt="reerts"
            width={size ? Math.round(size * 3.7) : 136}
            height={size || 40}
            style={size ? { height: size, width: "auto" } : undefined}
            className={cn(size ? "object-contain" : "h-8 sm:h-9 w-auto object-contain", iconClassName)}
            priority={priority}
          />
        </div>
      );
    }

    if (forceLightBackground) {
      return (
        <div className={cn("inline-flex items-center shrink-0 select-none", className)}>
          <Image
            src="/images/logos/header.white.logo.svg"
            alt="reerts"
            width={size ? Math.round(size * 3.7) : 136}
            height={size || 40}
            style={size ? { height: size, width: "auto" } : undefined}
            className={cn(size ? "object-contain" : "h-8 sm:h-9 w-auto object-contain", iconClassName)}
            priority={priority}
          />
        </div>
      );
    }

    // Adaptive Theme
    return (
      <div className={cn("inline-flex items-center shrink-0 select-none", className)}>
        <Image
          src="/images/logos/header.white.logo.svg"
          alt="reerts"
          width={size ? Math.round(size * 3.7) : 136}
          height={size || 40}
          style={size ? { height: size, width: "auto" } : undefined}
          className={cn(size ? "dark:hidden object-contain" : "dark:hidden h-8 sm:h-9 w-auto object-contain", iconClassName)}
          priority={priority}
        />
        <Image
          src="/images/logos/header.black.logo.svg"
          alt="reerts"
          width={size ? Math.round(size * 3.7) : 136}
          height={size || 40}
          style={size ? { height: size, width: "auto" } : undefined}
          className={cn(size ? "hidden dark:block object-contain" : "hidden dark:block h-8 sm:h-9 w-auto object-contain", iconClassName)}
          priority={priority}
        />
      </div>
    );
  }

  // 2. Symbol Only Logo (Standalone Orbital Mark)
  const pxSize = size || 36;
  const sizeStyle = size ? { width: size, height: size } : undefined;
  const defaultClass = size ? "object-contain" : "size-8 sm:size-9 object-contain";

  if (forceDarkBackground) {
    return (
      <div className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}>
        <Image
          src="/images/logos/reerts-symbol-white.svg"
          alt="reerts"
          width={pxSize}
          height={pxSize}
          style={sizeStyle}
          className={cn(defaultClass, iconClassName)}
          priority={priority}
        />
      </div>
    );
  }

  if (forceLightBackground) {
    return (
      <div className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}>
        <Image
          src="/images/logos/reerts-symbol-black.svg"
          alt="reerts"
          width={pxSize}
          height={pxSize}
          style={sizeStyle}
          className={cn(defaultClass, iconClassName)}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center justify-center shrink-0 select-none", className)}>
      <Image
        src="/images/logos/reerts-symbol-black.svg"
        alt="reerts"
        width={pxSize}
        height={pxSize}
        style={sizeStyle}
        className={cn("dark:hidden", defaultClass, iconClassName)}
        priority={priority}
      />
      <Image
        src="/images/logos/reerts-symbol-white.svg"
        alt="reerts"
        width={pxSize}
        height={pxSize}
        style={sizeStyle}
        className={cn("hidden dark:block", defaultClass, iconClassName)}
        priority={priority}
      />
    </div>
  );
}
