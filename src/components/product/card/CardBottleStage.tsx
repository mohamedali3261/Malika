import { useLang } from "@/i18n/LanguageContext";
import { Link } from "@/lib/router";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import type { CSSProperties } from "react";

interface CardBottleStageProps {
  product: Product;
  image: string;
  watermark: string;
  tilt: { idle: number; open: number };
  priority?: boolean;
  dense?: boolean;
  onImageError: () => void;
}

export function CardBottleStage({
  product,
  image,
  watermark,
  tilt,
  priority,
  dense,
  onImageError,
}: CardBottleStageProps) {
  const { l } = useLang();

  return (
    <>
      {/* Accent disc — expands smoothly out of the top corner on hover / touch */}
      <span
        aria-hidden="true"
        className="m-disc-orb-pulse absolute inset-0 transition-[clip-path] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [clip-path:circle(96px_at_80%_17%)] group-hover/card:[clip-path:circle(235px_at_80%_-14%)] touch:[clip-path:circle(215px_at_80%_-16%)] rtl:[clip-path:circle(96px_at_20%_17%)] rtl:group-hover/card:[clip-path:circle(235px_at_20%_-14%)] rtl:touch:[clip-path:circle(215px_at_20%_-16%)]"
        style={{ background: product.accent }}
      />

      {/* Specular 3D glare layer driven by pointer position */}
      <span aria-hidden="true" className="m-tilt-3d-glare absolute inset-0 z-10 rounded-[inherit]" />

      {/* Oversized scent watermark with subtle hover parallax */}
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute top-[24%] -start-[10%] select-none whitespace-nowrap text-[5rem] font-extrabold italic leading-none text-bone/[0.065] transition-transform duration-700 ease-out group-hover/card:-translate-x-2.5 sm:text-[5.8rem]"
      >
        {watermark}
      </span>

      {/* Bottle cutout — crisp, compact, lifts neatly on hover */}
      <Link
        to={`/product/${product.slug}`}
        aria-label={l(product.name)}
        className={cn(
          "absolute top-[42%] z-20 block w-full -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:top-[6px] group-hover/card:translate-y-0 touch:top-[6px] touch:translate-y-0",
          dense ? "h-[138px] sm:h-[148px]" : "h-[150px] sm:h-[168px]"
        )}
      >
        <img
          src={image}
          alt={l(product.name)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onError={onImageError}
          style={{ "--tilt": `${tilt.idle}deg`, "--tilt-open": `${tilt.open}deg` } as CSSProperties}
          className={cn(
            "absolute start-1/2 top-1/2 w-auto max-w-none -translate-x-1/2 -translate-y-1/2 rotate-(--tilt) object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.46)] transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:rotate-(--tilt-open) group-hover/card:scale-[0.76] touch:rotate-(--tilt-open) touch:scale-[0.75] rtl:translate-x-1/2",
            dense ? "h-[150px] sm:h-[164px]" : "h-[164px] sm:h-[186px]"
          )}
        />
        {/* Subtle breathing contact shadow */}
        <span
          aria-hidden="true"
          className="m-bottle-shadow-breathe pointer-events-none absolute bottom-1 start-1/2 h-2.5 w-16 -translate-x-1/2 rounded-full bg-black/40 blur-xs transition-opacity duration-300 group-hover/card:opacity-20 rtl:translate-x-1/2"
        />
      </Link>
    </>
  );
}
