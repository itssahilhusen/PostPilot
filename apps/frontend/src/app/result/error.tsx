"use client";

import React, { useEffect } from "react";
import { AppShell } from "@/components/design-system/AppShell";
import { PrimaryButton, SecondaryGlassButton } from "@/components/design-system/Buttons";

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Result studio error:", error);
  }, [error]);

  return (
    <AppShell activeTab="create">
      <main
        className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(20, 26, 28, 0.6) 0%, rgba(6, 8, 9, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Failed to render Carousel Studio</h2>
            <p className="text-xs text-neutral-400">
              {error.message || "An unexpected error occurred in the carousel workspace."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <SecondaryGlassButton type="button" onClick={() => window.location.reload()}>
              Reload Workspace
            </SecondaryGlassButton>
            <PrimaryButton type="button" onClick={reset}>
              Try Again
            </PrimaryButton>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

