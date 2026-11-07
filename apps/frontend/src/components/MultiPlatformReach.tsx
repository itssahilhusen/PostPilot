"use client";

import React from "react";
import Image from "next/image";

export function MultiPlatformReach() {
  const platforms = [
    { name: "Instagram", icon: "/images/platforms/instagram.svg", invert: false },
    { name: "TikTok", icon: "/images/platforms/tiktok-light.svg", invert: false },
    { name: "YouTube", icon: "/images/platforms/youtube.svg", invert: false, isWide: true },
    { name: "X (Twitter)", icon: "/images/platforms/x-light.svg", invert: false },
    { name: "LinkedIn", icon: "/images/platforms/linkedin.svg", invert: false },
    { name: "Threads", icon: "/images/platforms/threads.svg", invert: true },
    { name: "Facebook", icon: "/images/platforms/facebook.svg", invert: false },
  ];

  return (
    <section className="border-t border-border bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 text-center text-lg font-medium text-muted-foreground">
          Publish to multiple platforms and get more reach!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14">
          {platforms.map((p, idx) => (
            <div
              key={idx}
              className="flex w-16 flex-col items-center gap-1.5 md:w-20 md:gap-2 transition-transform hover:-translate-y-1 duration-200 cursor-default"
            >
              <div className="flex h-9 w-9 items-center justify-center md:h-11 md:w-11 rounded-xl bg-card border border-border/80 shadow-2xs p-1.5">
                <Image
                  src={p.icon}
                  alt={p.name}
                  width={32}
                  height={p.isWide ? 23 : 32}
                  className={`size-6 md:size-7 object-contain ${p.invert ? "dark:invert" : ""}`}
                />
              </div>
              <span className="text-xs font-semibold text-primary md:text-sm text-center">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
