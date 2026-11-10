"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function SignUpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sign Up Page Error:", error);
  }, [error]);

  return (
    <div className="w-full h-screen min-h-screen bg-[#0c1011] text-white flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-[380px] p-6 rounded-2xl bg-[#111617] border border-red-500/30 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          {error.message || "An unexpected error occurred during account creation."}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 h-10 rounded-xl bg-[#c5f52a] text-black text-xs font-bold flex items-center justify-center transition-colors hover:bg-[#d6ff47]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

