"use client";

import React, { Suspense } from "react";
import { SwiperaStudioWorkspace } from "@/components/workspace/SwiperaStudioWorkspace";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[var(--bg)]" />}>
      <SwiperaStudioWorkspace initialTab="calendar" />
    </Suspense>
  );
}
