"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AnimatedHeadlineProps {
  className?: string;
}

const cubicEase = [0.16, 1, 0.3, 1] as const;

export function AnimatedHeadline({ className = "" }: AnimatedHeadlineProps) {
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30,
      rotateX: 18,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.85,
        ease: cubicEase,
      },
    },
  };

  const underlineVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.95, delay: 0.6, ease: cubicEase },
        opacity: { duration: 0.3, delay: 0.55 },
      },
    },
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Screen Reader Full Semantic Title */}
      <h1 className="sr-only">
        Automate social media in 10 minutes a day. Social media marketing automation tool for founders and agencies.
      </h1>

      <motion.div
        className="w-full text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal font-editorial italic tracking-[-0.02em] leading-[1.12] text-balance select-none text-foreground"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Line 1: Automate social media */}
        <div className="flex flex-wrap items-baseline justify-center gap-x-3.5 sm:gap-x-5">
          {/* Automate */}
          <motion.span
            variants={wordVariants}
            className="inline-block cursor-default transition-transform hover:scale-[1.02]"
          >
            Automate
          </motion.span>

          {/* social media */}
          <motion.span
            variants={wordVariants}
            className="relative inline-block cursor-default group"
          >
            <span className="relative z-10 transition-transform inline-block group-hover:scale-[1.02]">
              social media
            </span>

            {/* Animated Calligraphic Flourish Underline */}
            <svg
              className="absolute -bottom-1.5 sm:-bottom-2.5 left-0 w-full h-3 sm:h-4 text-primary/75 dark:text-primary-foreground/75 pointer-events-none overflow-visible"
              viewBox="0 0 240 16"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 4 12 C 55 4, 160 3, 236 10 C 180 14, 90 14, 20 13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                variants={underlineVariants}
              />
            </svg>
          </motion.span>
        </div>

        {/* Line 2: in 10 minutes a day. */}
        <div className="flex flex-wrap items-baseline justify-center gap-x-3 sm:gap-x-4 mt-1 sm:mt-2">
          {/* in */}
          <motion.span
            variants={wordVariants}
            className="inline-block cursor-default transition-transform hover:scale-[1.02]"
          >
            in
          </motion.span>

          {/* 10 minutes a day. */}
          <motion.span
            variants={wordVariants}
            className="relative inline-flex items-baseline cursor-default group"
          >
            <span className="relative z-10 transition-transform inline-block group-hover:scale-[1.02]">
              10 minutes a day.
            </span>

            {/* Sparkle micro-badge accent */}
            <motion.span
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.75, type: "spring", stiffness: 300, damping: 20 }}
              className="inline-block ml-2 sm:ml-3 self-center text-amber-500 dark:text-amber-400"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-current animate-pulse" />
            </motion.span>
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
