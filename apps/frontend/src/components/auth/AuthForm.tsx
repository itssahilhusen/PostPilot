"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, X } from "lucide-react";
import { ReertsLogo } from "@/components/ReertsLogo";
import { toast } from "sonner";

interface AuthFormProps {
  initialMode?: "signin" | "signup";
  onClose?: () => void;
  isModal?: boolean;
}

export function AuthForm({ initialMode = "signin", onClose, isModal = false }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/conversations";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/conversations");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create account");
        }

        toast.success("Account created successfully! Signing in...");
      }

      // NextAuth credentials login
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      toast.success("Welcome back! Redirecting...");
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch (err) {
      toast.error("Google authentication failed. Please try credentials login.");
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset instructions will be sent to your email.");
  };

  const modalContent = (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-[420px] rounded-2xl bg-white dark:bg-[#111113] text-gray-900 dark:text-neutral-100 shadow-2xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-gray-100 dark:border-neutral-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 select-none transition-colors"
    >
      {/* Top-Right Close Button */}
      <button
        id="auth-modal-close-button"
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 active:bg-gray-200 dark:active:bg-neutral-700 transition-all cursor-pointer z-20 group"
        aria-label="Close"
        title="Close this page"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-neutral-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
      </button>

      {/* Modal Header with Reerts App Logo */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5">
          <ReertsLogo variant="symbol" size={24} iconClassName="size-6 object-contain shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {mode === "signup" ? "Sign up" : "Sign in / Sign up"}
          </h2>
        </div>
        {mode === "signup" && (
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 font-normal">
            Sign up with email or Google.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3.5">
        {/* Full Name Field (Sign Up Mode) */}
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-neutral-200 block mb-1">
              Full Name
            </label>
            <input
              id="auth-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-10 px-3.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gray-900 dark:focus:border-neutral-300 focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-300 transition-all"
              required={mode === "signup"}
            />
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="text-xs font-semibold text-gray-800 dark:text-neutral-200 block mb-1">
            Email
          </label>
          <input
            id="auth-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full h-10 px-3.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gray-900 dark:focus:border-neutral-300 focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-300 transition-all"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-800 dark:text-neutral-200 block">
              Password
            </label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white hover:underline transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            id="auth-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full h-10 px-3.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gray-900 dark:focus:border-neutral-300 focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-300 transition-all"
            required
          />
          {mode === "signup" && (
            <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
              Password must be at least 6 characters.
            </p>
          )}
        </div>

        {/* Confirm Password Field (Sign Up Mode) */}
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-gray-800 dark:text-neutral-200 block mb-1">
              Confirm Password
            </label>
            <input
              id="auth-confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full h-10 px-3.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-gray-900 dark:focus:border-neutral-300 focus:ring-1 focus:ring-gray-900 dark:focus:ring-neutral-300 transition-all"
              required={mode === "signup"}
            />
          </div>
        )}

        {/* Primary Submit Button */}
        <button
          id="auth-submit-button"
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-10 rounded-lg bg-neutral-600 hover:bg-neutral-700 active:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-neutral-950 font-medium dark:font-semibold text-sm transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-60 !mt-4"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white dark:text-neutral-950" />
          ) : mode === "signup" ? (
            "Create Account"
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Toggle link between Sign in and Sign up (In Sign In mode, above OR) */}
      {mode === "signin" && (
        <div className="text-xs text-gray-600 dark:text-neutral-400 text-center mt-3">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="font-bold text-gray-900 dark:text-white hover:underline transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </div>
      )}

      {/* Divider OR */}
      <div className="relative flex items-center justify-center w-full my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-neutral-800" />
        </div>
        <div className="relative bg-white dark:bg-[#111113] px-3 text-[10px] text-gray-400 dark:text-neutral-500 font-semibold tracking-wider uppercase transition-colors">
          or
        </div>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full h-10 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-gray-50 dark:hover:bg-neutral-800 active:bg-gray-100 dark:active:bg-neutral-700 flex items-center justify-center gap-2.5 text-sm font-medium text-gray-700 dark:text-neutral-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
        ) : (
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            className="w-4 h-4 shrink-0"
            style={{ width: "16px", height: "16px" }}
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}</span>
      </button>

      {/* Toggle link in Sign Up mode (Below Google button matching screenshot) */}
      {mode === "signup" && (
        <div className="text-xs text-gray-600 dark:text-neutral-400 text-center mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="font-bold text-gray-900 dark:text-white hover:underline transition-colors cursor-pointer"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Terms Disclaimer in Sign In mode */}
      {mode === "signin" && (
        <p className="text-[10px] text-gray-400 dark:text-neutral-500 text-center mt-4">
          By proceeding, you agree to{" "}
          <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-neutral-300">Terms of Service</span> and{" "}
          <span className="underline cursor-pointer hover:text-gray-600 dark:hover:text-neutral-300">Privacy Policy</span>.
        </p>
      )}
    </div>
  );

  if (isModal) {
    return modalContent;
  }

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 dark:bg-black/75 backdrop-blur-xs font-sans select-none antialiased cursor-pointer"
    >
      <div className="fixed inset-0 pointer-events-none -z-10 bg-neutral-800/80 dark:bg-neutral-950/90 backdrop-blur-sm" />
      <div className="cursor-default w-full max-w-[420px] flex items-center justify-center">
        {modalContent}
      </div>
    </div>
  );
}
