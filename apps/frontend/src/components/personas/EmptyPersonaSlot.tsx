"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyPersonaSlotProps {
  personaNumber: number;
  onAdd: () => void;
  className?: string;
}

export function EmptyPersonaSlot({ personaNumber, onAdd, className }: EmptyPersonaSlotProps) {
  const slotLetter = personaNumber === 0 ? "A" : "B";

  return (
    <button
      type="button"
      onClick={onAdd}
      data-testid={`persona-empty-slot-${personaNumber}`}
      className={cn(
        "flex min-h-[380px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200 border-muted-foreground/30 cursor-pointer hover:border-primary hover:bg-muted/20 active:scale-[0.99] p-6 text-center select-none",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-200 group-hover:scale-110">
        <Plus className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-1">
        <span className="text-sm font-semibold text-foreground block">
          Add Brand Voice {slotLetter}
        </span>
        <span className="max-w-[340px] text-xs text-muted-foreground leading-relaxed block">
          Set up 2 brand voices and A/B test your posts to find the one that performs best.
        </span>
      </div>
    </button>
  );
}
