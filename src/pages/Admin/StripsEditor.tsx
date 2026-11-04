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

/**
 * Announcement bar editor (top moving strip).
 */
export function StripsEditor({ draft, edit, ar }: { draft: SiteContent; edit: Edit; ar: boolean }) {
  return (
    <div>
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
    </div>
  );
}
