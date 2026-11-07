"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Route,
  Wand2,
  LayoutGrid,
  Scissors,
  Film,
  Bot,
  Calendar,
  MessageCircle,
  BarChart3,
  Send,
  Eye,
  Rss,
  Users,
  Info,
  ChevronDown,
} from "lucide-react";
import { ReertsLogo } from "@/components/ReertsLogo";
import { competitors, comparisonRows, ComparisonCell } from "@/data/comparisonData";

const iconMap: Record<string, React.ReactNode> = {
  route: <Route className="hidden size-4 shrink-0 sm:block" />,
  wand: <Wand2 className="hidden size-4 shrink-0 sm:block" />,
  "carousel-horizontal": <LayoutGrid className="hidden size-4 shrink-0 sm:block" />,
  scissors: <Scissors className="hidden size-4 shrink-0 sm:block" />,
  movie: <Film className="hidden size-4 shrink-0 sm:block" />,
  robot: <Bot className="hidden size-4 shrink-0 sm:block" />,
  calendar: <Calendar className="hidden size-4 shrink-0 sm:block" />,
  "message-circle": <MessageCircle className="hidden size-4 shrink-0 sm:block" />,
  "chart-bar": <BarChart3 className="hidden size-4 shrink-0 sm:block" />,
  spy: <Eye className="hidden size-4 shrink-0 sm:block" />,
  rss: <Rss className="hidden size-4 shrink-0 sm:block" />,
  users: <Users className="hidden size-4 shrink-0 sm:block" />,
};

function StatusIcon({ cell }: { cell?: ComparisonCell }) {
  if (!cell) {
    return (
      <svg
        className="size-6 text-muted-foreground/50 mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m10 10 4 4m0-4-4 4" />
      </svg>
    );
  }

  if (cell.status === "Coming soon") {
    return (
      <span className="inline-flex max-w-full items-center justify-center align-middle">
        <span className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary text-primary-foreground max-w-full px-1.5 py-0.5 text-center text-[10px] leading-tight font-medium whitespace-normal sm:text-xs">
          Coming soon
        </span>
      </span>
    );
  }

  if (cell.status === "Supported") {
    return (
      <svg
        className="size-6 text-foreground mx-auto"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
      </svg>
    );
  }

  if (cell.status === "Partial") {
    return (
      <svg
        className="size-6 text-muted-foreground mx-auto"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    );
  }

  // Outside scope
  return (
    <svg
      className="size-6 text-muted-foreground mx-auto"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m10 10 4 4m0-4-4 4" />
    </svg>
  );
}

