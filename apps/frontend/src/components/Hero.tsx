"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedHeadline } from "./AnimatedHeadline";

interface HeroProps {
  onOpenTrial: () => void;
}

export function Hero({ onOpenTrial }: HeroProps) {
  const avatars = [
    { label: "OL", bg: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
    { label: "IN", bg: "bg-purple-500/20 text-purple-700 dark:text-purple-300" },
    { label: "MA", bg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
    { label: "JE", bg: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
    { label: "UN", bg: "bg-pink-500/20 text-pink-700 dark:text-pink-300" },
    { label: "FI", bg: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" },
    { label: "IN", bg: "bg-rose-500/20 text-rose-700 dark:text-rose-300" },
    { label: "IO", bg: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300" },
    { label: "HO", bg: "bg-teal-500/20 text-teal-700 dark:text-teal-300" },
  ];

  return (
    <section id="hero" className="flex flex-col items-center px-4 pt-12 pb-4 md:pt-16 md:pb-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4">
        <div className="flex w-full flex-col items-center text-center">
          {/* Release Badge (Temporarily commented out until AI Carousel Maker ships) */}
          {/*
          <Link
            href="#showcase-demos"
            className="group mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="flex items-center rounded-full bg-primary/10 py-0.5 font-semibold px-2 text-[11px]">
              <span
                style={{
                  backgroundImage: "linear-gradient(to right,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#6366f1,#a855f7)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                new
              </span>
            </span>
            <span>AI Carousel Maker is live</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
          */}

          {/* Main Headline with Editorial Serif Italic Styling & Smooth Entrance Animations */}
          <AnimatedHeadline className="mb-2" />

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-base whitespace-pre-line text-muted-foreground sm:text-lg md:mt-6 md:text-xl">
            From finding ideas to posts, carousels, scheduling and analytics —
            reerts takes over the social media work that used to eat your day.
          </p>

          {/* CTA & Social Proof */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onOpenTrial}
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-lg px-8 text-lg font-semibold gap-2 shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                Start your 7-day free trial
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>

              <Link
                href="/studio"
                className="inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border bg-card/80 hover:bg-muted text-foreground h-12 rounded-lg px-6 text-base font-semibold gap-2 shadow-xs"
              >
                Open Studio
              </Link>
            </div>

            <div className="flex flex-col items-center sm:h-12 sm:justify-center">
              <div className="flex items-center -space-x-3 h-8">
                {avatars.map((av, idx) => (
                  <div
                    key={idx}
                    className="relative transition-transform hover:scale-110 hover:z-20 cursor-default"
                    style={{ zIndex: 10 - idx }}
                  >
                    <span className="relative flex shrink-0 overflow-hidden rounded-full size-8 border-2 border-background grayscale hover:grayscale-0 transition-all">
                      <span className={`flex size-full items-center justify-center rounded-full text-[10px] font-bold ${av.bg}`}>
                        {av.label}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <span className="mt-1 text-sm text-muted-foreground">
                Trusted by 829 founders and agencies
              </span>
            </div>
          </div>
        </div>

        {/* Rotating Platform Orbit Animation (Pixel Perfect Match to Spec Reference) */}
        <div className="relative aspect-square w-[320px] sm:w-[380px] md:w-[420px] mt-8 sm:mt-10 select-none mx-auto">
          {/* Static Circular Orbit Track Line */}
          <div className="absolute inset-[6%] rounded-full border border-neutral-200/90 dark:border-neutral-800 pointer-events-none" />

          {/* Center Brand Symbol (Static, does not spin) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/images/logos/reerts-symbol-black.svg"
              alt="reerts"
              width={160}
              height={160}
              className="size-24 sm:size-28 md:size-36 object-contain dark:hidden drop-shadow-xs"
              priority
            />
            <Image
              src="/images/logos/reerts-symbol-white.svg"
              alt="reerts"
              width={160}
              height={160}
              className="size-24 sm:size-28 md:size-36 object-contain hidden dark:block drop-shadow-xs"
              priority
            />
          </div>

          {/* Rotating Orbit Container */}
          <div className="absolute inset-0 animate-orbit">
            {/* 1. Top (50%, 6%) - YouTube (Red Squircle with white play triangle) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "6%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-[14px] md:rounded-[16px] bg-[#FF0000] shadow-md transition-transform hover:scale-110">
                  <svg viewBox="0 0 24 24" className="size-5 sm:size-6 ml-0.5" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.5 6.8v10.4l8.2-5.2L8.5 6.8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 1: Between YouTube & TikTok (22.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "66.84%", top: "9.35%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#1877F2] shadow-xs" />
            </div>

            {/* 2. Top-Right (81.11%, 18.89%) - TikTok (Black circle with chromatic aberration music note) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "81.11%", top: "18.89%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-full bg-black shadow-md transition-transform hover:scale-110 p-2.5 sm:p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352.28 398.67" className="size-full">
                    <path d="M137.17 156.98v-15.56c-5.34-.73-10.76-1.18-16.29-1.18C54.23 140.24 0 194.47 0 261.13c0 40.9 20.43 77.09 51.61 98.97-20.12-21.6-32.46-50.53-32.46-82.31 0-65.7 52.69-119.28 118.03-120.81Z" fill="#25f4ee"/>
                    <path d="M140.02 333c29.74 0 54-23.66 55.1-53.13l.11-263.2h48.08c-1-5.41-1.55-10.97-1.55-16.67h-65.67l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-9.24 0-17.95-2.31-25.61-6.34C105.3 323.9 121.6 333 140.02 333ZM333.13 106V91.37c-18.34 0-35.43-5.45-49.76-14.8 12.76 14.65 30.09 25.22 49.76 29.43Z" fill="#25f4ee"/>
                    <path d="M283.38 76.57c-13.98-16.05-22.47-37-22.47-59.91h-17.59c4.63 25.02 19.48 46.49 40.06 59.91ZM120.88 205.92c-30.44 0-55.21 24.77-55.21 55.21 0 21.2 12.03 39.62 29.6 48.86-6.55-9.08-10.45-20.18-10.45-32.2 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-67.05c-5.34-.73-10.76-1.18-16.29-1.18-.96 0-1.9.05-2.85.07v51.49c-5.16-1.61-10.61-2.55-16.29-2.55Z" fill="#fe2c55"/>
                    <path d="M333.13 106v51.04c-34.05 0-65.61-10.89-91.37-29.38v133.47c0 66.66-54.23 120.88-120.88 120.88-25.76 0-49.64-8.12-69.28-21.91 22.08 23.71 53.54 38.57 88.42 38.57 66.66 0 120.88-54.23 120.88-120.88V144.33c25.76 18.49 57.32 29.38 91.37 29.38v-65.68c-6.57 0-12.97-.71-19.14-2.03Z" fill="#fe2c55"/>
                    <path d="M241.76 261.13V127.66c25.76 18.49 57.32 29.38 91.37 29.38V106c-19.67-4.21-37-14.77-49.76-29.43-20.58-13.42-35.43-34.88-40.06-59.91h-48.08l-.11 263.2c-1.1 29.47-25.36 53.13-55.1 53.13-18.42 0-34.72-9.1-44.75-23.01-17.57-9.25-29.6-27.67-29.6-48.86 0-30.44 24.77-55.21 55.21-55.21 5.68 0 11.13.94 16.29 2.55v-51.49C71.83 158.5 19.14 212.08 19.14 277.78c0 31.78 12.34 60.71 32.46 82.31C71.23 373.87 95.12 382 120.88 382c66.65 0 120.88-54.23 120.88-120.88Z" fill="#ffffff"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 2: Between TikTok & Facebook (67.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "90.65%", top: "33.16%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#1877F2] shadow-xs" />
            </div>

            {/* 3. Right (94%, 50%) - Facebook (Blue circle with white 'f') */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "94%", top: "50%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-full bg-[#1877F2] shadow-md transition-transform hover:scale-110 overflow-hidden">
                  <svg viewBox="0 0 36 36" className="size-full" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#1877F2" d="M36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.988 6.598 16.435 15.188 17.781V23.203H10.68V18h4.508v-3.965c0-4.449 2.65-6.906 6.703-6.906 1.941 0 3.973.348 3.973.348v4.367h-2.238c-2.205 0-2.891 1.367-2.891 2.766V18h4.922l-.787 5.203h-4.135v12.578C29.402 34.435 36 26.988 36 18z"/>
                    <path fill="#FFFFFF" d="M24.758 23.203l.787-5.203h-4.922v-3.49c0-1.399.686-2.766 2.891-2.766h2.238V7.377s-2.032-.348-3.973-.348c-4.053 0-6.703 2.457-6.703 6.906V18h-4.508v5.203h4.508v12.578a18.23 18.23 0 005.624 0V23.203h4.135z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 3: Between Facebook & LinkedIn (112.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "90.65%", top: "66.84%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#1877F2] shadow-xs" />
            </div>

            {/* 4. Bottom-Right (81.11%, 81.11%) - LinkedIn (Blue Squircle with white 'in') */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "81.11%", top: "81.11%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-[14px] md:rounded-[16px] bg-[#0A66C2] shadow-md transition-transform hover:scale-110 overflow-hidden">
                  <svg viewBox="0 0 72 72" className="size-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,0 64,0 L8,0 C3.581722,0 0,3.581722 0,8 L0,64 C0,68.418278 3.581722,72 8,72 Z" fill="#0A66C2"/>
                    <path d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z" fill="#FFF"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 4: Between LinkedIn & X (157.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "66.84%", top: "90.65%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#1877F2] shadow-xs" />
            </div>

            {/* 5. Bottom (50%, 94%) - X (Black circle with crisp white 'X') */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: "94%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-full bg-black shadow-md transition-transform hover:scale-110 p-3 sm:p-3.5">
                  <svg viewBox="0 0 1200 1227" className="size-full fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FFFFFF" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 5: Between X & Reddit (202.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "33.16%", top: "90.65%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#FF4500] shadow-xs" />
            </div>

            {/* 6. Bottom-Left (18.89%, 81.11%) - Reddit (Orange Squircle with white Snoo) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "18.89%", top: "81.11%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-[14px] md:rounded-[16px] bg-[#FF4500] shadow-md transition-transform hover:scale-110 p-2 sm:p-2.5 overflow-hidden">
                  <svg viewBox="0 0 20 20" className="size-full" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none">
                      <circle cx="14.6" cy="3.6" r="1.3" fill="#FFFFFF"/>
                      <path d="M10 6.5C11.6 4.8 13.5 3.8 14.6 3.6" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
                      <circle cx="3.8" cy="10.8" r="1.8" fill="#FFFFFF"/>
                      <circle cx="16.2" cy="10.8" r="1.8" fill="#FFFFFF"/>
                      <ellipse cx="10" cy="11.5" rx="5.6" ry="4.2" fill="#FFFFFF"/>
                      <circle cx="8" cy="11.2" r="1" fill="#FF4500"/>
                      <circle cx="12" cy="11.2" r="1" fill="#FF4500"/>
                      <path d="M8.2 13.2C8.8 13.9 11.2 13.9 11.8 13.2" stroke="#FF4500" strokeWidth="0.9" strokeLinecap="round"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 6: Between Reddit & RSS (247.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "9.35%", top: "66.84%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#FF5722] shadow-xs" />
            </div>

            {/* 7. Left (6%, 50%) - RSS (Black circle with white feed waves) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "6%", top: "50%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-full bg-black shadow-md transition-transform hover:scale-110 p-2.5 sm:p-3">
                  <svg viewBox="0 0 24 24" className="size-full fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 7: Between RSS & Instagram (292.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "9.35%", top: "33.16%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#334155] dark:bg-slate-400 shadow-xs" />
            </div>

            {/* 8. Top-Left (18.89%, 18.89%) - Instagram (Gradient Squircle with white camera glyph) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "18.89%", top: "18.89%" }}>
              <div className="animate-orbit-reverse">
                <div className="flex size-11 sm:size-12 md:size-[50px] items-center justify-center rounded-[14px] md:rounded-[16px] shadow-md transition-transform hover:scale-110 overflow-hidden">
                  <svg viewBox="0 0 24 24" className="size-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="instaGradHero" cx="30%" cy="107%" r="150%">
                        <stop offset="0%" stopColor="#fdf497"/>
                        <stop offset="5%" stopColor="#fdf497"/>
                        <stop offset="45%" stopColor="#fd5949"/>
                        <stop offset="60%" stopColor="#d6249f"/>
                        <stop offset="90%" stopColor="#285AEB"/>
                      </radialGradient>
                    </defs>
                    <rect width="24" height="24" rx="6" fill="url(#instaGradHero)"/>
                    <g fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(3.5, 3.5)">
                      <rect x="0.5" y="0.5" width="16" height="16" rx="4.5" />
                      <circle cx="8.5" cy="8.5" r="3.8" />
                      <circle cx="13" cy="4" r="0.8" fill="#FFFFFF" stroke="none" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Dot 8: Between Instagram & YouTube (337.5°) */}
            <div className="absolute w-max -translate-x-1/2 -translate-y-1/2" style={{ left: "33.16%", top: "9.35%" }}>
              <div className="size-1.5 sm:size-2 rounded-full bg-[#EF4444] shadow-xs" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
