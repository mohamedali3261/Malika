import { ContactCTA } from "@/pages/Home/ContactCTA";
import { Gallery } from "@/pages/Product/Gallery";
import { ProductDetails } from "@/pages/Product/ProductDetails";
import { ProductNotes } from "@/pages/Product/ProductNotes";
import { PurchaseBar } from "@/pages/Product/PurchaseBar";
import { PurchasePanel } from "@/pages/Product/PurchasePanel";
import { RelatedScents } from "@/pages/Product/RelatedScents";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight, Flask, Leaf, Sparkle } from "@/components/ui/icons";
import { getProductBySlug } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber } from "@/lib/format";
import { Link, useRoute } from "@/lib/router";

export function ProductPage() {
  const { t, lang, x } = useLang();
  const { products } = useStore();
  const { segments } = useRoute();
  const product = getProductBySlug(products, segments[1] ?? "");

  if (!product) {
    return (
      <div className="anim-page flex min-h-[60vh] flex-col items-center justify-center bg-bone px-6 py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-lilac-soft">
          <Sparkle className="h-7 w-7 text-plum" />
        </span>
        <h1 className="font-display mt-6 text-4xl sm:text-5xl">{t("product.notFound")}</h1>
        <p className="mt-3 max-w-sm text-sm text-mist">
          {x("It may have moved or sold out. Explore the rest of the collection.", "ربما تم نقله أو نفدت كميته. جرّب استكشاف بقية المجموعة.")}
        </p>
        <Button to="/shop" className="mt-6" icon={<ArrowUpRight className="h-4 w-4" />}>
          {t("product.notFoundCta")}
        </Button>
      </div>
    );
  }

  return (
    <div className="anim-page bg-bone">
      <section className="relative overflow-hidden page-pad">
        <div className="pointer-events-none absolute -start-32 top-20 h-80 w-80 rounded-full opacity-20 blur-[100px]" style={{ background: product.accent }} />
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Link
            to="/shop"
            className="mb-5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-mist transition hover:text-ink"
          >
            <span className="rtl:rotate-180">←</span> {t("featured.all")}
          </Link>
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Gallery product={product} />
            </div>
            <PurchasePanel product={product} />
          </div>
        </div>
      </section>

      <section className="pb-14 lg:pb-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <ProductNotes product={product} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <div className="rounded-[1.8rem] border border-ink/10 bg-white/40 p-6 sm:p-8">
                <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-mist">
                  {x("The details", "التفاصيل")}
                </p>
                <div className="mt-4">
                  <ProductDetails product={product} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex h-full flex-col justify-between overflow-hidden rounded-[1.8rem] border border-ink/10 bg-bone-2/50 p-6 sm:p-8">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-mist">
                    {x("In the bottle", "في الزجاجة")}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { value: "30%", label: x("extrait concentration", "تركيز الإكستريه") },
                      { value: formatNumber(product.sizes[0]?.ml ?? 30, lang), label: x("smallest size (ml)", "أصغر حجم (مل)") },
                      { value: "200h+", label: x("maturation", "تعتيق") },
                      { value: product.longevity, label: x("approx. longevity", "ثبات تقريبي") },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-ink/10 bg-bone px-3 py-3">
                        <p className="font-display text-2xl leading-none">{item.value}</p>
                        <p className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-mist">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 space-y-3 border-t border-ink/10 pt-4">
                  <div className="flex items-start gap-2.5">
                    <Flask className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                    <p className="text-[11px] leading-relaxed text-ink/65">
                      {x("Heavy refillable glass — reorder a refill at 25% off.", "زجاجة ثقيلة قابلة لإعادة التعبئة — اطلب إعادة التعبئة بخصم ٢٥٪.")}
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                    <p className="text-[11px] leading-relaxed text-ink/65">
                      {x("Dye-free. Dermatologically tested and suitable for sensitive skin.", "خالٍ من الصبغات. مختبر جلدياً ومناسب للبشرة الحساسة.")}
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                    <p className="text-[11px] leading-relaxed text-ink/65">
                      {x("Every bottle is numbered and wrapped by hand in Cairo.", "كل زجاجة مرقّمة ومغلفة يدوياً في القاهرة.")}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <RelatedScents product={product} />
      <ContactCTA />
      <div className="h-28 lg:hidden" aria-hidden="true" />
      <PurchaseBar product={product} />
    </div>
  );
}
