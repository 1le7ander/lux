import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
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
        luxe: "0 20px 60px -20px rgba(212, 175, 55, 0.3)",
        "luxe-lg": "0 40px 90px -25px rgba(212, 175, 55, 0.45)",
        "plum-glow": "0 20px 60px -20px rgba(107, 45, 143, 0.55)",
        "inner-hairline": "inset 0 1px 0 rgba(255,255,255,0.07)",
      },
      dropShadow: {
        gold: "0 10px 24px rgba(212, 175, 55, 0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.55s var(--ease-luxe, cubic-bezier(0.22,1,0.36,1)) both",
        "slide-down": "slideDown 0.45s var(--ease-luxe, cubic-bezier(0.22,1,0.36,1)) both",
        "pop-in": "pop-in 0.35s var(--ease-luxe, cubic-bezier(0.22,1,0.36,1)) both",
        shimmer: "shine 2.4s linear infinite",
        float: "float-slow 6s ease-in-out infinite",
        marquee: "scroll 38s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
        "radial-gold":
          "radial-gradient(circle at 30% 20%, rgba(212,175,55,0.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