export function Comparison() {
  const [selectedCompetitor, setSelectedCompetitor] = useState("buffer");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <section
      id="comparison"
      aria-labelledby="comparison-title"
      className="border-t border-border bg-muted/20 px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <ReertsLogo iconClassName="size-8 sm:size-9 object-contain" />
          </div>
          <h2
            id="comparison-title"
            className="text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl"
          >
            See why reerts is the best choice.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
            Compare content creation, scheduling, engagement, automation, and
            analytics—all in one view.
          </p>
        </div>

        {/* Mobile View: Select Dropdown */}
        <div className="mb-4 flex w-full items-center justify-between gap-3 lg:hidden">
          <label id="comparison-select-label" className="text-sm font-medium">
            Compare with
          </label>
          <div className="relative">
            <select
              value={selectedCompetitor}
              onChange={(e) => setSelectedCompetitor(e.target.value)}
              className="appearance-none rounded-md border border-input bg-card px-3 py-2 text-sm font-medium text-foreground outline-none shadow-xs w-44 pr-8 focus-visible:ring-1 focus-visible:ring-ring"
              aria-labelledby="comparison-select-label"
            >
              {competitors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground opacity-50" />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-lg border border-foreground/20 bg-card">
          <div className="relative w-full overflow-x-auto">
            <table
              className="w-full caption-bottom text-sm table-fixed"
              aria-labelledby="comparison-title"
            >
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors border-foreground/20 hover:bg-transparent">
                  {/* Features Column Head */}
                  <th
                    className="text-foreground h-10 text-left align-middle w-[44%] px-3 py-5 text-sm font-medium whitespace-normal lg:w-[28%] lg:px-4"
                    scope="col"
                  >
                    Features
                  </th>

                  {/* reerts Column Head */}
                  <th
                    className="text-foreground h-10 align-middle font-medium border-l border-foreground/15 text-center whitespace-normal bg-muted/60 table-cell px-1.5 py-5"
                    scope="col"
                  >
                    <div className="flex items-center flex-col justify-center gap-1.5">
                      <ReertsLogo iconClassName="size-6 sm:size-7 object-contain" />
                    </div>
                  </th>

                  {/* Competitor Column Heads */}
                  {competitors.map((c) => {
                    const isSelected = c.id === selectedCompetitor;
                    return (
                      <th
                        key={c.id}
                        className={`text-foreground h-10 align-middle font-medium border-l border-foreground/15 text-center whitespace-normal bg-card px-1.5 py-5 ${
                          isSelected ? "table-cell" : "hidden lg:table-cell"
                        }`}
                        scope="col"
                      >
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${c.name} official features`}
                          className="inline-flex flex-col items-center justify-center gap-1.5 rounded-sm text-xs font-bold tracking-tight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring xl:text-sm"
                        >
                          <Image
                            src={c.logo}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 shrink-0 object-contain dark:brightness-0 dark:invert"
                          />
                          <span>{c.name}</span>
                        </a>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="[&_tr:last-child]:border-0">
                {comparisonRows.map((row, rIdx) => {
                  const reertsCell = row.values.reerts;
                  return (
                    <tr
                      key={rIdx}
                      className="border-b transition-colors border-foreground/10 hover:bg-muted/30"
                    >
                      {/* Feature Name Cell */}
                      <th
                        className="text-foreground text-left align-middle h-auto px-3 py-2 text-xs font-medium whitespace-normal sm:text-sm lg:px-4"
                        scope="row"
                      >
                        <div
                          className="group relative flex min-h-8 w-full items-center gap-2 rounded-sm text-left cursor-help"
                          onClick={() =>
                            setActiveTooltip(
                              activeTooltip === `feat_${rIdx}`
                                ? null
                                : `feat_${rIdx}`
                            )
                          }
                          title={reertsCell?.note}
                        >
                          {iconMap[row.icon] || (
                            <Wand2 className="hidden size-4 shrink-0 sm:block" />
                          )}
                          <span className="min-w-0 leading-snug break-words">
                            {row.feature}
                          </span>
                          <Info className="size-3.5 shrink-0 text-muted-foreground group-hover:text-foreground opacity-70" />
                        </div>
                      </th>

                      {/* reerts Cell */}
                      <td
                        className="p-2 align-middle border-l border-foreground/15 text-center whitespace-normal bg-muted/60 table-cell px-1.5 py-2.5 relative group cursor-help"
                        title={reertsCell?.note}
                        onClick={() =>
                          setActiveTooltip(
                            activeTooltip === `reerts_${rIdx}`
                              ? null
                              : `reerts_${rIdx}`
                          )
                        }
                      >
                        <StatusIcon cell={reertsCell} />
                      </td>

                      {/* Competitor Cells */}
                      {competitors.map((c) => {
                        const cell = row.values[c.id];
                        const isSelected = c.id === selectedCompetitor;
                        return (
                          <td
                            key={c.id}
                            className={`p-2 align-middle border-l border-foreground/15 text-center whitespace-normal bg-card px-1.5 py-2.5 relative group cursor-help ${
                              isSelected ? "table-cell" : "hidden lg:table-cell"
                            }`}
                            title={cell?.note || cell?.status}
                            onClick={() =>
                              setActiveTooltip(
                                activeTooltip === `${c.id}_${rIdx}`
                                  ? null
                                  : `${c.id}_${rIdx}`
                              )
                            }
                          >
                            <StatusIcon cell={cell} />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
