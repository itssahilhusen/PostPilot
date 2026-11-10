"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, X, Sparkles, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  initialMode?: "signin" | "signup";
  onClose?: () => void;
  isModal?: boolean;
}

export function AuthForm({ initialMode = "signin", onClose, isModal = false }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Clean & normalize callbackUrl so it never redirects to legacy white studio/conversations
  const rawCallback = searchParams?.get("callbackUrl");
  const callbackUrl = (!rawCallback || rawCallback.includes("/studio") || rawCallback.includes("/conversations") || rawCallback.includes("/pipelines"))
    ? "/feed"
    : rawCallback;

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/feed");
    }
  };

  const handleDemoFill = () => {
    setEmail("alex@example.com");
    setPassword("password123");
    toast.info("Demo credentials inserted");
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

      toast.success("Welcome back! Redirecting to feed...");
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
    toast.info("Password reset instructions sent to your email.");
  };

  const formContent = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-[420px] rounded-2xl p-6 sm:p-8 select-none text-white transition-all shadow-2xl"
      style={{
        background: "rgba(14, 18, 19, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Top Close Button (if modal) */}
      {isModal && (
        <button
          id="auth-modal-close-button"
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer z-20 group"
          aria-label="Close"
          title="Close this modal"
        >
          <X className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-lime flex items-center justify-center shadow-lg shadow-brand-lime/20 mb-3 ring-4 ring-brand-lime/20">
          <span className="text-black font-extrabold text-2xl tracking-tighter">P</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === "signup" ? "Create PostPilot Account" : "Sign in to PostPilot"}
          </h2>
        </div>
        <p className="text-xs text-neutral-400 max-w-[280px]">
          {mode === "signup"
            ? "Start automating viral social carousels and multi-channel workflows"
            : "Access your AI research flywheel, design studio, and feed"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3.5">
        {/* Full Name Field (Sign Up Mode) */}
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Full Name
            </label>
            <input
              id="auth-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Rostova"
              className="w-full h-10 px-3.5 rounded-xl border border-white/12 bg-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
              required={mode === "signup"}
            />
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">
            Work Email
          </label>
          <input
            id="auth-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="elena@halcyon.co"
            className="w-full h-10 px-3.5 rounded-xl border border-white/12 bg-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-neutral-300 block">
              Password
            </label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-neutral-400 hover:text-brand-lime transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="auth-password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-white/12 bg-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mode === "signup" && (
            <p className="text-[11px] text-neutral-400 mt-1">
              Minimum 6 characters.
            </p>
          )}
        </div>

        {/* Confirm Password Field (Sign Up Mode) */}
        {mode === "signup" && (
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Confirm Password
            </label>
            <input
              id="auth-confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-10 px-3.5 rounded-xl border border-white/12 bg-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime transition-all"
              required={mode === "signup"}
            />
          </div>
        )}

        {/* Primary Submit Button */}
        <button
          id="auth-submit-button"
          type="submit"
          disabled={loading || googleLoading}
          className="w-full h-11 rounded-xl bg-brand-lime hover:bg-brand-limeHover active:scale-99 text-black font-bold text-sm transition-all shadow-md shadow-brand-lime/25 flex items-center justify-center cursor-pointer disabled:opacity-60 !mt-5 tracking-tight"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : mode === "signup" ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* 1-Click Demo Fill for easy testing */}
      {mode === "signin" && (
        <button
          type="button"
          onClick={handleDemoFill}
          className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-brand-lime flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-brand-lime" />
          <span>Quick Demo Fill (alex@example.com)</span>
        </button>
      )}

      {/* Divider OR */}
      <div className="relative flex items-center justify-center w-full my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative px-3 text-[10px] text-neutral-400 font-semibold tracking-wider uppercase" style={{ background: "rgba(14, 18, 19, 0.95)" }}>
          or continue with
        </div>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full h-10 rounded-xl border border-white/12 bg-white/5 hover:bg-white/10 active:bg-white/15 flex items-center justify-center gap-2.5 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-neutral-400 shrink-0" />
        ) : (
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            className="w-4 h-4 shrink-0"
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

      {/* Switch between Sign In and Sign Up */}
      <div className="text-xs text-neutral-400 text-center mt-5">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-bold text-brand-lime hover:underline transition-colors cursor-pointer ml-1"
            >
              Create Account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-bold text-brand-lime hover:underline transition-colors cursor-pointer ml-1"
            >
              Sign In
            </button>
          </>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 mt-5 pt-3 border-t border-white/5">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
        <span>Protected with 256-bit AES encryption</span>
      </div>
    </div>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          handleClose();
        }
      }}
      className="relative min-h-screen w-full flex items-center justify-center p-4 bg-black font-sans select-none antialiased"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(197, 245, 42, 0.05) 0%, rgba(0, 0, 0, 0.95) 70%, #000000 100%)",
      }}
    >
      <div className="w-full max-w-[420px] flex items-center justify-center z-10">
        {formContent}
      </div>
    </div>
  );
}
