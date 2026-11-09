"use client";

import React, { useEffect } from "react";
import { AppShell } from "@/components/design-system/AppShell";
import { PrimaryButton, SecondaryGlassButton } from "@/components/design-system/Buttons";

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Calendar Page Error:", error);
  }, [error]);

  return (
    <AppShell activeTab="calendar">
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#08090a] rounded-2xl border border-white/[0.08]">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Unable to Load Calendar</h2>
        <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
          {error.message ||
            "An error occurred while loading your scheduled publishing timeline and channels."}
        </p>
        <div className="flex gap-3">
          <SecondaryGlassButton type="button" onClick={() => window.location.reload()}>
            Reload Page
          </SecondaryGlassButton>
          <PrimaryButton type="button" onClick={reset}>
            Try Again
          </PrimaryButton>
        </div>
      </main>
    </AppShell>
  );
}
