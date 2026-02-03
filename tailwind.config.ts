import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef6ee",
          100: "#fdecd7",
          500: "#f97316",
          600: "#ea580c",
          900: "#7c2d12",
        },
        secondary: {
          500: "#8b5cf6",
        },
        neutral: {
          50: "#faf7f5",
          100: "#f3ede8",
          200: "#e7ddd6",
          700: "#3a2f2a",
          900: "#1e1714",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
