"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="tap-target flex h-11 w-11 items-center justify-center rounded-full bg-surfaceAlt text-lg text-ink transition hover:brightness-95 dark:bg-surfaceAltDark dark:text-paper"
    >
      <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
