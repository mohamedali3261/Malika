import { Button } from "@/components/ui/Button";
import { Refresh } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { AddButton, BilingualField, NumberField, RepeatableItem, Toggle } from "@/pages/Admin/ContentFields";
import type { Localized } from "@/types";
import type { SiteContent } from "@/types/content";
import { cn } from "@/utils/cn";

type Edit = (mutate: (next: SiteContent) => void) => void;
type Dir = "left" | "right";

const blank = (): Localized => ({ en: "", ar: "" });

function DirectionPicker({ value, onChange }: { value: Dir; onChange: (next: Dir) => void }) {
  const { x } = useLang();
  return (
    <div className="mb-3 flex gap-2">
      {(["left", "right"] as const).map((direction) => (
        <button
          key={direction}
          type="button"
          onClick={() => onChange(direction)}
          aria-pressed={value === direction}
          className={cn(
            "flex-1 rounded-xl border px-3 py-2.5 text-[12px] font-bold transition",
            value === direction ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/60 hover:border-ink/40"
          )}
        >
          {direction === "left" ? x("← Moves left", "← تتحرك لليسار") : x("Moves right →", "تتحرك لليمين →")}
        </button>
      ))}
    </div>
  );
}

const arrow = (direction: Dir) => (direction === "left" ? "←" : "→");

/**
 * All three moving strips in one place: the announcement bar, the strip at the
 * foot of the hero and the scent-notes strip below it. Directions are literal
 * on-screen directions, so neighbours can be set to run against each other.
 */
