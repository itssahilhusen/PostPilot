import React, { Suspense } from "react";
import { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: "Sign in — PostPilot",
  description: "Sign in to your PostPilot automation workspace.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WorkspaceShell initialView="pipelines" showAuthModal={true} authModalMode="signin" />
    </Suspense>
  );
}
