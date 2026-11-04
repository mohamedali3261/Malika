import { Accordion } from "@/components/ui/Primitives";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";

export function ProductDetails({ product }: { product: Product }) {
  const { t, l, x } = useLang();

  const items = [
    {
      title: t("product.story"),
      body: <p>{l(product.story)}</p>,
    },
    {
      title: t("product.shipping"),
      body: (
        <p>
          {x(
            "Delivery within 1–4 working days across Egypt. Free shipping above EGP 2,000, with cash on delivery available.",
            "التوصيل خلال ١–٤ أيام عمل لكل المحافظات، مجاناً للطلبات فوق ٢٠٠٠ ج.م مع الدفع عند الاستلام."
          )}
        </p>
      ),
    },
  ];

  return <Accordion items={items} defaultOpen={0} />;
}
