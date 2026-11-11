"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PostPilotLogo } from "@/components/design-system/PostPilotLogo";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SHOWCASE_IMAGES = [
  {
    src: "/auth-artwork-signin.jpg",
    alt: "Stylized lime green portrait illustration",
  },
  {
    src: "/auth-artwork-amber.png",
    alt: "Obsidian Amber luxury editorial artwork",
  },
  {
    src: "/auth-artwork-crimson.png",
    alt: "Obsidian Crimson viral showcase artwork",
  },
];

export function SignUpView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to callbackUrl or default to /feed
  const rawCallback = searchParams?.get("callbackUrl");
  const callbackUrl =
    !rawCallback ||
    rawCallback.includes("/studio") ||
    rawCallback.includes("/conversations") ||
    rawCallback.includes("/pipelines")
      ? "/feed"
      : rawCallback;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Carousel state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = SHOWCASE_IMAGES[currentSlideIndex];

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === 0 ? SHOWCASE_IMAGES.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) =>
      prev === SHOWCASE_IMAGES.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signUpSchema.safeParse({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Invalid input";
      toast.error(firstError);
      return;
    }

    setLoading(true);

    try {
      // 1. Create account via registration API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: validation.data.email,
          password: validation.data.password,
          name: validation.data.email.split("@")[0],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! Signing you in...");

      // 2. Automatically sign in with credentials
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: validation.data.email,
        password: validation.data.password,
        callbackUrl,
      });

      if (signInRes?.error) {
        toast.error("Account created. Please sign in with your credentials.");
        router.push("/login");
        return;
      }

      if (typeof window !== "undefined") {
        window.location.href = callbackUrl;
      } else {
        router.push(callbackUrl);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Google authentication failed. Please try credentials.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0c1011] flex items-center justify-center">
      <main
        className={`${plusJakartaSans.className} w-full max-w-[1440px] h-screen max-h-[1024px] bg-[#0c1011] overflow-hidden flex flex-col lg:flex-row relative select-none font-sans text-white m-0 p-0`}
        data-purpose="split-auth-container"
      >
        {/* ========================================================= */}
        {/* Left Authentication Column                                */}
        {/* ========================================================= */}
        <section
          className="w-full lg:w-1/2 h-full min-h-screen lg:min-h-0 p-8 sm:p-10 lg:p-14 flex flex-col justify-between relative z-10 overflow-y-auto"
          data-purpose="auth-pane"
        >
          {/* Center Auth Content Box */}
          <div className="w-full max-w-[380px] mx-auto flex-1 flex flex-col justify-center py-4">
            {/* App/Brand Icon: PostPilot Green Box with Black Double-PP */}
            <div className="flex justify-center mb-6">
              <PostPilotLogo variant="badge" size={44} className="shadow-lg" />
            </div>

            {/* Headings */}
            <div className="text-center mb-7">
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white mb-2">
                Unlock everything with Pro
              </h1>
              <p className="text-neutral-400 text-sm font-normal leading-relaxed">
                The best stock photos and royalty free images.
              </p>
            </div>

            {/* Third-party Auth Options */}
            <div className="space-y-3 mb-6" data-purpose="social-auth-buttons">
              {/* Sign up with Google */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="w-full h-11 px-4 bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.10] border border-white/[0.12] hover:border-white/20 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Section Divider */}
            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-4 text-xs tracking-wider text-neutral-500 uppercase font-medium">
                or
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Credentials Form */}
            <form
              onSubmit={handleSubmit}
              action="javascript:void(0)"
              className="space-y-4"
              data-purpose="registration-form"
            >
              <div>
                <label
                  className="block text-xs font-semibold text-neutral-300 mb-1.5 ml-0.5"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#151b1d] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#c5f52a] focus:ring-1 focus:ring-[#c5f52a] transition duration-150"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-neutral-300 mb-1.5 ml-0.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#151b1d] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#c5f52a] focus:ring-1 focus:ring-[#c5f52a] transition duration-150"
                />
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-11 mt-2 bg-[#c5f52a] hover:bg-[#d6ff47] text-black font-bold text-sm tracking-tight rounded-xl shadow-[0_4px_20px_-2px_rgba(197,245,42,0.35)] hover:shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  "Create account"
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-neutral-400">
                  Already have an account?{" "}
                </span>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#c5f52a] hover:underline underline-offset-4 ml-0.5"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>

          {/* Terms & Disclaimer */}
          <footer className="pt-6 text-center" data-purpose="terms-footer">
            <p className="text-xs text-neutral-500">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-neutral-400 underline hover:text-neutral-200 transition-colors"
              >
                terms of use
              </Link>
              .
            </p>
          </footer>
        </section>

        {/* ========================================================= */}
        {/* Right Showcase Panel (Artwork Card)                       */}
        {/* ========================================================= */}
        <section
          className="hidden lg:flex w-full lg:w-1/2 h-full p-4 lg:p-5 items-stretch relative select-none"
          data-purpose="showcase-visual"
        >
          {/* Hidden SVG ClipPath Definition matching Stitch exactly */}
          <svg
            aria-hidden="true"
            className="absolute w-0 h-0 overflow-hidden"
            focusable="false"
          >
            <defs>
              <clipPath
                id="showcase-cutout-clip"
                clipPathUnits="objectBoundingBox"
              >
                <path d="M 0,0.18 C 0,0.12 0.05,0.11 0.09,0.11 C 0.12,0.11 0.14,0.08 0.14,0.05 C 0.14,0.02 0.16,0 0.22,0 L 0.92,0 C 0.98,0 1,0.025 1,0.07 L 1,0.82 C 1,0.88 0.95,0.89 0.91,0.89 C 0.88,0.89 0.86,0.92 0.86,0.95 C 0.86,0.98 0.84,1 0.78,1 L 0.08,1 C 0.02,1 0,0.975 0,0.93 Z" />
              </clipPath>
            </defs>
          </svg>

          {/* Relative Wrapper for Cutout & Floating Buttons */}
          <div className="relative w-full h-full flex items-stretch">
            {/* Clipped Container */}
            <div
              className="showcase-clip-wrapper relative w-full h-full overflow-hidden bg-[#0c1011] flex flex-col justify-end p-6 sm:p-8 shadow-2xl border-0 ring-0 outline-none"
              style={{
                clipPath: 'url("#showcase-cutout-clip")',
                WebkitClipPath: 'url("#showcase-cutout-clip")',
              }}
            >
              {/* Background Image */}
              <Image
                src={currentSlide.src}
                alt={currentSlide.alt}
                fill
                priority
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>

            {/* Top-Left Light Circular Navigation Button (Back) */}
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Previous image"
              className="absolute top-2 left-2 w-[60px] h-[60px] rounded-full flex items-center justify-center z-30 transition-all duration-200 hover:scale-105 active:scale-95 bg-white/[0.08] backdrop-blur-md text-white shadow-lg hover:bg-white/[0.16] hover:border-white/25 border border-white/[0.14] cursor-pointer"
            >
              <svg
                className="w-6 h-6 -translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Bottom-Right Light Circular Navigation Button (Next) */}
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Next image"
              className="absolute bottom-2 right-2 w-[60px] h-[60px] rounded-full flex items-center justify-center z-30 transition-all duration-200 hover:scale-105 active:scale-95 bg-white/[0.08] backdrop-blur-md text-white shadow-lg hover:bg-white/[0.16] hover:border-white/25 border border-white/[0.14] cursor-pointer"
            >
              <svg
                className="w-6 h-6 translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SignUpView;

