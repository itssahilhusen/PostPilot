"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, Languages, Sun, Moon, Menu, X, ArrowRight, Sparkles, BookOpen, Wrench, User } from "lucide-react";
import { ReertsLogo } from "@/components/ReertsLogo";

interface HeaderProps {
  onOpenTrial?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout?: () => void;
}

export function Header({ onOpenTrial, isDark, onToggleTheme, onLogout }: HeaderProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleDocumentClick = () => setOpenDropdown(null);
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        {/* Brand Logo: reerts with wordmark */}
        <Link href="/" className="flex items-center">
          <ReertsLogo priority variant="full" iconClassName="h-8 sm:h-9 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-2 lg:flex xl:gap-6">
          {/* Features Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "features" ? null : "features")}
              className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
            >
              <span>Features</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === "features" ? "rotate-180 text-foreground" : ""}`} />
            </button>
            {openDropdown === "features" && (
              <div className="absolute left-0 top-full mt-3 w-64 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href="#showcase-demos"
                  onClick={() => setOpenDropdown(null)}
                  className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Carousel Maker
                  </span>
                  <span className="text-xs text-muted-foreground">Auto-generate beautiful slide carousels</span>
                </Link>
                <Link
                  href="#automation-flow"
                  onClick={() => setOpenDropdown(null)}
                  className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-sm text-foreground">Automation Flow</span>
                  <span className="text-xs text-muted-foreground">Collector to Reviewer complete pipeline</span>
                </Link>
                <Link
                  href="#workflow-demo"
                  onClick={() => setOpenDropdown(null)}
                  className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-sm text-foreground">Brand Voice AI</span>
                  <span className="text-xs text-muted-foreground">Remix & write posts in your signature style</span>
                </Link>
                <Link
                  href="#comparison"
                  onClick={() => setOpenDropdown(null)}
                  className="flex flex-col gap-0.5 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <span className="font-medium text-sm text-foreground">Platform Matrix</span>
                  <span className="text-xs text-muted-foreground">Multi-channel cross-posting</span>
                </Link>
              </div>
            )}
          </div>

          {/* Docs Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "docs" ? null : "docs")}
              className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
            >
              <span>Docs</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === "docs" ? "rotate-180 text-foreground" : ""}`} />
            </button>
            {openDropdown === "docs" && (
              <div className="absolute left-0 top-full mt-3 w-56 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <a
                  href="#faq"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Documentation
                </a>
                <a
                  href="#faq"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  API Reference
                </a>
                <a
                  href="#faq"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Platform Integrations
                </a>
              </div>
            )}
          </div>

          {/* Free Tools Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "tools" ? null : "tools")}
              className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
            >
              <span>Free Tools</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === "tools" ? "rotate-180 text-foreground" : ""}`} />
            </button>
            {openDropdown === "tools" && (
              <div className="absolute left-0 top-full mt-3 w-60 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <a
                  href="#showcase-demos"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  Carousel Templates
                </a>
                <a
                  href="#hero"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Viral Hook Generator
                </a>
                <a
                  href="#hero"
                  onClick={() => setOpenDropdown(null)}
                  className="flex items-center gap-2 rounded-lg p-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Social Post Formatter
                </a>
              </div>
            )}
          </div>

          <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#reviews" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground xl:inline">
            Reviews
          </a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </a>
        </div>

        {/* Right Action Icons & Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Language selection"
              title="English"
            >
              <Languages className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle dark mode"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {status === "authenticated" && session?.user ? (
            <>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-3.5 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                Log out
              </button>

              <Link
                href="/studio"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                <span>Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-6 lg:hidden animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            <Link
              href="#showcase-demos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-1"
            >
              Features &amp; AI Tools
            </Link>
            <Link
              href="#automation-flow"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-1"
            >
              How it works
            </Link>
            <Link
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-1"
            >
              Comparison vs Competitors
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-1"
            >
              Pricing Plans
            </Link>
            <Link
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-1"
            >
              Customer Reviews
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-1"
            >
              FAQ
            </Link>

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              {status === "authenticated" && session?.user ? (
                <>
                  <Link
                    href="/studio"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Studio
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
