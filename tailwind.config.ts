import type { Config } from "tailwindcss";
import { colors, radius, shadows, fonts } from "./src/lib/design-tokens";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand
        violet: { DEFAULT: colors.violet, hover: colors.violetHover, soft: colors.violetSoft },
        // Dark surfaces
        ink: colors.ink,
        navy: { DEFAULT: colors.navy, light: colors.navyLight },
        // Status
        mint: { DEFAULT: colors.mint, soft: colors.mintSoft },
        amber: { DEFAULT: colors.amber, soft: colors.amberSoft },
        danger: { DEFAULT: colors.danger, soft: colors.dangerSoft },
        // Neutrals
        canvas: colors.canvas,
        surface: { DEFAULT: colors.surface, alt: colors.surfaceAlt },
        line: colors.line,
        muted: { DEFAULT: colors.muted, dark: colors.mutedDark },
        slate: colors.slate
      },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl
      },
      boxShadow: {
        xs: shadows.xs,
        sm: shadows.sm,
        soft: shadows.soft,
        lg: shadows.lg
      },
      fontFamily: {
        sans: fonts.sans,
        mono: fonts.mono
      },
      maxWidth: {
        sidebar: "280px"
      },
      gridTemplateColumns: {
        dashboard: "280px 1fr"
      },
      transitionProperty: {
        sidebar: "width, padding"
      }
    }
  },
  plugins: []
};

export default config;
