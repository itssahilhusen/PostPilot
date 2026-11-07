"use client";

import React from "react";
import { Check } from "lucide-react";
import { planCategories } from "@/data/comparePlansData";

export function ComparePlansTable() {
  const renderCellVal = (val: string) => {
    if (val === "included") {
      return (
        <span className="flex items-center justify-center">
          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
        </span>
      );
    }
    if (val === "-" || !val) {
      return <span className="text-muted-foreground/40 font-normal">-</span>;
    }
    return (
      <span className="font-medium text-foreground text-xs sm:text-sm">
        {val}
      </span>
    );
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-2 py-8 animate-in fade-in slide-in-from-top-2 duration-200">
      <h3 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Compare plans
      </h3>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60 dark:bg-muted/30">
                <th className="h-12 px-4 font-semibold text-foreground min-w-[180px] sm:min-w-[220px]">
                  Feature
                </th>
                <th className="h-12 px-4 font-semibold text-center text-foreground min-w-[110px] sm:min-w-[140px] border-l border-border/60">
                  Creator
                </th>
                <th className="h-12 px-4 font-semibold text-center text-primary min-w-[110px] sm:min-w-[140px] border-l border-border/60 bg-primary/5">
                  Pro
                </th>
                <th className="h-12 px-4 font-semibold text-center text-foreground min-w-[110px] sm:min-w-[140px] border-l border-border/60">
                  Team
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {planCategories.map((cat, cIdx) => (
                <React.Fragment key={cIdx}>
                  {/* Category Section Header Row */}
                  <tr className="border-b border-t border-border bg-muted/50 dark:bg-muted/20">
                    <td
                      className="p-3 px-4 text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider"
                      colSpan={4}
                    >
                      {cat.name}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.items.map((item, iIdx) => (
                    <tr
                      key={iIdx}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 px-4 text-xs sm:text-sm text-foreground/90 align-middle">
                        {item.feature}
                      </td>
                      <td className="p-3 text-center align-middle border-l border-border/50">
                        {renderCellVal(item.creator)}
                      </td>
                      <td className="p-3 text-center align-middle border-l border-border/50 bg-primary/5">
                        {renderCellVal(item.pro)}
                      </td>
                      <td className="p-3 text-center align-middle border-l border-border/50">
                        {renderCellVal(item.team)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
