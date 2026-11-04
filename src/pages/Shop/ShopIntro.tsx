import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Primitives";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber } from "@/lib/format";

/** Compact lead-in under the slider */
export function ShopIntro({ count }: { count: number }) {
  const { t, lang } = useLang();

  return (
    <section className="bg-bone pb-1 pt-9 lg:pt-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal className="max-w-2xl">
          <Eyebrow>
            {t("shop.collectionEyebrow")} · {formatNumber(count, lang)} {t(count === 1 ? "shop.result" : "shop.results")}
          </Eyebrow>
          <h2 className="hd-section font-display mt-3 leading-[1.05] tracking-[-0.02em]">{t("shop.collectionTitle")}</h2>
          <p className="lead-copy mt-2.5 max-w-xl text-mist">{t("shop.collectionLead")}</p>
        </Reveal>
      </div>
    </section>
  );
}
