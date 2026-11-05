import { Gallery } from "@/pages/Product/Gallery";
import { ProductDetails } from "@/pages/Product/ProductDetails";
import { PurchaseBar } from "@/pages/Product/PurchaseBar";
import { PurchasePanel } from "@/pages/Product/PurchasePanel";
import { RelatedScents } from "@/pages/Product/RelatedScents";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight, Sparkle } from "@/components/ui/icons";
import { getProductBySlug } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { Link, useRoute } from "@/lib/router";

export function ProductPage() {
  const { t, x } = useLang();
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
        <div
          className="pointer-events-none absolute -start-32 top-20 h-80 w-80 rounded-full opacity-20 blur-[100px]"
          style={{ background: product.accent }}
        />
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

      <section className="pb-12 lg:pb-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <Reveal>
            <div className="rounded-[1.8rem] border border-ink/10 bg-surface/40 p-6 sm:p-8">
              <ProductDetails product={product} />
            </div>
          </Reveal>
        </div>
      </section>

      <RelatedScents product={product} />
      <div className="h-28 lg:hidden" aria-hidden="true" />
      <PurchaseBar product={product} />
    </div>
  );
}
