"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface MidCtaProps {
  onOpenTrial: () => void;
}

export function MidCta({ onOpenTrial }: MidCtaProps) {
  return (
    <section id="mid-cta" className="border-y border-border bg-primary/5 px-4 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          No Risk • 7-Day Guarantee
        </span>

        <h2 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl md:text-5xl">
          Seen enough? Now try it yourself
        </h2>

        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          Connect your accounts in 2 minutes and queue an entire month of brand-voice posts before your trial ends.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onOpenTrial}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md active:scale-[0.99]"
          >
            Start your 7-day free trial
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
