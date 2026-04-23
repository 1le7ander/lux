import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: "#07000f",
          1: "#0a0517",
          2: "#120a24",
          3: "#1a1030",
        },
        gold: {
          DEFAULT: "#d4af37",
          soft: "#f5d76e",
          deep: "#b8962d",
        },
        plum: {
          DEFAULT: "#6b2d8f",
          soft: "#8b4bb8",
          deep: "#4a1f66",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", '"Noto Sans Arabic"', "system-ui", "sans-serif"],
        arabic: ['"Noto Sans Arabic"', "Inter", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 20px 60px -20px rgba(212, 175, 55, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
