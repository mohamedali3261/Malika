import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Primitives";
import { Bag } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import { resolveAsset } from "@/lib/assets";
import { useToast } from "@/context/ToastContext";

export function BundleOffers() {
  const { c, lc } = useContent();
  const { lang, l, x } = useLang();
  const { products } = useStore();
  const { add, open } = useCart();
  const { push } = useToast();

  const offers = c.offers;
  if (!offers || !offers.bundles || offers.bundles.length === 0) return null;

  return (
    <section className="relative bg-bone sec-y overflow-hidden" id="offers">
      <div className="pointer-events-none absolute -top-24 end-1/4 h-[420px] w-[420px] rounded-full bg-lilac/10 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 start-1/4 h-64 w-64 rounded-full bg-acid/8 blur-[90px]" />
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow={lc(offers.eyebrow)} title={lc(offers.title)} lead={lc(offers.lead)} align="between" />
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:mt-10">
          {offers.bundles.map((bundle, idx) => {
            const bundleProducts = bundle.productSlugs
              .map((slug) => products.find((p) => p.slug === slug || p.id === slug))
              .filter(Boolean) as typeof products;

            if (bundleProducts.length === 0) return null;

            const originalTotal = bundleProducts.reduce((sum, p) => {
              const price = p.sizes?.[0]?.price ?? p.price;
              return sum + price;
            }, 0);
            const bundlePrice = bundle.bundlePrice;
            const saving = Math.max(0, originalTotal - bundlePrice);

            const handleAddBundle = () => {
              // Add each product in bundle to cart; distribute bundle price proportionally
              bundleProducts.forEach((product) => {
                const originalPrice = product.sizes?.[0]?.price ?? product.price;
                const share = originalTotal > 0 ? originalPrice / originalTotal : 1 / bundleProducts.length;
                const discountedPrice = Math.round(bundlePrice * share);
                const ml = product.sizes?.[0]?.ml ?? 50;
                add(product, ml, discountedPrice, 1);
              });
              push(
                lang === "ar"
                  ? `تمت إضافة باقة "${l(bundle.title)}" للسلة — وفّرت ${formatPrice(saving, lang)}`
                  : `Bundle "${l(bundle.title)}" added — you saved ${formatPrice(saving, lang)}`,
                "info"
              );
              open();
            };

            return (
              <Reveal key={bundle.id} delay={idx * 90} className="h-full">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-ink/10 bg-surface shadow-[0_16px_40px_-20px_rgba(20,16,25,0.18)] transition-all duration-300 hover:shadow-[0_20px_50px_-16px_rgba(20,16,25,0.22)] hover:-translate-y-1">
                  {/* One compact, editable discount badge */}
                  <span className="absolute start-3 top-3 z-10 rounded-full bg-acid px-3 py-1 text-[11px] font-extrabold text-[#141019]">
                    {l(bundle.badge)}
                  </span>

                  {/* product row */}
                  <div className="flex gap-2 p-4 pt-12 sm:gap-3 sm:p-5 sm:pt-12">
                    {bundleProducts.slice(0, 4).map((product) => (
                      <div key={product.id} className="flex-1">
                        <div className="aspect-[3/4] overflow-hidden rounded-xl border border-ink/8 bg-bone-2/50 p-2">
                          <img
                            src={resolveAsset(product.cutout || product.images[0])}
                            alt={l(product.name)}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-center text-[11px] font-bold leading-tight text-ink">{l(product.name)}</p>
                        <p className="text-center text-[10px] font-semibold text-mist" dir="ltr">
                          {formatPrice(product.sizes?.[0]?.price ?? product.price, lang)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-1 flex-col p-5 pt-3">
                    <h3 className="font-display text-xl leading-tight tracking-tight text-ink">{l(bundle.title)}</h3>

                    <div className="mt-3 flex items-end justify-between gap-3 rounded-2xl border border-ink/8 bg-bone-2/40 p-3">
                      <div>
                        <p className="text-[10px] font-semibold text-mist line-through" dir="ltr">
                          {formatPrice(originalTotal, lang)}
                        </p>
                        <p className="font-display text-2xl leading-none text-ink" dir="ltr">
                          {formatPrice(bundlePrice, lang)}
                        </p>
                      </div>
                      <p className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-acid" dir="ltr">
                        {x("Save", "وفّر")} {formatPrice(saving, lang)}
                      </p>
                    </div>

                    <Button
                      onClick={handleAddBundle}
                      variant="acid"
                      size="lg"
                      full
                      className="mt-4"
                      icon={<Bag className="h-4 w-4" />}
                      iconPosition="start"
                    >
                      {x("Add bundle to bag", "أضف الباقة للسلة")}
                    </Button>

                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={180}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-surface/50 px-4 py-3 text-center">
            <p className="text-[12px] font-medium text-mist">
              {x(
                "Need a custom bundle? Chat with our perfumer on WhatsApp and we'll craft a set with a special price.",
                "تحتاج باقة مخصصة؟ تحدث مع خبير العطور على واتساب وسنجهز لك مجموعة بسعر خاص."
              )}
            </p>
            <span className="hidden h-3 w-px bg-ink/15 sm:block" />
            <span className="text-[11px] font-bold text-ink">
              {x("2–4 scents per bundle · One payment", "٢–٤ عطور لكل باقة · دفع واحد")}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
