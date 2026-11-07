import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "tone-yellow" | "tone-green" | "tone-blue";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80",
    outline: "text-foreground border-border",
    "tone-yellow": "bg-tone-yellow text-foreground border-tone-yellow-border",
    "tone-green": "bg-tone-green text-foreground border-tone-green-border",
    "tone-blue": "bg-tone-blue text-foreground border-tone-blue-border",
  };

  return (
    <div
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 transition-colors",
        variants[variant || "default"],
        className
      )}
      {...props}
    />
  );
}

