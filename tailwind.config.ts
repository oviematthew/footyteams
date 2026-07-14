import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#0B2E22",
          800: "#14493A",
          700: "#1B5A47",
        },
        chalk: "#F3EFE4",
        muted: "#8FB4A3",
        amber: "#FFB100",
        striker: "#FF7A50",
        mid: "#43D9C0",
        def: "#5B9BEE",
        anyPos: "#B9C9BE",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        stripes:
          "repeating-linear-gradient(180deg, rgba(243,239,228,0.03) 0px, rgba(243,239,228,0.03) 2px, transparent 2px, transparent 64px)",
      },
    },
  },
  plugins: [],
};

export default config;
