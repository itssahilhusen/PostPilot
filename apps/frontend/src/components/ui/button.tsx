import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "tone-yellow"
    | "tone-green"
    | "tone-blue";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  asChild?: boolean;
}

export const buttonVariants = ({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) => {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 select-none cursor-pointer";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
    outline:
      "border border-border shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 bg-background text-foreground",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
    ghost:
      "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 text-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    "tone-yellow":
      "border border-border shadow-xs dark:border-input text-foreground bg-tone-yellow dark:bg-tone-yellow hover:bg-tone-yellow dark:hover:bg-tone-yellow hover:brightness-95 dark:hover:brightness-110",
    "tone-green":
      "border border-border shadow-xs dark:border-input text-foreground bg-tone-green dark:bg-tone-green hover:bg-tone-green dark:hover:bg-tone-green hover:brightness-95 dark:hover:brightness-110",
    "tone-blue":
      "border border-border shadow-xs dark:border-input text-foreground bg-tone-blue dark:bg-tone-blue hover:bg-tone-blue dark:hover:bg-tone-blue hover:brightness-95 dark:hover:brightness-110",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-9 px-4 py-2 has-[>svg]:px-3",
    sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5 text-sm",
    lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
    icon: "size-9 rounded-md",
    "icon-sm": "size-7 rounded-md -ml-1",
  };

  return cn(base, variants[variant || "default"], sizes[size || "default"], className);
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

