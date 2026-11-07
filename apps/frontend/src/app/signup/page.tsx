import React, { Suspense } from "react";
import { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: "Sign up — Reerts",
  description: "Sign up with email or Google to Reerts.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WorkspaceShell initialView="conversations" showAuthModal={true} authModalMode="signup" />
    </Suspense>
  );
}
