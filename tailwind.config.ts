import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Branding Krida Wacana
        navy: {
          DEFAULT: "#0B1F4B", // navy utama (header, hero, footer)
          dark: "#07142F",    // navy gelap (top bar, gradien hero)
          royal: "#1E3A8A",   // biru royal
          royalBright: "#2B4DB5",
        },
        amber: {
          brand: "#FBBF24",   // kuning/amber aksen utama
          highlight: "#FFC83D", // kuning kedua
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F7FB",
        },
        ink: {
          DEFAULT: "#0F172A", // teks gelap
          secondary: "#64748B", // teks sekunder
        },
        line: "#E2E8F0", // border tipis
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 30px -12px rgba(11, 31, 75, 0.16)",
        "card-hover": "0 16px 40px -12px rgba(11, 31, 75, 0.28)",
        glass: "0 8px 32px rgba(2, 9, 32, 0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
