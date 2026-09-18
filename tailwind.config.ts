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
      },
    },
  },
  plugins: [],
};

export default config;
