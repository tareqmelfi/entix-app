import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#142033",
        navy: "#061936",
        violet: "#7c3aed",
        mint: "#11b981",
        amber: "#f59e0b",
        danger: "#ef4444",
        surface: "#ffffff",
        canvas: "#f5f7fb"
      },
      boxShadow: {
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
