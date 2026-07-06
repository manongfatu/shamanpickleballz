import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1220",
        ink: "#14161F",
        surface: "#FFFFFF",
        canvas: "#F7F8FA",
        gold: "#D9A441",
        action: "#2F6FED",
        actionAlt: "#0E9F6E",
        live: "#E8590C",
        upnext: "#6B7280",
        onbreak: "#8B8FA3",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(11, 18, 32, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
