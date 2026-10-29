import { SmartImage } from "@/components/ui/Primitives";
import { useLang } from "@/i18n/LanguageContext";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { Sparkle } from "@/components/ui/icons";

export function Gallery({ product }: { product: Product }) {
  const { l, x } = useLang();
  const images = product.images.length > 0 ? product.images : [];
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-[1.8rem] border border-ink/8 p-3 sm:rounded-[2.2rem] sm:p-4"
        style={{ background: `linear-gradient(150deg, ${product.accent}55, #efe9dd)` }}
      >
        <SmartImage
          key={images[active]}
          src={images[active] ?? ""}
          alt={l(product.name)}
          priority
          className="aspect-[4/5] w-full rounded-[1.3rem] sm:rounded-[1.7rem]"
        />
        <div className="pointer-events-none absolute inset-4 rounded-[1.3rem] ring-1 ring-inset ring-white/25 sm:rounded-[1.7rem]" />
        <div className="absolute start-6 top-6 flex items-center gap-1.5 rounded-full bg-bone/90 px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.16em] text-ink backdrop-blur">
          <Sparkle className="h-2.5 w-2.5 text-plum" /> {l({ en: "Atelier image", ar: "صورة الورشة" })}
        </div>
        <div dir="ltr" className="absolute end-6 top-6 rounded-full bg-ink/80 px-2.5 py-1.5 text-[9px] font-bold text-bone backdrop-blur">
          {String(active + 1).padStart(2, "0")} / {String(Math.max(images.length, 1)).padStart(2, "0")}
        </div>
        <div className="pointer-events-none absolute -bottom-4 -end-4 h-24 w-24 rounded-full bg-acid/80 blur-2xl" />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setActive(index)}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 p-1 transition-all duration-300",
              active === index ? "border-ink bg-ink/5" : "border-transparent bg-bone-2/60 opacity-70 hover:opacity-100"
            )}
            aria-label={`${l(product.name)} ${index + 1}`}
            aria-pressed={active === index}
          >
            <SmartImage src={image} alt="" className="aspect-square w-full rounded-lg" />
          </button>
        ))}
        <div className="hidden items-center justify-center rounded-xl border border-dashed border-ink/15 p-2 text-center text-[8.5px] font-semibold uppercase leading-tight tracking-[0.1em] text-mist sm:flex">
          {x("handmade in Cairo", "صُنع يدوياً في القاهرة")}
        </div>
      </div>
    </div>
  );
}
