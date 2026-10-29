import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";

/** The house name and descriptor in the active language, as set in the studio. */
export function useBrand(): { wordmark: string; descriptor: string } {
  const { c, lc } = useContent();
  const { lang } = useLang();
  return {
    wordmark: lc(c.brand.wordmark).trim() || (lang === "ar" ? "مليكة" : "MALIKA"),
    descriptor: lc(c.brand.descriptor),
  };
}
