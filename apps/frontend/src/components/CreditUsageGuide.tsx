"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  Wand2, 
  Send, 
  Crop, 
  Image as ImageIcon, 
  Video, 
  Link as LinkIcon, 
  FileText, 
  Upload, 
  ScanText, 
  RefreshCw, 
  Repeat, 
  Sparkles, 
  Share2, 
  BarChart3, 
  Scissors, 
  Mic, 
  Film, 
  Layers, 
  LayoutTemplate, 
  Type, 
  MousePointerClick 
} from "lucide-react";

interface CreditUsageGuideProps {
  isOpen?: boolean;
  onToggle?: () => void;
  hideTrigger?: boolean;
}

export function CreditUsageGuide({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  hideTrigger = false,
}: CreditUsageGuideProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const toggle = isControlled
    ? controlledOnToggle
    : () => setInternalIsOpen(!internalIsOpen);

  const rows = [
    {
      feature: "AI Editor",
      cost: "2",
      description: "AI writing helpers in the editor — polish, translate, hook adjustments, and more.",
      icon: <Wand2 className="h-4 w-4 shrink-0 text-primary" />,
    },
    {
      feature: "Carousel post text",
      cost: "Free",
      isFree: true,
      description: "When you create a post from a carousel, AI writes each account's text in the brand voice you chose.",
      icon: <Send className="h-4 w-4 shrink-0 text-emerald-500" />,
    },
    {
      feature: "Carousel copy in another ratio",
      cost: "5",
      description: "Create a new carousel with the same text, images, and design, laid out again for another aspect ratio (1:1, 4:5, 9:16). No AI generation is involved.",
      icon: <Crop className="h-4 w-4 shrink-0 text-blue-500" />,
    },
    {
      feature: "Carousel AI image generation",
      cost: "3+",
      description: "AI creates an image that fits each slide. Charged per image. Only images actually created are charged when saved. (+3 per additional item)",
      icon: <ImageIcon className="h-4 w-4 shrink-0 text-purple-500" />,
    },
    {
      feature: "Carousel video slide composition",
      cost: "5",
      description: "Composes a video placed in an image slot over the slide design into one mp4. Charged per slide; an unchanged slide is not charged again.",
      icon: <Video className="h-4 w-4 shrink-0 text-rose-500" />,
    },
    {
      feature: "Carousel generation",
      cost: "20",
      description: "AI plans and creates a full carousel from a link, your posts, a file, text, or a topic. Rendering the images is free.",
      icon: <Layers className="h-4 w-4 shrink-0 text-primary" />,
    },
    {
      feature: "Carousel template extraction",
      cost: "5+",
      description: "Extract the design of selected slide images into an editable template. Charged per slide, including video slides; reviewing and saving use no credits. (+5 per additional item)",
      icon: <LayoutTemplate className="h-4 w-4 shrink-0 text-amber-500" />,
    },
    {
      feature: "Carousel slide regeneration",
      cost: "5",
      description: "AI rewrites one selected slide, keeping its layout and visual hierarchy.",
      icon: <RefreshCw className="h-4 w-4 shrink-0 text-cyan-500" />,
    },
    {
      feature: "Carousel text regeneration",
      cost: "2+",
      description: "Regenerate and save the wording of the slides you choose. Charged per slide; viewing, reviewing, and applying the result are free. (+2 per additional item)",
      icon: <Type className="h-4 w-4 shrink-0 text-indigo-500" />,
    },
    {
      feature: "Carousel AI edit",
      cost: "2",
      description: "AI edits the element you selected in the editor as instructed. Nothing is charged if it finds nothing to change.",
      icon: <Wand2 className="h-4 w-4 shrink-0 text-purple-500" />,
    },
    {
      feature: "Carousel CTA AI generation",
      cost: "5",
      description: "Describe the CTA you want in the CTAs tab and AI creates and saves one CTA slide with its text and design.",
      icon: <MousePointerClick className="h-4 w-4 shrink-0 text-emerald-500" />,
    },
    {
      feature: "Draft Generation (URL → draft)",
      cost: "10",
      description: "AI extracts content from a URL and writes the first draft in your signature brand voice.",
      icon: <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" />,
    },
    {
      feature: "Draft Generation (Text → draft)",
      cost: "5",
      description: "AI writes a post draft from text, rough notes, or ideas you paste directly.",
      icon: <FileText className="h-4 w-4 shrink-0 text-amber-500" />,
    },
    {
      feature: "Draft Generation (File → draft)",
      cost: "15+",
      description: "AI writes a draft directly from an uploaded PDF, Word doc, or slide deck. (+10 per additional item)",
      icon: <Upload className="h-4 w-4 shrink-0 text-rose-500" />,
    },
    {
      feature: "Image Text Reading (URL → draft)",
      cost: "5",
      description: "AI transcribes the text in each image of a linked post and adds it to the draft source. Charged only when at least one image has text.",
      icon: <ScanText className="h-4 w-4 shrink-0 text-teal-500" />,
    },
    {
      feature: "Draft Regeneration",
      cost: "5",
      description: "Regenerates the draft as an entirely new variation with a fresh angle.",
      icon: <RefreshCw className="h-4 w-4 shrink-0 text-primary" />,
    },
    {
      feature: "Repurpose Post",
      cost: "5",
      description: "Rewrite a published post in another brand voice or tone persona.",
      icon: <Repeat className="h-4 w-4 shrink-0 text-purple-500" />,
    },
    {
      feature: "Best Content Remix",
      cost: "10",
      description: "Generate a new draft by analyzing up to 5 of your existing top-performing posts.",
      icon: <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />,
    },
    {
      feature: "Multi-channel posts (link source)",
      cost: "5",
      description: "Reading the link when you write posts for several channels. Charged once however many channels you pick.",
      icon: <Share2 className="h-4 w-4 shrink-0 text-blue-500" />,
    },
    {
      feature: "AI Image Generation",
      cost: "10",
      description: "Generate a thumbnail image or post graphic that matches the content using AI.",
      icon: <ImageIcon className="h-4 w-4 shrink-0 text-rose-500" />,
    },
    {
      feature: "AI Analytics Report",
      cost: "10",
      description: "Generate AI summary, reach insights, and next-week action plan based on post performance data.",
      icon: <BarChart3 className="h-4 w-4 shrink-0 text-emerald-500" />,
    },
    {
      feature: "Source video analysis",
      cost: "Base 10 + 1/min",
      description: "Transcribe a long-form video and find highlight candidates. Minimum 1 minute, rounded up.",
      icon: <Video className="h-4 w-4 shrink-0 text-purple-500" />,
    },
    {
      feature: "Clip render",
      cost: "5+",
      description: "Render one selected clip as a 9:16 vertical video (10 for videos over 90s).",
      icon: <Scissors className="h-4 w-4 shrink-0 text-cyan-500" />,
    },
    {
      feature: "Scene narration",
      cost: "5",
      description: "Synthesize the script into an ultra-natural AI voice narration.",
      icon: <Mic className="h-4 w-4 shrink-0 text-teal-500" />,
    },
    {
      feature: "Scene render",
      cost: "5",
      description: "Render the scene images, captions, and narration into one polished 9:16 video.",
      icon: <Film className="h-4 w-4 shrink-0 text-rose-500" />,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Accordion Trigger Button (hidden if controlled externally) */}
      {!hideTrigger && (
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground transition-all dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
          aria-expanded={isOpen}
        >
          <span>Credit Usage Guide</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180 text-foreground" : ""
            }`}
          />
        </button>
      )}

      {/* Collapsible Table Section */}
      {isOpen && (
        <section className="mt-8 w-full max-w-4xl px-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="mb-6 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Credit Usage Guide
          </h3>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/60 dark:bg-muted/30">
                    <th className="h-10 px-4 py-2.5 font-semibold text-foreground">
                      Feature
                    </th>
                    <th className="h-10 px-4 py-2.5 font-semibold text-center text-foreground w-28">
                      Credit usage
                    </th>
                    <th className="h-10 px-4 py-2.5 font-semibold text-foreground hidden md:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-3.5 pl-4 align-top md:align-middle">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          {row.icon}
                          <span>{row.feature}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground md:hidden leading-relaxed">
                          {row.description}
                        </div>
                      </td>
                      <td className="p-3.5 text-center align-top md:align-middle whitespace-nowrap">
                        {row.isFree ? (
                          <span className="inline-flex items-center justify-center rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                            Free
                          </span>
                        ) : (
                          <span className="font-bold text-foreground">
                            {row.cost}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground hidden md:table-cell align-middle leading-relaxed">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
