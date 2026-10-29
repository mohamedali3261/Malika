import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Primitives";
import { Check } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber } from "@/lib/format";

/** Compact lead-in under the slider: what this page is, and why it is safe to order. */
export function ShopIntro({ count }: { count: number }) {
  const { t, lang } = useLang();

  return (
    <section className="bg-bone pb-1 pt-9 lg:pt-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>
              {t("shop.collectionEyebrow")} · {formatNumber(count, lang)} {t(count === 1 ? "shop.result" : "shop.results")}
            </Eyebrow>
            <h2 className="hd-section font-display mt-3 leading-[1.05] tracking-[-0.02em]">{t("shop.collectionTitle")}</h2>
            <p className="lead-copy mt-2.5 max-w-xl text-mist">{t("shop.collectionLead")}</p>
          </div>

          <ul className="flex flex-wrap gap-2">
            {(["shop.trust1", "shop.trust2", "shop.trust3"] as const).map((key) => (
              <li
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/55 px-3 py-1.5 text-[11px] font-semibold text-ink/70"
              >
                <Check className="h-3.5 w-3.5 text-plum" />
                {t(key)}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
