import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Structural — flips between light/dark
        canvas: "#F5F6FA",
        canvasDark: "#0F1117",
        surface: "#FFFFFF",
        surfaceDark: "#1B1E29",
        surfaceAlt: "#EEF0F5",
        surfaceAltDark: "#262A38",
        ink: "#14161F",
        paper: "#F5F6FA",
        muted: "#6B7280",
        mutedDark: "#9AA0AE",

        // Brand / status — stays roughly constant across themes
        navy: "#0F1117",
        coral: "#FF6B57",
        coralDeep: "#E14F3A",
        action: "#2F6FED",
        actionAlt: "#0E9F6E",
        live: "#FF6B57",
        upnext: "#6B7280",
        onbreak: "#8B8FA3",
        gold: "#D9A441",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(11, 18, 32, 0.08)",
        cardDark: "0 8px 24px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
