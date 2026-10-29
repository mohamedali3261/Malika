import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Sparkle, Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { formatPrice } from "@/lib/format";
import { productMessage, whatsappUrl } from "@/lib/messaging";
import { fadeWindow } from "@/utils/perfumeTransforms";
import type { ScrollState } from "@/hooks/usePerfumeScrollAnimation";

interface Props {
  stateRef: React.RefObject<ScrollState>;
}

/**
 * Three copy blocks keyed to the narrative. Their opacity/transform are
 * written straight to the DOM from a single rAF loop, so scrolling never
 * triggers a React render.
 */
export function PerfumeProductInfo({ stateRef }: Props) {
  const { lang, l, t, x } = useLang();
  const { c, lc } = useContent();
  const { products, settings } = useStore();

  const heroRef = useRef<HTMLDivElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  const product =
    products.find((item) => item.slug === c.perfume3d.productSlug) ??
    products.find((item) => item.featured) ??
    products[0];

  useEffect(() => {
    let frame = 0;

    const apply = (node: HTMLDivElement | null, opacity: number, shift: number) => {
      if (!node) return;
      node.style.opacity = opacity.toFixed(3);
      node.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
      node.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      node.setAttribute("aria-hidden", opacity < 0.1 ? "true" : "false");
    };

    let last = -1;
    const tick = () => {
      const progress = stateRef.current?.progress ?? 0;
      if (progress === last) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      last = progress;

      const hero = fadeWindow(progress, 0, 0.14, 0.06);
      const craft = fadeWindow(progress, 0.42, 0.6, 0.07);
      const final = fadeWindow(progress, 0.9, 1.02, 0.06);

      apply(heroRef.current, hero, (1 - hero) * 26);
      apply(craftRef.current, craft, (1 - craft) * 26);
      apply(finalRef.current, final, (1 - final) * 26);

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [stateRef]);

  const price = product ? formatPrice(product.price, lang) : "";
  const orderLink = product
    ? whatsappUrl(settings.whatsapp, productMessage(product, 50, product.price, lang))
    : "#";

  return (
    <div className="perfume-overlay">
      {/* STAGE 1 — hero reveal */}
      <div ref={heroRef} className="perfume-block perfume-block--hero" style={{ opacity: 0 }}>
        <span className="perfume-eyebrow">
          <span className="perfume-eyebrow__dot" />
          {lc(c.perfume3d.collection)}
        </span>
        <h2 className="perfume-title font-display">{lc(c.perfume3d.name)}</h2>
        <p className="perfume-tagline">{lc(c.perfume3d.tagline)}</p>
        <p className="perfume-meta">{lc(c.perfume3d.heroLine)}</p>
      </div>

      {/* STAGE 3 — craftsmanship story */}
      <div ref={craftRef} className="perfume-block perfume-block--craft" style={{ opacity: 0 }}>
        <span className="perfume-eyebrow">
          <Sparkle className="h-3 w-3" />
          {x("Nine components", "تسعة أجزاء")}
        </span>
        <h3 className="perfume-subtitle font-display">{lc(c.perfume3d.craftTitle)}</h3>
        <p className="perfume-body">{lc(c.perfume3d.craftBody)}</p>
        <ul className="perfume-notes">
          {c.perfume3d.notes.map((note, index) => (
            <li key={note.en}>
              <span className="perfume-notes__index">0{index + 1}</span>
              {l(note)}
            </li>
          ))}
        </ul>
      </div>

      {/* STAGE 5 — final reveal */}
      <div ref={finalRef} className="perfume-block perfume-block--final" style={{ opacity: 0 }}>
        <span className="perfume-eyebrow">
          <span className="perfume-eyebrow__dot" />
          {lc(c.perfume3d.finalLine)}
        </span>
        <h3 className="perfume-subtitle font-display">{product ? l(product.name) : lc(c.perfume3d.name)}</h3>
        <p className="perfume-body perfume-body--tight">
          {product ? l(product.description) : lc(c.perfume3d.craftBody)}
        </p>
        <div className="perfume-price-row">
          <span className="perfume-price">{price}</span>
          <span className="perfume-price__unit">{x("/ 50 ml", "/ ٥٠ مل")}</span>
        </div>
        <div className="perfume-cta">
          <Button
            to={product ? `/product/${product.slug}` : "/shop"}
            variant="acid"
            size="lg"
            icon={<ArrowUpRight className="h-4 w-4" />}
          >
            {x("Discover the fragrance", "اكتشف العطر")}
          </Button>
          <Button
            href={orderLink}
            variant="dark"
            size="lg"
            className="border-bone/25"
            icon={<Whatsapp className="h-4 w-4" />}
            iconPosition="start"
          >
            {t("product.buyWhatsapp")}
          </Button>
        </div>
      </div>
    </div>
  );
}
