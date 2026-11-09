"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const queryTheme = params.get("theme");
        const stored = queryTheme || localStorage.getItem("reerts-theme") || localStorage.getItem("swipera-theme");
        if (stored === "light") {
          setTheme("light");
          document.documentElement.classList.remove("dark");
        } else {
          setTheme("dark");
          document.documentElement.classList.add("dark");
        }
      }
    } catch {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reerts-theme", nextTheme);
        localStorage.setItem("swipera-theme", nextTheme);
      } catch { }

      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reerts-theme", newTheme);
        localStorage.setItem("swipera-theme", newTheme);
      } catch { }

      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme: setSpecificTheme,
    mounted,
  };
}

