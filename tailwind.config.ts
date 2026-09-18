import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef1f8",
          100: "#d7ddec",
          200: "#aeb9d8",
          300: "#8695c3",
          400: "#5d70ad",
          500: "#3b5299",
          600: "#2a3e7a",
          700: "#1f2f5c",
          800: "#16224a",
          900: "#0d1530",
          950: "#080d1e",
        },
        brand: {
          50: "#f2f1ff",
          100: "#e6e4ff",
          200: "#cdc9ff",
          300: "#aca4ff",
          400: "#8b7dff",
          500: "#7c6cf4",
          600: "#6650e0",
          700: "#5440b8",
          800: "#413292",
          900: "#2e2468",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f7f8fb",
          muted: "#eef0f6",
          border: "#e6e9f2",
        },
        status: {
          available: "#16a34a",
          hold: "#eab308",
          booked: "#2563eb",
          kpr: "#9333ea",
          sold: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 60, 0.04), 0 1px 12px -2px rgba(16, 24, 60, 0.06)",
        "card-hover": "0 4px 20px -4px rgba(16, 24, 60, 0.12)",
        glow: "0 0 0 1px rgba(124, 108, 244, 0.15), 0 8px 24px -8px rgba(124, 108, 244, 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6650e0 0%, #7c6cf4 45%, #3b5299 100%)",
        "sidebar-gradient": "linear-gradient(180deg, #0d1530 0%, #0a1126 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
