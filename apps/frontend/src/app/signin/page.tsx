import React, { Suspense } from "react";
import { Metadata } from "next";
import { SignInView } from "@/components/auth/SignInView";

export const metadata: Metadata = {
  title: "Sign In — PostPilot",
  description: "Sign in to your PostPilot Dark Obsidian workspace and social publishing hub.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#0c1011]" />}>
      <SignInView />
    </Suspense>
  );
}

