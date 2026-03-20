import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/Components/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
    "./src/provider/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "9xl": "96rem",
      },
      boxShadow: {
        weather: "-3rem 1rem 6rem rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "40%": { opacity: "0.35" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "ripple-ring": {
          "0%": { transform: "scale(0)", opacity: "0.3", borderWidth: "2px" },
          "60%": { opacity: "0.15" },
          "100%": { transform: "scale(5)", opacity: "0", borderWidth: "1px" },
        },
        "cta-shine": {
          "0%, 12%": { transform: "translateX(-120%) skewX(-5deg)" },
          "55%": { transform: "translateX(250%) skewX(-5deg)" },
          "100%": { transform: "translateX(250%) skewX(-5deg)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ripple: "ripple 1000ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "ripple-ring":
          "ripple-ring 1200ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "cta-shine": "cta-shine 4.5s cubic-bezier(0.25, 0, 0.15, 1) infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
