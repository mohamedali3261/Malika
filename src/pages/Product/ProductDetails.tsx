import { Accordion } from "@/components/ui/Primitives";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";

export function ProductDetails({ product }: { product: Product }) {
  const { t, l, x } = useLang();

  const items = [
    {
      title: t("product.story"),
      body: (
        <div className="space-y-3">
          <p>{l(product.story)}</p>
          <p className="text-[12px] text-mist">
            {x("A concentrated 30% extrait — blended and hand-filled in our Cairo atelier. Ingredients: perfumer's alcohol, water, natural and certified synthetic fragrance oils.", "إكستريه مركّز بنسبة ٣٠٪ — يُصنع ويُعبأ يدوياً في ورشتنا بالقاهرة. المكونات: كحول عطري، ماء، زيوت عطرية طبيعية وصناعية معتمدة.")}
          </p>
        </div>
      ),
    },
    {
      title: t("product.wear"),
      body: (
        <div className="space-y-2">
          <p>
            {x("One spray on each side of the neck, one on the wrist. Do not rub — let it dry down on your skin.", "رشّة واحدة على كل جهة من الرقبة، وواحدة على المعصم. لا تفرك — اتركه يجف على بشرتك.")}
          </p>
          <p>
            {x("For extra trail: mist lightly on clothing or hair straight after a shower.", "لحضور أطول: رشّ القليل على الملابس أو الشعر بعد الاستحمام مباشرة.")}
          </p>
        </div>
      ),
    },
    {
      title: t("product.shipping"),
      body: (
        <div className="space-y-2">
          <p>
            {x("Delivery within 1–4 working days across Egypt. Orders above EGP 2,000 ship free. Cash on delivery available.", "التوصيل خلال ١–٤ أيام عمل لكل المحافظات. الطلبات فوق ٢٠٠٠ ج.م توصيلها مجاني. الدفع عند الاستلام متاح.")}
          </p>
          <p>
            {x("Exchange within 7 days on sealed bottles. Opened perfumes cannot be exchanged for hygiene reasons.", "استبدال خلال ٧ أيام للعبوات غير المفتوحة. العطور المفتوحة غير قابلة للاستبدال لأسباب صحية.")}
          </p>
        </div>
      ),
    },
  ];

  return <Accordion items={items} defaultOpen={0} />;
}
