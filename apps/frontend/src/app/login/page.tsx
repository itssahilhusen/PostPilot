import React, { Suspense } from "react";
import { Metadata } from "next";
import { SignInView } from "@/components/auth/SignInView";

export const metadata: Metadata = {
  title: "Sign In & Pro Showcase — PostPilot",
  description: "Sign in to your PostPilot Dark Obsidian workspace and social publishing studio.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#0c1011]" />}>
      <SignInView />
    </Suspense>
  );
}
