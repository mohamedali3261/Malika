import { translate, type TranslationKey } from "@/i18n/translations";
import { localized } from "@/i18n/translations";
import type { Lang, Localized } from "@/types";
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useStore } from "@/context/StoreContext";

interface LanguageValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  isArabic: boolean;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: (key: TranslationKey) => string;
  /**
   * Inline bilingual text: x("English", "العربية"). Behaves like the plain
   * pair, unless the owner edited that wording in the studio.
   */
  x: (en: string, ar: string) => string;
  l: (value: Localized) => string;
}

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = usePersistentState<Lang>("malika.language.v1", "ar");
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => setLangState(next), [setLangState]);
  const toggle = useCallback(
    () => setLangState((prev) => (prev === "ar" ? "en" : "ar")),
    [setLangState]
  );
  // Owner edits to site text. Studio-only wording is deliberately not editable:
  // a typo in the login or publish screens must never lock the owner out.
  const { content } = useStore();
  const overrides = content.textOverrides;

  const t = useCallback(
    (key: TranslationKey) => {
      const edited = /^(admin|gh|lock)\./.test(key) ? undefined : overrides[key]?.[lang];
      return edited && edited.trim() ? edited : translate(key, lang);
    },
    [lang, overrides]
  );
  const x = useCallback(
    (en: string, ar: string) => {
      const edited = overrides["i:" + en]?.[lang];
      return edited && edited.trim() ? edited : lang === "ar" ? ar : en;
    },
    [lang, overrides]
  );
  const l = useCallback((value: Localized) => localized(value, lang), [lang]);

  const value = useMemo<LanguageValue>(
    () => ({ lang, dir, isArabic: lang === "ar", setLang, toggle, t, x, l }),
    [lang, dir, setLang, toggle, t, x, l]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
