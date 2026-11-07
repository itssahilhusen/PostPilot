"use client";

import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { ReertsLogo } from "@/components/ReertsLogo";

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "What platforms does reerts support?",
      a: "reerts currently supports X (Twitter), LinkedIn, Threads, Instagram, YouTube, Facebook Pages, and TikTok. TikTok video and photo posts can be published or scheduled using the visibility options TikTok makes available, and views, likes, comments, and shares can be reviewed for public TikTok videos. Bluesky, Pinterest, and more are planned.",
    },
    {
      q: "Will my posts get less reach using reerts?",
      a: "Not at all. reerts uses each platform's official APIs, so your posts are published natively. In fact, consistent scheduling can help improve reach by signaling regular activity to the algorithm.",
    },
    {
      q: "Is my data protected?",
      a: "Security is our top priority. Your data is encrypted, access tokens are stored securely, and we never share your information with third parties.",
    },
    {
      q: "Do I need to share my social media passwords with you?",
      a: "No, we never ask for or store your passwords directly. We use official authentication methods provided by each social platform, which means you log in securely through their official login pages. After initial connection, you don't need to log in again.",
    },
    {
      q: "Can I disconnect my accounts anytime?",
      a: "Absolutely. You can disconnect linked accounts at any time. When you disconnect an account, all reerts internal data related to that account is deleted immediately.",
    },
  ];

  return (
    <section id="faq" className="border-t border-border bg-muted/30 px-4 py-20">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ReertsLogo iconClassName="size-8 sm:size-9 object-contain" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              FAQ
            </h2>
          </div>
          <p className="whitespace-pre-line text-lg text-muted-foreground">
            Still have questions? Feel free to reach out!
          </p>
          <a
            href="/support"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 mt-6 shadow-xs"
          >
            <span>Contact Us</span>
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="w-full">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="rounded-lg border border-border bg-card px-4 transition-colors">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="flex w-full items-start justify-between gap-4 py-4 text-left text-base font-medium text-foreground outline-none transition-all"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`text-muted-foreground size-4 shrink-0 translate-y-1 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div className="pt-0 pb-4 text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
