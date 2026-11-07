"use client";

import React, { useState } from "react";
import { X, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: string;
}

export function TrialModal({ isOpen, onClose, selectedPlan = "Pro" }: TrialModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                7-Day Free Trial
              </span>
              <span className="text-xs text-muted-foreground">Selected: <strong>{selectedPlan} Plan</strong></span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Start your free trial
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Automate social media in 10 minutes a day. No credit card required to get started. Cancel anytime.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="mt-6 flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                />
              </div>

              <div className="space-y-2 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Instant access to AI Brand Voice & Content Ideas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Multi-platform scheduling for X, LinkedIn, Threads, Instagram</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Full analytics and automated carousel generator</span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                Create Account &amp; Start Trial
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[11px] text-muted-foreground">
                By continuing, you agree to reerts's Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Welcome to reerts!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We've set up your 7-day free trial on the <strong>{selectedPlan}</strong> tier. An activation email has been sent to <strong>{email}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
