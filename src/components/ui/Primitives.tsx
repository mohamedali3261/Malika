import { useBrand } from "@/hooks/useBrand";
import { cn } from "@/utils/cn";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Star } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";


/* ---------- Portal (overlays must escape transformed page wrappers) ---------- */
export function Portal({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setHost(document.body);
  }, []);
  if (!host) return null;
  return createPortal(children, host);
}

/* ---------- Badge ---------- */
export function Badge({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: "ink" | "acid" | "lilac" | "bone" | "glass";
  className?: string;
}) {
  const tones = {
    ink: "bg-ink text-bone",
    acid: "bg-acid text-ink",
    lilac: "bg-lilac text-ink",
    bone: "bg-bone/90 text-ink",
    glass: "glass-dark text-bone border border-white/15",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Stars ---------- */
export function Stars({
  value,
  reviews,
  size = 12,
  light,
}: {
  value: number;
  reviews?: number;
  size?: number;
  light?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${value} / 5`}>
      <span className={cn("flex gap-0.5", light ? "text-acid" : "text-plum")}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            width={size}
            height={size}
            filled={value >= star - 0.25}
            className={value >= star - 0.25 ? "" : "opacity-30"}
          />
        ))}
      </span>
      <span dir="ltr" className={cn("text-[11px] font-semibold", light ? "text-bone/70" : "text-mist")}>
        {value.toFixed(1)}
        {reviews !== undefined && ` · ${reviews}`}
      </span>
    </span>
  );
}

/* ---------- Eyebrow ---------- */
export function Eyebrow({
  children,
  className,
  light,
}: {
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em]",
        light ? "text-bone/60" : "text-mist",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", light ? "bg-acid" : "bg-plum")} />
      {children}
    </span>
  );
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "start",
  dark,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: string;
  action?: ReactNode;
  align?: "start" | "center" | "between";
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "between" && "gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <Eyebrow light={dark}>{eyebrow}</Eyebrow>}
        <h2
          className={cn(
            "hd-section font-display mt-3 leading-[1.02] tracking-[-0.02em]",
            dark ? "text-bone" : "text-ink"
          )}
        >
          {title}
        </h2>
        {lead && (
          <p
            className={cn(
              "lead-copy mt-3 max-w-xl",
              dark ? "text-bone/65" : "text-mist",
              align === "center" && "mx-auto"
            )}
          >
            {lead}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------- Smart image ---------- */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-bone-2", className)}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
          className={cn(
            "h-full w-full object-cover transition-all duration-700 ease-out",
            loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.04] opacity-0 blur-sm",
            imgClassName
          )}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-bone-2 to-lilac-soft p-6 text-center">
          <span className="font-display text-2xl text-ink/50">{alt}</span>
        </div>
      )}
      {!loaded && <span className="absolute inset-0 animate-pulse bg-linear-to-br from-bone-2 to-[#ded6c8]" />}
    </div>
  );
}

/* ---------- Accordion ---------- */
export function Accordion({
  items,
  className,
  defaultOpen = 0,
}: {
  items: { title: string; body: ReactNode }[];
  className?: string;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className={cn("divide-y divide-ink/10 border-y border-ink/10", className)}>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.title}>
            <button
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-start"
              aria-expanded={isOpen}
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">{item.title}</span>
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300",
                  isOpen ? "rotate-45 border-ink bg-ink text-bone" : "border-ink/20 text-ink"
                )}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-6 pe-10 text-sm leading-relaxed text-mist">{item.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Logo ---------- */
export function Logo({ light, compact }: { light?: boolean; compact?: boolean }) {
  const { lang } = useLang();
  const { wordmark, descriptor } = useBrand();
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={cn(
          "relative grid h-10 w-10 place-items-center rounded-full border",
          light ? "border-bone/25 text-acid" : "border-ink/15 text-plum"
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.3}>
          <path d="M12 3v18M6.5 21h11M8.5 8.5 12 3l3.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="14" r="2.2" />
        </svg>
        <span className="absolute -end-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-acid" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[22px]",
              (lang === "ar" ? "tracking-normal" : "tracking-[0.28em]"),
              light ? "text-bone" : "text-ink"
            )}
          >
            {wordmark}
          </span>
          <span
            className={cn(
              "mt-1 text-[8px] font-semibold uppercase",
              (lang === "ar" ? "tracking-[0.24em]" : "tracking-[0.42em]"),
              light ? "text-bone/45" : "text-mist"
            )}
          >
            {descriptor}
          </span>
        </span>
      )}
    </span>
  );
}
