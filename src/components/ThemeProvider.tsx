import { useStore } from "@/context/StoreContext";
import { useThemeMode } from "@/context/ThemeModeContext";
import { defaultContent } from "@/data/defaultContent";
import { applyScale } from "@/lib/scale";
import { useLayoutEffect } from "react";

/** Darken/lighten a hex colour by a percentage. */
function shade(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = Number.parseInt(clean, 16);
  const channel = (shift: number) => {
    const base = (num >> shift) & 0xff;
    const next = Math.round(base + (percent < 0 ? base : 255 - base) * percent);
    return Math.min(255, Math.max(0, next));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Pushes the studio palette into the CSS custom properties that Tailwind's
 * theme is built on, so a colour change repaints the entire storefront with
 * no rebuild. Derived shades (bone-2, plum, accent-deep) are computed so the
 * owner only has to pick four colours.
 * Supports light (day) and dark modes — dark keeps background slightly dark as requested.
 */
export function ThemeProvider() {
  const { content } = useStore();
  const { mode } = useThemeMode();
  const theme = content.theme ?? defaultContent.theme;

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    const html = document.documentElement;
    const set = (token: string, value: string) => root.setProperty(token, value);

    if (mode === "dark") {
      // Dark mode — deep ink background, bone text, slightly dark as requested
      const darkBone = shade(theme.ink, 0.06); // #1d1a24-ish, slightly lighter than pure ink
      const darkBone2 = shade(theme.ink, 0.1);
      set("--color-ink", theme.bone);
      set("--color-bone", darkBone);
      set("--color-bone-2", darkBone2);
      set("--color-line", shade(theme.ink, 0.18));
      set("--color-acid", theme.accent);
      set("--color-acid-deep", shade(theme.accent, -0.12));
      set("--color-lilac", theme.lilac);
      set("--color-lilac-soft", shade(theme.lilac, 0.2));
      set("--color-plum", shade(theme.bone, -0.15));
      set("--color-plum-2", shade(theme.bone, -0.25));
      set("--color-mist", "#a69eb0");
      html.setAttribute("data-theme", "dark");
    } else {
      // Light / day mode — keep background slightly dark as requested (not pure white)
      const lightBone = shade(theme.bone, -0.07); // ~#e8e0cd, darker bone
      set("--color-ink", theme.ink);
      set("--color-bone", lightBone);
      set("--color-bone-2", shade(lightBone, -0.06));
      set("--color-line", shade(lightBone, -0.13));
      set("--color-acid", theme.accent);
      set("--color-acid-deep", shade(theme.accent, -0.12));
      set("--color-lilac", theme.lilac);
      set("--color-lilac-soft", shade(theme.lilac, 0.45));
      set("--color-plum", shade(theme.ink, 0.1));
      set("--color-plum-2", shade(theme.ink, 0.18));
      set("--color-mist", "#6d6675");
      html.setAttribute("data-theme", "light");
    }

    applyScale(theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mode === "dark" ? theme.ink : shade(theme.bone, -0.07));
  }, [theme, mode]);

  return null;
}
