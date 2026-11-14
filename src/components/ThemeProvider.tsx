import { useStore } from "@/context/StoreContext";
import { defaultContent } from "@/data/defaultContent";
import { applyScale } from "@/lib/scale";
import { shade, siteBackground } from "@/lib/theme";
import { useLayoutEffect } from "react";

/** Apply the studio palette in day mode, regardless of old browser preferences. */
export function ThemeProvider() {
  const { content } = useStore();
  const theme = content.theme ?? defaultContent.theme;

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    const set = (token: string, value: string) => root.setProperty(token, value);
    const background = siteBackground(theme, "light");
    const surface = shade(background, -0.06);
    set("--color-ink", theme.ink);
    set("--color-bone", background);
    set("--color-bone-2", surface);
    set("--color-surface", surface);
    set("--color-surface-2", shade(background, -0.10));
    set("--color-line", shade(background, -0.13));
    set("--color-acid", theme.accent);
    set("--color-acid-deep", shade(theme.accent, -0.12));
    set("--color-lilac", theme.lilac);
    set("--color-lilac-soft", shade(theme.lilac, 0.45));
    set("--color-plum", shade(theme.ink, 0.1));
    set("--color-plum-2", shade(theme.ink, 0.18));
    set("--color-mist", "#706b62");
    document.documentElement.setAttribute("data-theme", "light");
    applyScale(theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", background);
  }, [theme]);

  return null;
}
