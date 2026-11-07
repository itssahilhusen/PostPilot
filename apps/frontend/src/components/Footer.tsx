"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function Footer({ isDark, onToggleTheme }: FooterProps) {
  const productLinks = [
    { label: "Pricing", href: "#pricing" },
    { label: "API & MCP", href: "/docs/developers" },
  ];

  const featureLinks = [
    { label: "All features", href: "#showcase-demos" },
    { label: "Brand Voice Learning", href: "#workflow-demo" },
    { label: "Auto Idea Search", href: "#automation-flow" },
    { label: "Content Sources", href: "#showcase-demos" },
    { label: "Auto Content Generation", href: "#automation-flow" },
    { label: "AI Carousel Maker", href: "#showcase-demos" },
    { label: "Best Content Remix", href: "#showcase-demos" },
    { label: "Multi-channel scheduling", href: "#automation-flow" },
    { label: "Recurring posts", href: "#showcase-demos" },
    { label: "Analytics", href: "#workflow-demo" },
    { label: "Mobile Share → Content", href: "#showcase-demos" },
    { label: "Competitor Spy", href: "#showcase-demos" },
    { label: "Auto DM, comments & email", href: "#showcase-demos" },
    { label: "Client account connection", href: "#showcase-demos" },
    { label: "API", href: "/docs/api" },
    { label: "MCP", href: "/docs/mcp" },
    { label: "Figma", href: "/docs/figma" },
  ];

  const freeToolLinks = [
    { label: "All free tools", href: "/tools" },
    { label: "Threads Brand Voice Analyzer", href: "/tools/threads-brand-voice-analyzer" },
    { label: "LinkedIn Brand Voice Analyzer", href: "/tools/linkedin-brand-voice-analyzer" },
    { label: "X Brand Voice Analyzer", href: "/tools/x-brand-voice-analyzer" },
  ];

  const resourceLinks = [
    { label: "About", href: "/about" },
    { label: "Affiliate program", href: "/affiliates" },
    { label: "Help Center", href: "/support" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ];

  return (
    <footer className="w-full pt-14 pb-8 px-6 md:px-12 lg:px-16 transition-colors border-t bg-[#141414] text-white border-white/10 dark:bg-white dark:text-[#0a0a0a] dark:border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          {/* Brand info */}
          <div className="flex flex-col gap-4 shrink-0 lg:w-[240px]">
            <Link href="/" className="flex items-center">
              {/* When in Light Mode: Footer is Black -> White Logo */}
              <Image
                src="/images/logos/header.black.logo.svg"
                alt="reerts"
                width={136}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain dark:hidden"
                priority
              />
              {/* When in Dark Mode: Footer is White -> Black Logo */}
              <Image
                src="/images/logos/header.white.logo.svg"
                alt="reerts"
                width={136}
                height={40}
                className="hidden dark:block h-8 sm:h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* 5 Footer Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 flex-1">
            {/* Column 1: Product */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-white dark:text-[#0a0a0a]">
                Product
              </h3>
              <ul className="flex flex-col gap-2.5">
                {productLinks.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white dark:text-[#737373] dark:hover:text-[#0a0a0a] hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Features */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-white dark:text-[#0a0a0a]">
                Features
              </h3>
              <ul className="flex flex-col gap-2.5">
                {featureLinks.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white dark:text-[#737373] dark:hover:text-[#0a0a0a] hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Free Tools */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-white dark:text-[#0a0a0a]">
                Free Tools
              </h3>
              <ul className="flex flex-col gap-2.5">
                {freeToolLinks.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white dark:text-[#737373] dark:hover:text-[#0a0a0a] hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-white dark:text-[#0a0a0a]">
                Resources
              </h3>
              <ul className="flex flex-col gap-2.5">
                {resourceLinks.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white dark:text-[#737373] dark:hover:text-[#0a0a0a] hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold tracking-wide text-white dark:text-[#0a0a0a]">
                Legal
              </h3>
              <ul className="flex flex-col gap-2.5">
                {legalLinks.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.href}
                      className="text-sm text-white/70 hover:text-white dark:text-[#737373] dark:hover:text-[#0a0a0a] hover:underline transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-12 pt-8 border-t border-white/10 dark:border-[#e5e5e5]">
          <p className="text-sm text-white/60 dark:text-[#737373]">
            © {new Date().getFullYear()} reerts, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
