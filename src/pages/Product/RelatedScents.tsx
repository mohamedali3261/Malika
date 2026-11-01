import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/icons";
import { findRelated } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { pickCardRevealVariant } from "@/motion";
import type { Product } from "@/types";

export function RelatedScents({ product }: { product: Product }) {
  const { t } = useLang();
  const { products } = useStore();
  const related = findRelated(products, product, 4);

  if (related.length === 0) return null;

  return (
    <section className="bg-bone sec-y-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal variant="m-blur-rise">
          <SectionHeading
            eyebrow={t("featured.eyebrow")}
            title={t("product.related")}
            align="between"
            action={
              <Button to="/shop" variant="outline" size="sm" icon={<ArrowUpRight className="h-4 w-4" />}>
                {t("featured.all")}
              </Button>
            }
          />
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-4.5">
          {related.map((item, index) => (
            <Reveal key={item.id} variant={pickCardRevealVariant(index)} delay={index * 55}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
