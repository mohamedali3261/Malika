import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Primitives";
import { ArrowUpRight } from "@/components/ui/icons";
import { findRelated } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";

export function RelatedScents({ product }: { product: Product }) {
  const { t } = useLang();
  const { products } = useStore();
  const related = findRelated(products, product, 3);

  if (related.length === 0) return null;

  return (
    <section className="bg-bone sec-y-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow={t("featured.eyebrow")}
            title={t("product.related")}
            align="between"
            action={
              <Button to="/shop" variant="outline" icon={<ArrowUpRight className="h-4 w-4" />}>
                {t("featured.all")}
              </Button>
            }
          />
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {related.map((item, index) => (
            <Reveal key={item.id} delay={index * 70}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
