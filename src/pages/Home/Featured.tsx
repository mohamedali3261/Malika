import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { useContent } from "@/hooks/useContent";
import { Link } from "@/lib/router";

export function Featured() {
  const { t } = useLang();
  const { c, lc } = useContent();
  const { products } = useStore();
  const featured = products.filter((product) => product.featured).slice(0, 6);
  const edit = featured.length > 0 ? featured : products.slice(0, 6);

  return (
    <section className="relative bg-bone sec-y" id="signature-edit">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow={lc(c.featured.eyebrow)}
            title={
              <>
                {lc(c.featured.title)}{" "}
                <span className="text-mist/60">✦</span>
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
            <Reveal key={product.id} delay={index * 60}>
              <ProductCard product={product} priority={index < 2} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-bone-2/60 px-6 py-5 sm:flex-row">
          <p className="text-[12px] leading-relaxed text-ink/60">
            <span className="font-bold text-ink">{t("ann.2")}</span> · {t("ann.3")}
          </p>
          <Link to="/shop" className="link-underline inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
            {t("finder.shopAll")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
