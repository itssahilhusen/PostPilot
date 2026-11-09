"use client";

import React, { Suspense } from "react";
import { NewsSourcesHub } from "@/components/news-sources/NewsSourcesHub";

export const dynamic = "force-dynamic";

export default function NewsSourcesPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#090a0d] flex items-center justify-center text-sky-400">Loading News Intelligence Hub...</div>}>
      <NewsSourcesHub />
    </Suspense>
  );
}

