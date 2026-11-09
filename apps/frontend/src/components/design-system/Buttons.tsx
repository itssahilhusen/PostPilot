"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "outline" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      size = "sm",
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: "py-1 px-2.5 text-[10px] rounded-lg",
      sm: "py-1.5 px-3 text-[11px] rounded-xl",
      md: "py-2 px-4 text-xs rounded-xl",
      lg: "py-2.5 px-5 text-sm rounded-xl",
    }[size];

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-bold bg-[#C5F52A] text-black hover:bg-[#b1de22] transition-all select-none cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses,
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-1.5" />
        )}
        {!isLoading && icon && iconPosition === "left" && (
          <span className="shrink-0 mr-1.5">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === "right" && (
          <span className="shrink-0 ml-1.5">{icon}</span>
        )}
      </button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryGlassButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      size = "sm",
      icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: "py-1 px-2.5 text-[10px] rounded-lg",
      sm: "py-1.5 px-3 text-[11px] rounded-xl",
      md: "py-2 px-4 text-xs rounded-xl",
      lg: "py-2.5 px-5 text-sm rounded-xl",
    }[size];

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
          ...style,
        }}
        className={cn(
          "inline-flex items-center justify-center font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors select-none cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
          sizeClasses,
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
        )}
        {!isLoading && icon && iconPosition === "left" && (
          <span className="shrink-0 mr-1.5">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === "right" && (
          <span className="shrink-0 ml-1.5">{icon}</span>
        )}
      </button>
    );
  }
);
SecondaryGlassButton.displayName = "SecondaryGlassButton";

export const SecondaryButton = SecondaryGlassButton;

export interface FilterPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  ({ className, children, active = false, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        style={
          active
            ? undefined
            : {
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
                ...style,
              }
        }
        className={cn(
          "px-3 py-1 rounded-full text-[11px] shrink-0 transition-colors cursor-pointer select-none whitespace-nowrap",
          active
            ? "font-semibold bg-brand-lime text-black shadow-sm hover:bg-brand-limeHover"
            : "font-medium text-white/90 hover:text-white hover:bg-white/10",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
FilterPill.displayName = "FilterPill";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "ghost" | "surface" | "primary" | "danger";
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, size = "sm", variant = "ghost", active, disabled, ...props }, ref) => {
    const sizeClasses = {
      xs: "w-7 h-7 text-xs rounded-lg",
      sm: "w-8 h-8 text-xs rounded-xl",
      md: "w-9 h-9 text-sm rounded-xl",
      lg: "w-10 h-10 text-base rounded-xl",
    }[size];

    const variantClasses = {
      ghost: cn(
        "text-neutral-400 hover:text-white hover:bg-white/10",
        active && "bg-white/10 text-white ring-1 ring-[#C5F52A]/40"
      ),
      surface: cn(
        "bg-white/[0.08] text-white border border-white/15 hover:bg-white/15",
        active && "border-[#C5F52A] text-[#C5F52A]"
      ),
      primary: "bg-[#C5F52A] text-black hover:bg-[#B4E320]",
      danger: "text-red-500 hover:bg-red-500/10 hover:text-red-400",
    }[variant];

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed",
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";

export interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ className, children, active = false, count, icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 rounded-full text-xs font-semibold transition-all duration-150 select-none cursor-pointer whitespace-nowrap border",
          active
            ? "bg-[#C5F52A]/15 text-[#C5F52A] border-[#C5F52A]/40 font-bold shadow-xs"
            : "bg-white/[0.08] text-neutral-400 border-white/15 hover:text-white hover:bg-white/10",
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0 text-current">{icon}</span>}
        <span>{children}</span>
        {typeof count === "number" && (
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
              active ? "bg-[#C5F52A] text-black" : "bg-white/10 text-neutral-400"
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);
FilterButton.displayName = "FilterButton";
