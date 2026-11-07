"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface ClosingCtaProps {
  onOpenTrial: () => void;
}

export function ClosingCta({ onOpenTrial }: ClosingCtaProps) {
  return (
    <section id="closing-cta" className="border-y border-border bg-primary/5 px-4 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          Take back the time you spend on social marketing
        </h2>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onOpenTrial}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-lg font-semibold transition-all shadow-md active:scale-[0.99]"
          >
            Start your 7-day free trial
            <ArrowRight className="relative top-px size-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
