import { useBrand } from "@/hooks/useBrand";
import { Marquee } from "@/components/ui/Marquee";
import { Sparkle } from "@/components/ui/icons";
import { useContent } from "@/hooks/useContent";

export function NotesMarquee() {
  const { c, lc } = useContent();
  const { wordmark } = useBrand();
  const { marquee } = c;

  if (!marquee.enabled || marquee.items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-acid py-5 text-ink sm:py-6">
      {/* Oversized ghost wordmark behind the strip. */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center opacity-[0.07]">
        <span className="font-display whitespace-nowrap text-[18vw] leading-none sm:text-[14vw]">
          {wordmark} · {wordmark}
        </span>
      </div>

      <Marquee
        speed={marquee.speed}
        direction={marquee.direction}
        className="relative"
        trackClassName="py-0.5"
      >
        {marquee.items.map((note, index) => (
          <span key={`${note.en}-${index}`} className="flex shrink-0 items-center gap-4 px-4 sm:gap-5 sm:px-5">
            <span
              className={`font-display whitespace-nowrap text-[1.6rem] italic leading-none sm:text-[2rem] ${
                index % 3 === 1 ? "text-outline" : ""
              }`}
            >
              {lc(note)}
            </span>
            <Sparkle className="h-3 w-3 shrink-0 text-ink/45 sm:h-3.5 sm:w-3.5" />
          </span>
        ))}
      </Marquee>

      <div className="relative mt-3 flex items-center justify-center gap-3 px-4 text-center">
        <span className="h-px w-6 bg-ink/30 sm:w-8" />
        <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-ink/60 sm:tracking-[0.3em]">
          {lc(marquee.caption)}
        </p>
        <span className="h-px w-6 bg-ink/30 sm:w-8" />
      </div>
    </section>
  );
}
