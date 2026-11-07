import React, { Suspense } from "react";
import { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: "Sign in / Sign up — Reerts",
  description: "Sign in to your workspace with email or Google.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WorkspaceShell initialView="conversations" showAuthModal={true} authModalMode="signin" />
    </Suspense>
  );
}
