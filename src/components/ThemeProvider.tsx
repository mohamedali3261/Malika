import { useStore } from "@/context/StoreContext";
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
 */
export function ThemeProvider() {
  const { content } = useStore();
  const theme = content.theme ?? defaultContent.theme;

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    const set = (token: string, value: string) => root.setProperty(token, value);

    set("--color-ink", theme.ink);
    set("--color-bone", theme.bone);
    set("--color-bone-2", shade(theme.bone, -0.06));
    set("--color-line", shade(theme.bone, -0.12));
    set("--color-acid", theme.accent);
    set("--color-acid-deep", shade(theme.accent, -0.12));
    set("--color-lilac", theme.lilac);
    set("--color-lilac-soft", shade(theme.lilac, 0.45));
    set("--color-plum", shade(theme.ink, 0.1));
    set("--color-plum-2", shade(theme.ink, 0.18));

    applyScale(theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.ink);
  }, [theme]);

  return null;
}
