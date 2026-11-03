import { useContent } from "@/hooks/useContent";

/** The house name and descriptor in the active language, as set in the studio. */
export function useBrand(): { wordmark: string; descriptor: string } {
  const { c, lc } = useContent();
  return {
    wordmark: lc(c.brand.wordmark).trim() || "VLOR",
    descriptor: lc(c.brand.descriptor),
  };
}
