import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { Link } from "@/lib/router";
import { pickCardRevealVariant } from "@/motion";
import { useMemo } from "react";

export function Featured() {
  const { t } = useLang();
  const { c, lc } = useContent();
  const { products } = useStore();

  const edit = useMemo(() => {
    const featured = products.filter((product) => product.featured);
    const rest = products.filter((product) => !product.featured);
    return [...featured, ...rest].slice(0, 8);
  }, [products]);

  return (
    <section className="relative bg-bone sec-y" id="signature-edit">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal variant="m-blur-rise">
          <SectionHeading
            eyebrow={lc(c.featured.eyebrow)}
            title={
              <>
                {lc(c.featured.title)}{" "}
                <span className="m-twinkle-star inline-block text-mist/60">✦</span>
              </>
            }
            lead={lc(c.featured.lead)}
            align="between"
            action={
              <Button to="/shop" variant="outline" size="sm" icon={<ArrowUpRight className="h-4 w-4" />}>
                {t("featured.all")}
              </Button>
            }
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:mt-11 lg:grid-cols-4 lg:gap-4.5">
          {edit.map((product, index) => (
            <Reveal key={product.id} variant={pickCardRevealVariant(index)} delay={index * 45}>
              <ProductCard product={product} priority={index < 4} />
            </Reveal>
          ))}
        </div>

        <Reveal
          variant="m-spring-soft"
          delay={100}
          className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-bone-2/60 px-5 py-4 sm:flex-row"
        >
          <p className="text-[11.5px] leading-relaxed text-ink/60">
            <span className="font-bold text-ink">{t("ann.2")}</span> · {t("ann.3")}
          </p>
          <Link
            to="/shop"
            className="link-underline group inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink"
          >
            {t("finder.shopAll")}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
