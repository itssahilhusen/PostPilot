import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create Account — PostPilot",
  description: "Create your PostPilot automation workspace.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthForm initialMode="signup" />
    </Suspense>
  );
}
