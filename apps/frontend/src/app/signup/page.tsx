import React, { Suspense } from "react";
import { Metadata } from "next";
import { SignUpView } from "@/components/auth/SignUpView";

export const metadata: Metadata = {
  title: "Unlock Pro — PostPilot",
  description: "Create your PostPilot Dark Obsidian workspace and social publishing hub.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#0c1011]" />}>
      <SignUpView />
    </Suspense>
  );
}
