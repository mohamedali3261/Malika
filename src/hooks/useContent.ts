import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useCallback } from "react";
import type { Localized } from "@/types";
import type { SiteContent } from "@/types/content";

/**
 * Convenience accessor for studio-managed copy.
 *
 * `c` is the raw content tree, `lc` localises a field in the active language.
 * Components keep reading from one place, so adding an editable field never
 * requires touching the i18n dictionary.
 */
export function useContent(): {
  c: SiteContent;
  lc: (value: Localized | undefined, fallback?: string) => string;
} {
  const { content } = useStore();
  const { l } = useLang();

  const lc = useCallback(
    (value: Localized | undefined, fallback = "") => (value ? l(value) : fallback),
    [l]
  );

  return { c: content, lc };
}
