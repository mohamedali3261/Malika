import { Button } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/icons";
import { SmartImage } from "@/components/ui/Primitives";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { formatPrice } from "@/lib/format";

/**
 * Static product presentation used when WebGL is unavailable or the visitor
 * prefers reduced motion. Same story, no canvas.
 */
export function PerfumeFallback() {
  const { lang, l, x } = useLang();
  const { c, lc } = useContent();
  const { products } = useStore();
  const product =
    products.find((item) => item.slug === c.perfume3d.productSlug) ??
    products.find((item) => item.featured) ??
    products[0];

  return (
    <section className="perfume-fallback">
      <div className="perfume-fallback__inner">
        <div className="perfume-fallback__copy">
          <span className="perfume-eyebrow">
            <span className="perfume-eyebrow__dot" />
            {lc(c.perfume3d.collection)}
          </span>
          <h2 className="perfume-title font-display">{lc(c.perfume3d.name)}</h2>
          <p className="perfume-tagline">{lc(c.perfume3d.tagline)}</p>
          <p className="perfume-body">{lc(c.perfume3d.craftBody)}</p>
          <ul className="perfume-notes">
            {c.perfume3d.notes.map((note, index) => (
              <li key={note.en}>
                <span className="perfume-notes__index">0{index + 1}</span>
                {l(note)}
              </li>
            ))}
          </ul>
          {product && (
            <div className="perfume-price-row">
              <span className="perfume-price">{formatPrice(product.price, lang)}</span>
              <span className="perfume-price__unit">{x("/ 50 ml", "/ ٥٠ مل")}</span>
            </div>
          )}
          <div className="perfume-cta">
            <Button to={product ? `/product/${product.slug}` : "/shop"} variant="acid" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
              {x("Discover the fragrance", "اكتشف العطر")}
            </Button>
          </div>
        </div>
        {product && (
          <div className="perfume-fallback__media">
            <SmartImage src={product.images[0]} alt={l(product.name)} className="aspect-[4/5] w-full rounded-[1.8rem]" />
          </div>
        )}
      </div>
    </section>
  );
}