export function StripsEditor({ draft, edit, ar }: { draft: SiteContent; edit: Edit; ar: boolean }) {
  const order = [
    { id: "announcement", on: draft.strips.announcement.enabled, dir: draft.strips.announcement.direction, name: ar ? "الشريط العلوي" : "Announcement" },
    { id: "hero", on: draft.strips.hero.enabled, dir: draft.strips.hero.direction, name: ar ? "شريط الهيرو" : "Hero" },
    { id: "notes", on: draft.marquee.enabled, dir: draft.marquee.direction, name: ar ? "شريط النوتات" : "Notes" },
  ].filter((strip) => strip.on);

  const clashes: string[] = [];
  for (let i = 0; i < order.length - 1; i += 1) {
    if (order[i].dir === order[i + 1].dir) clashes.push(`${order[i].name} / ${order[i + 1].name}`);
  }

  const alternate = () =>
    edit((n) => {
      n.strips.announcement.direction = "left";
      n.strips.hero.direction = "right";
      n.marquee.direction = "left";
    });

  return (
    <div>
      {/* overview */}
      <div className="mb-4 rounded-xl border border-ink/10 bg-bone p-3.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "الاتجاهات من الأعلى للأسفل" : "Directions, top to bottom"}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2" dir="ltr">
          {order.map((strip, index) => (
            <span key={strip.id} className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-bone">
                {strip.name}
                <span className="text-acid">{arrow(strip.dir)}</span>
              </span>
              {index < order.length - 1 && <span className="text-mist">·</span>}
            </span>
          ))}
        </div>
        <p
          className={cn(
            "mt-2.5 rounded-lg px-3 py-2 text-[10.5px] leading-relaxed",
            clashes.length === 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
          )}
        >
          {clashes.length === 0
            ? ar ? "كل شريطين متجاورين يتحركان عكس بعضهما." : "Every pair of neighbouring strips runs against each other."
            : ar ? `هذه الأشرطة المتجاورة تتحرك في نفس الاتجاه: ${clashes.join("، ")}` : `These neighbours move the same way: ${clashes.join(", ")}`}
        </p>
        <Button type="button" size="sm" variant="outline" className="mt-3" onClick={alternate} icon={<Refresh className="h-3.5 w-3.5" />} iconPosition="start">
          {ar ? "اجعلها متعاكسة" : "Make them alternate"}
        </Button>
      </div>

      {/* 1 — announcement */}
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">{ar ? "١) الشريط العلوي (الإعلانات)" : "1 · Announcement bar"}</p>
      <Toggle
        label={ar ? "إظهار الشريط العلوي" : "Show the announcement bar"}
        checked={draft.strips.announcement.enabled}
        onChange={(v) => edit((n) => { n.strips.announcement.enabled = v; })}
      />
      <NumberField label={ar ? "السرعة" : "Speed"} value={draft.strips.announcement.speed} min={10} max={200} step={2} suffix=" px/s" onChange={(v) => edit((n) => { n.strips.announcement.speed = v; })} />
      <DirectionPicker value={draft.strips.announcement.direction} onChange={(v) => edit((n) => { n.strips.announcement.direction = v; })} />
      {draft.announcements.map((item, index) => (
        <RepeatableItem key={index} index={index} onRemove={() => edit((n) => { n.announcements.splice(index, 1); })}>
          <BilingualField label={ar ? "الرسالة" : "Message"} value={item} onChange={(v) => edit((n) => { n.announcements[index] = v; })} />
        </RepeatableItem>
      ))}
      <AddButton label={ar ? "إضافة رسالة" : "Add message"} onClick={() => edit((n) => { n.announcements.push(blank()); })} />

      {/* 2 — hero strip */}
      <p className="mb-2 mt-7 border-t border-ink/10 pt-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">{ar ? "٢) شريط الهيرو" : "2 · Hero strip"}</p>
      <Toggle label={ar ? "إظهار شريط الهيرو" : "Show the hero strip"} checked={draft.strips.hero.enabled} onChange={(v) => edit((n) => { n.strips.hero.enabled = v; })} />
      <NumberField label={ar ? "السرعة" : "Speed"} value={draft.strips.hero.speed} min={10} max={200} step={2} suffix=" px/s" onChange={(v) => edit((n) => { n.strips.hero.speed = v; })} />
      <DirectionPicker value={draft.strips.hero.direction} onChange={(v) => edit((n) => { n.strips.hero.direction = v; })} />
      {draft.strips.hero.items.map((item, index) => (
        <RepeatableItem key={index} index={index} onRemove={() => edit((n) => { n.strips.hero.items.splice(index, 1); })}>
          <BilingualField label={ar ? "الكلمة" : "Word"} value={item} onChange={(v) => edit((n) => { n.strips.hero.items[index] = v; })} />
        </RepeatableItem>
      ))}
      <AddButton label={ar ? "إضافة كلمة" : "Add word"} onClick={() => edit((n) => { n.strips.hero.items.push(blank()); })} />

      {/* 3 — notes strip */}
      <p className="mb-2 mt-7 border-t border-ink/10 pt-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">{ar ? "٣) شريط النوتات العطرية" : "3 · Scent-notes strip"}</p>
      <Toggle label={ar ? "إظهار شريط النوتات" : "Show the notes strip"} checked={draft.marquee.enabled} onChange={(v) => edit((n) => { n.marquee.enabled = v; })} />
      <NumberField label={ar ? "السرعة" : "Speed"} value={draft.marquee.speed} min={10} max={200} step={2} suffix=" px/s" onChange={(v) => edit((n) => { n.marquee.speed = v; })} />
      <DirectionPicker value={draft.marquee.direction} onChange={(v) => edit((n) => { n.marquee.direction = v; })} />
      <BilingualField label={ar ? "العبارة أسفل الشريط" : "Caption under the strip"} value={draft.marquee.caption} onChange={(v) => edit((n) => { n.marquee.caption = v; })} />
      {draft.marquee.items.map((item, index) => (
        <RepeatableItem key={index} index={index} onRemove={() => edit((n) => { n.marquee.items.splice(index, 1); })}>
          <BilingualField label={ar ? "النوتة" : "Note"} value={item} onChange={(v) => edit((n) => { n.marquee.items[index] = v; })} />
        </RepeatableItem>
      ))}
      <AddButton label={ar ? "إضافة نوتة" : "Add note"} onClick={() => edit((n) => { n.marquee.items.push(blank()); })} />
    </div>
  );
}
