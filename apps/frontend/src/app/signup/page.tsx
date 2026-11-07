import React, { Suspense } from "react";
import { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const metadata: Metadata = {
  title: "Create Account — PostPilot",
  description: "Create your PostPilot automation workspace.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WorkspaceShell initialView="pipelines" showAuthModal={true} authModalMode="signup" />
    </Suspense>
  );
}
