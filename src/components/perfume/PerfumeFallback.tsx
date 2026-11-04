import { SmartImage } from "@/components/ui/Primitives";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";

/**
 * Static presentation used when WebGL is unavailable or the visitor
 * prefers reduced motion.
 */
export function PerfumeFallback() {
  const { l } = useLang();
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
