import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — PostPilot",
  description: "Sign in to your PostPilot automation workspace.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthForm initialMode="signin" />
    </Suspense>
  );
}
