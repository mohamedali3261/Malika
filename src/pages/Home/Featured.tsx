import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useContent } from "@/hooks/useContent";
import { useLang } from "@/i18n/LanguageContext";
import { pickCardRevealVariant } from "@/motion";
import { useMemo } from "react";

export function Featured() {
  const { t } = useLang();
  const { c, lc } = useContent();
  const { products } = useStore();

  const edit = useMemo(() => {
    const available = products.filter((product) => product.showOnHome !== false);
    const featured = available.filter((product) => product.featured);
    const rest = available.filter((product) => !product.featured);
    return [...featured, ...rest].slice(0, 6);
  }, [products]);

  if (edit.length === 0) return null;

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
              <Button to="/shop" variant="outline" icon={<ArrowUpRight className="h-4 w-4" />}>
                {t("featured.all")}
              </Button>
            }
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {edit.map((product, index) => (
            <Reveal key={product.id} variant={pickCardRevealVariant(index)} delay={index * 55}>
              <ProductCard product={product} priority={index < 3} />
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
