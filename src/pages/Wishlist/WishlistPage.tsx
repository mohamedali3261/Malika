import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight, ArrowUpRight, Bag, Heart, Sparkle, Whatsapp, X } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { formatNumber, formatPrice } from "@/lib/format";
import { whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import { emitBagPulse } from "@/motion";
import { ContactCTA } from "@/pages/Home/ContactCTA";
import { useMemo } from "react";

export function WishlistPage() {
  const { lang, l, t, x } = useLang();
  const { products, wishlist, clearWishlist, settings } = useStore();
  const { add, open: openCart } = useCart();
  const { push } = useToast();

  const savedProducts = useMemo(
    () =>
      wishlist
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [products, wishlist]
  );

  const suggested = useMemo(
    () =>
      products
        .filter((p) => !wishlist.includes(p.id))
        .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating)
        .slice(0, 3),
    [products, wishlist]
  );

  const handleAddAll = () => {
    if (savedProducts.length === 0) return;
    for (const product of savedProducts) {
      const preferred = product.sizes.find((s) => s.ml === 50) ?? product.sizes[0];
      if (preferred) add(product, preferred.ml, preferred.price, 1);
    }
    emitBagPulse();
    push(
      x(
        `Added ${savedProducts.length} saved scents to your bag`,
        `تمت إضافة ${formatNumber(savedProducts.length, lang)} عطور من المفضلة إلى السلة`
      )
    );
    openCart();
  };

  const handleClear = () => {
    clearWishlist();
    push(x("Saved list cleared", "تم مسح قائمة المفضلة"), "info");
  };

  const whatsappListMessage = useMemo(() => {
    if (savedProducts.length === 0) return x("Hello VLOR 🌿", "مرحباً ڨلور 🌿");
    const lines = savedProducts.map((p, idx) => {
      const sz = p.sizes.find((s) => s.ml === 50) ?? p.sizes[0];
      const ml = sz?.ml ?? 50;
      const pr = formatPrice(sz?.price ?? p.price, lang);
      return `${idx + 1}. ${l(p.name)} (${ml}ml — ${pr})`;
    });
    return lang === "ar"
      ? `مرحباً ڨلور 🌿\nأرغب في الاستفسار / طلب قائمتي المفضلة:\n${lines.join("\n")}`
      : `Hello VLOR 🌿\nI'd love to order my saved scents:\n${lines.join("\n")}`;
  }, [savedProducts, lang, l, x]);

  return (
    <div className="anim-page bg-bone">
      {/* Light editorial header */}
      <section className="border-b border-ink/5 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-bone">
              <Heart className="h-3 w-3" fill="currentColor" />
              {x("Private Selection", "مجموعتك الخاصة")} · {formatNumber(savedProducts.length, lang)}
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl">
              {x("Saved Scents.", "المفضلة.")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-mist">
              {x(
                "Your shortlist — compare, revisit, or move favourites to your bag in one tap.",
                "قائمتك المختصرة — قارن العطور أو أعد زيارتها أو انقلها للسلة بلمسة واحدة."
              )}
            </p>

            {savedProducts.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <Button variant="primary" size="md" onClick={handleAddAll} icon={<Bag className="h-4 w-4" />} iconPosition="start">
                  {x("Add all to bag", "إضافة الكل إلى السلة")}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  href={whatsappUrl(settings.whatsapp, whatsappListMessage)}
                  icon={<Whatsapp className="h-4 w-4" />}
                  iconPosition="start"
                  className="border-ink/12"
                >
                  {x("Order on WhatsApp", "اطلب عبر واتساب")}
                </Button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-mist hover:text-rose-600"
                >
                  <X className="h-3.5 w-3.5" /> {x("Clear", "مسح")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Saved Grid or Empty State */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {savedProducts.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 55}>
                <ProductCard product={product} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-lg rounded-[2rem] border border-ink/8 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bone-2/80 text-ink">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl sm:text-3xl">{x("No saved scents yet.", "قائمتك فارغة حالياً.")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist">
              {x(
                "Tap the heart on any fragrance to save it here.",
                "اضغط على القلب على أي عطر لحفظه هنا."
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button to="/shop" variant="primary" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
                {x("Explore fragrances", "استكشف العطور")}
              </Button>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink/60 hover:text-ink">
                {x("Back to home", "العودة للرئيسية")} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* Curated Suggestions — compact */}
        {suggested.length > 0 && (
          <div className="mt-12 border-t border-ink/5 pt-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-mist">
                  <Sparkle className="h-3 w-3 text-ink/40" />
                  {x("Curated for you", "مختارات الدار")}
                </p>
                <h2 className="mt-1 font-display text-xl sm:text-2xl">
                  {savedProducts.length > 0 ? x("You may also like", "قد يعجبك أيضاً") : x("Start with these", "ابدأ بهذه")}
                </h2>
              </div>
              <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.12em] underline decoration-acid decoration-2 underline-offset-4">
                {t("footer.shopAll")}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {suggested.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      <ContactCTA />
    </div>
  );
}
