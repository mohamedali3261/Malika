import { useContent } from "@/hooks/useContent";
import { Marquee } from "@/components/ui/Marquee";
import { Sparkle } from "@/components/ui/icons";

export function Announcement() {
  const { c, lc } = useContent();
  const strip = c.strips.announcement;
  const messages = c.announcements.filter((item) => lc(item).trim().length > 0);

  if (!strip.enabled || messages.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-ink text-bone">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(201,181,247,0.22),transparent_55%)]" />
      <Marquee
        speed={strip.speed}
        direction={strip.direction}
        pauseOnHover={false}
        draggable={false}
        className="relative h-9"
        trackClassName="h-9"
      >
        {messages.map((message, index) => (
          <span
            key={`${message.en}-${index}`}
            className="flex shrink-0 items-center gap-3 px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-bone/70"
          >
            <Sparkle className="h-3 w-3 shrink-0 text-acid" />
            <span className="whitespace-nowrap">{lc(message)}</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
