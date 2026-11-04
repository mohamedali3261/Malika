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
        .slice(0, 4),
    [products, wishlist]
  );

  const totalEstimate = useMemo(
    () =>
      savedProducts.reduce((sum, product) => {
        const preferred = product.sizes.find((s) => s.ml === 50) ?? product.sizes[0];
        return sum + (preferred?.price ?? product.price);
      }, 0),
    [savedProducts]
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
    if (savedProducts.length === 0) return x("Hello VLOR 🌿", "مرحباً VLOR 🌿");
    const lines = savedProducts.map((p, idx) => {
      const sz = p.sizes.find((s) => s.ml === 50) ?? p.sizes[0];
      const ml = sz?.ml ?? 50;
      const pr = formatPrice(sz?.price ?? p.price, lang);
      return `${idx + 1}. ${l(p.name)} (${ml}ml — ${pr})`;
    });
    return lang === "ar"
      ? `مرحباً VLOR 🌿\nأرغب في الاستفسار / طلب قائمتي المفضلة:\n${lines.join("\n")}`
      : `Hello VLOR 🌿\nI'd love to order my saved scents:\n${lines.join("\n")}`;
  }, [savedProducts, lang, l, x]);

  return (
    <div className="anim-page bg-bone">
      {/* Editorial Hero Header */}
      <section className="relative overflow-hidden border-b border-ink/10 bg-ink py-12 text-bone sm:py-16 lg:py-20">
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-28 end-10 h-72 w-72 rounded-full bg-lilac/20 blur-[95px]" />
        <div className="pointer-events-none absolute -bottom-24 start-10 h-64 w-64 rounded-full bg-acid/12 blur-[90px]" />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-bone/15 bg-bone/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-lilac">
                <Heart className="h-3.5 w-3.5" fill="currentColor" />
                {x("Private Selection", "مجموعتك الخاصة")}
              </span>
              <h1 className="mt-4 font-display text-4xl leading-[0.98] tracking-tight sm:text-6xl">
                {x("Saved Scents.", "المفضلة.")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-bone/65 sm:text-[15px]">
                {x(
                  "Keep the compositions that linger on your mind — compare notes, revisit sizes, or move your favourites straight into your bag.",
                  "احتفظ بالعطور التي لامست ذائقتك — قارن النوتات والأحجام أو انقل اختياراتك مباشرةً إلى حقيبة التسوق."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="rounded-2xl border border-bone/12 bg-white/[0.04] px-4 py-2.5 backdrop-blur-sm">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-bone/45">
                  {x("Saved bottles", "العطور المحفوظة")}
                </p>
                <p className="mt-0.5 font-display text-2xl leading-none text-acid">
                  {formatNumber(savedProducts.length, lang)}
                </p>
              </div>
              {savedProducts.length > 0 && (
                <div className="rounded-2xl border border-bone/12 bg-white/[0.04] px-4 py-2.5 backdrop-blur-sm">
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-bone/45">
                    {x("50 ml total", "إجمالي ٥٠ مل")}
                  </p>
                  <p className="mt-0.5 font-display text-2xl leading-none text-bone">
                    {formatPrice(totalEstimate, lang)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {savedProducts.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-bone/10 pt-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="acid"
                  size="md"
                  onClick={handleAddAll}
                  icon={<Bag className="h-4 w-4" />}
                  iconPosition="start"
                >
                  {x("Add all to bag", "إضافة الكل إلى السلة")}
                </Button>
                <Button
                  variant="dark"
                  size="md"
                  className="border-bone/20"
                  href={whatsappUrl(settings.whatsapp, whatsappListMessage)}
                  icon={<Whatsapp className="h-4 w-4" />}
                  iconPosition="start"
                >
                  {x("Order list on WhatsApp", "اطلب المفضلة عبر واتساب")}
                </Button>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-bone/15 px-3.5 py-2 text-[11px] font-semibold text-bone/65 transition hover:border-rose-400/50 hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" />
                {x("Clear saved", "مسح القائمة")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Saved Grid or Empty State */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        {savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {savedProducts.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 55}>
                <ProductCard product={product} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-[2rem] border border-ink/10 bg-white/70 p-8 text-center shadow-[0_24px_60px_-36px_rgba(20,16,25,0.28)] backdrop-blur-sm sm:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lilac/30 text-ink">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-3xl text-ink sm:text-4xl">
              {x("No saved scents yet.", "قائمتك المفضلة فارغة حالياً.")}
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-mist">
              {x(
                "Tap the heart icon on any fragrance across the shop or runway lookbook to save it here for quick comparison.",
                "اضغط على علامة القلب على أي عطر في المتجر أو في منصة العرض لحفظه هنا والرجوع إليه في أي وقت."
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button to="/shop" variant="primary" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
                {x("Explore all fragrances", "استكشف جميع العطور")}
              </Button>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ink/70 transition hover:text-ink"
              >
                {x("Back to home", "العودة للرئيسية")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* Curated Suggestions */}
        {suggested.length > 0 && (
          <div className="mt-14 border-t border-ink/10 pt-10 sm:mt-16 sm:pt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-mist">
                  <Sparkle className="h-3 w-3 text-ink" />
                  {x("Curated for you", "مختارات الدار")}
                </p>
                <h2 className="mt-1.5 font-display text-2xl text-ink sm:text-4xl">
                  {savedProducts.length > 0
                    ? x("Pair with your selection", "عطور تكمّل اختياراتك")
                    : x("Signature scents to start with", "ابدأ بأبرز عطور VLOR")}
                </h2>
              </div>
              <Link
                to="/shop"
                className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-ink underline decoration-acid decoration-2 underline-offset-4"
              >
                {t("footer.shopAll")}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {suggested.slice(0, 3).map((product) => (
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
