import { useLang } from "@/i18n/LanguageContext";
import type { CSSProperties } from "react";

/** Circumference of the r=47 circle in the 100×100 viewBox. */
const CIRCUMFERENCE = 2 * Math.PI * 47;

/**
 * "Durability rate" ring from the original card, reinterpreted as scent
 * longevity. The product stores a free-text range ("10–12h", "12h+"); the
 * highest number in it is read as hours and 12 h counts as a full ring.
 */
export function parseLongevityHours(text: string): number {
  const numbers = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite);
  return numbers.length > 0 ? Math.max(...numbers) : 8;
}

export function LongevityRing({ longevity, sillage }: { longevity: string; sillage: string }) {
  const { lang, t } = useLang();
  const hours = parseLongevityHours(longevity);
  const fraction = Math.min(1, Math.max(0.08, hours / 12));
  const number = new Intl.NumberFormat((lang === "ar" ? "ar-EG" : "en-US")).format(hours);

  return (
    <div className="flex items-center gap-3 text-center lg:block">
      <div className="relative mx-auto h-[60px] w-[60px] shrink-0 lg:mb-2 lg:h-[82px] lg:w-[82px]">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="var(--acc)"
            strokeWidth="4"
            strokeLinecap="round"
            className="shop-ring"
            style={{ "--dash": `${(fraction * CIRCUMFERENCE).toFixed(1)}`, transformOrigin: "50% 50%", transform: "rotate(-90deg)" } as CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <bdi dir="ltr" className="font-display text-[1.05rem] leading-none text-bone lg:text-[1.4rem]">
            {number}
            <span className="ms-0.5 text-[0.6em] text-bone/60">{t("shop.slider.hours")}</span>
          </bdi>
        </div>
      </div>

      <div className="text-start lg:text-center">
        <span className="block text-[11px] font-extrabold uppercase tracking-[0.2em] text-bone/80">
          {t("shop.slider.longevity")}
        </span>
        <span className="mt-1 block max-w-[130px] text-[11.5px] leading-snug text-bone/50 lg:mx-auto">{sillage}</span>
      </div>
    </div>
  );
}
