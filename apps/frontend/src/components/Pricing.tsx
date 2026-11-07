"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { ReertsLogo } from "@/components/ReertsLogo";
import { ComparePlansTable } from "./ComparePlansTable";
import { CreditUsageGuide } from "./CreditUsageGuide";

interface PricingProps {
  onOpenTrial: (planName?: string) => void;
}

export function Pricing({ onOpenTrial }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [showCompare, setShowCompare] = useState(false);
  const [showCreditGuide, setShowCreditGuide] = useState(false);

  return (
    <section
      id="pricing"
      className="border-t border-border px-4 py-20 bg-background"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="flex items-center gap-2">
              <ReertsLogo iconClassName="size-8 sm:size-9 object-contain" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pricing
            </h2>
          </div>

          {/* Toggle Group */}
          <div className="mt-8 flex justify-center">
            <div
              role="group"
              className="flex items-center rounded-md border border-input p-0.5 w-full max-w-md bg-card shadow-xs"
              aria-label="Billing cycle"
            >
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 flex-1 rounded-sm transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`inline-flex items-center justify-center gap-2 text-sm font-medium h-9 px-4 flex-1 rounded-sm transition-all ${
                  billingCycle === "yearly"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Yearly</span>
                <span className="inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-[10px] font-medium bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">
                  <span className="md:hidden">-30%</span>
                  <span className="hidden md:inline">Save 30%</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          {/* Card 1: Creator */}
          <div className="bg-card text-card-foreground flex flex-col justify-between rounded-xl border border-border p-6 shadow-sm">
            <div>
              <div className="grid gap-1.5 pb-6 border-b border-border/50">
                <h3 className="font-semibold text-2xl text-foreground">Creator</h3>
                <p className="text-muted-foreground text-sm">For creators & founders</p>
              </div>

              <div className="pt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${billingCycle === "yearly" ? 20 : 29}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {billingCycle === "yearly" ? (
                      <>
                        Billed <s className="font-bold">$348</s> $240 yearly
                      </>
                    ) : (
                      "Billed monthly"
                    )}
                  </p>
                  {billingCycle === "yearly" && (
                    <span className="inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-[10px] font-medium bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">
                      Save $108
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onOpenTrial("Creator")}
                className="mt-6 w-full inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-all shadow-xs"
              >
                Start 7-day free trial
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0" />
                <span>No credit card required</span>
                <span aria-hidden="true">·</span>
                <span>Cancel anytime</span>
              </div>

              <div className="mt-6 rounded-lg bg-primary/5 px-3 py-3 border border-primary/10">
                <p className="text-base font-semibold text-foreground">
                  ≈ 150 AI posts / month
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                  <span>
                    <strong className="font-medium text-foreground">1,500</strong> AI credits / month
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreditGuide(true)}
                    className="inline-flex items-center text-muted-foreground hover:text-foreground"
                    title="View AI credit usage guide"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </p>
              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Includes
              </p>
              <ul className="space-y-2.5 mt-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">3</strong> social accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">1</strong> user seat
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">1</strong> workspace
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">30</strong>GB media library
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">30</strong> content idea sources
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">3,000</strong> API & MCP calls / month
                  </span>
                </li>
              </ul>
            </div>

            <p className="mt-6 flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-4">
              <span>Social accounts and workspaces can be added at $5/mo each.</span>
            </p>
          </div>

          {/* Card 2: Pro (Most popular) */}
          <div className="bg-card text-card-foreground flex flex-col justify-between rounded-xl border-2 border-primary py-6 px-6 shadow-md relative md:scale-[1.02] xl:-translate-y-1">
            <span className="inline-flex items-center justify-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground absolute -top-3 right-6 shadow-sm">
              Most popular
            </span>

            <div>
              <div className="grid gap-1.5 pb-6 border-b border-border/50">
                <h3 className="font-semibold text-2xl text-foreground">Pro</h3>
                <p className="text-muted-foreground text-sm">For marketers & small teams</p>
              </div>

              <div className="pt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${billingCycle === "yearly" ? 55 : 79}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {billingCycle === "yearly" ? (
                      <>
                        Billed <s className="font-bold">$948</s> $660 yearly
                      </>
                    ) : (
                      "Billed monthly"
                    )}
                  </p>
                  {billingCycle === "yearly" && (
                    <span className="inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-[10px] font-medium bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">
                      Save $288
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onOpenTrial("Pro")}
                className="mt-6 w-full inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-all shadow-sm"
              >
                Start 7-day free trial
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0" />
                <span>No credit card required</span>
                <span aria-hidden="true">·</span>
                <span>Cancel anytime</span>
              </div>

              <div className="mt-6 rounded-lg bg-primary/10 px-3 py-3 border border-primary/20">
                <p className="text-base font-semibold text-foreground">
                  ≈ 500 AI posts / month
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                  <span>
                    <strong className="font-medium text-foreground">5,000</strong> AI credits / month
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreditGuide(true)}
                    className="inline-flex items-center text-muted-foreground hover:text-foreground"
                    title="View AI credit usage guide"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </p>
              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Includes
              </p>
              <ul className="space-y-2.5 mt-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">10</strong> social accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">3</strong> user seats
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">5</strong> workspaces
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">100</strong>GB media library
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">100</strong> content idea sources
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">7,500</strong> API & MCP calls / month
                  </span>
                </li>
              </ul>
            </div>

            <p className="mt-6 flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-4">
              <span>Social accounts, user seats, and workspaces can be added at $5/mo each.</span>
            </p>
          </div>

          {/* Card 3: Team */}
          <div className="bg-card text-card-foreground flex flex-col justify-between rounded-xl border border-border p-6 shadow-sm">
            <div>
              <div className="grid gap-1.5 pb-6 border-b border-border/50">
                <h3 className="font-semibold text-2xl text-foreground">Team</h3>
                <p className="text-muted-foreground text-sm">For teams & agencies</p>
              </div>

              <div className="pt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${billingCycle === "yearly" ? 104 : 149}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {billingCycle === "yearly" ? (
                      <>
                        Billed <s className="font-bold">$1,788</s> $1,248 yearly
                      </>
                    ) : (
                      "Billed monthly"
                    )}
                  </p>
                  {billingCycle === "yearly" && (
                    <span className="inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-[10px] font-medium bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100">
                      Save $540
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onOpenTrial("Team")}
                className="mt-6 w-full inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-all shadow-xs"
              >
                Start 7-day free trial
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 shrink-0" />
                <span>No credit card required</span>
                <span aria-hidden="true">·</span>
                <span>Cancel anytime</span>
              </div>

              <div className="mt-6 rounded-lg bg-primary/5 px-3 py-3 border border-primary/10">
                <p className="text-base font-semibold text-foreground">
                  ≈ 1,200 AI posts / month
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                  <span>
                    <strong className="font-medium text-foreground">12,000</strong> AI credits / month
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCreditGuide(true)}
                    className="inline-flex items-center text-muted-foreground hover:text-foreground"
                    title="View AI credit usage guide"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </p>
              </div>

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Includes
              </p>
              <ul className="space-y-2.5 mt-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">20</strong> social accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">5</strong> user seats
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">10</strong> workspaces
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">300</strong>GB media library
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">300</strong> content idea sources
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong className="font-semibold text-foreground">15,000</strong> API & MCP calls / month
                  </span>
                </li>
              </ul>
            </div>

            <p className="mt-6 flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/50 pt-4">
              <span>Social accounts, user seats, and workspaces can be added at $5/mo each.</span>
            </p>
          </div>

          {/* Card 4: Custom */}
          <div className="bg-card text-card-foreground flex flex-col justify-between rounded-xl border border-border p-6 shadow-sm">
            <div>
              <div className="grid gap-1.5 pb-6 border-b border-border/50">
                <h3 className="font-semibold text-2xl text-foreground">Custom</h3>
                <p className="text-muted-foreground text-sm">
                  For agencies & multi-brand teams with 20+ accounts
                </p>
              </div>

              <div className="pt-6">
                <p className="text-3xl font-bold text-foreground">Custom quote</p>
              </div>

              <a
                href="/support"
                className="mt-6 w-full inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 transition-all shadow-xs"
              >
                Contact us
              </a>

              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Includes
              </p>
              <ul className="mt-2.5 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>20+ social accounts, as many as you need</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Custom user seats & workspaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Custom AI credit volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Monthly or annual contracts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buttons to toggle Compare plans and Credit Usage Guide */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowCompare(!showCompare)}
            className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md px-6 shadow-xs"
            aria-expanded={showCompare}
          >
            Compare plans
            <ChevronDown
              className={`size-4 transition-transform ${showCompare ? "rotate-180" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowCreditGuide(!showCreditGuide)}
            className="inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium transition-all border border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-10 rounded-md px-6 text-foreground"
            aria-expanded={showCreditGuide}
          >
            Credit Usage Guide
            <ChevronDown
              className={`size-4 transition-transform ${showCreditGuide ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Collapsible Tables */}
        {showCompare && <ComparePlansTable />}
        {showCreditGuide && (
          <CreditUsageGuide isOpen={true} hideTrigger={true} />
        )}
      </div>
    </section>
  );
}
