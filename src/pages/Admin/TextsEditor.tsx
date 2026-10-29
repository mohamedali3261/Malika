import { Button } from "@/components/ui/Button";
import { Refresh, Search } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { dictTextKeys, inlineTexts } from "@/i18n/textCatalog";
import { dict } from "@/i18n/translations";
import { Section } from "@/pages/Admin/ContentFields";
import type { Localized } from "@/types";
import type { SiteContent } from "@/types/content";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";

type Edit = (mutate: (next: SiteContent) => void) => void;

interface TextItem {
  /** Dictionary key, or "i:" + English source for an inline text. */
  id: string;
  en: string;
  ar: string;
  area: AreaId;
}

type AreaId = "layout" | "home" | "shop" | "product" | "about" | "contact" | "cart" | "other";

const AREAS: { id: AreaId; en: string; ar: string }[] = [
  { id: "layout", en: "Header, menus & footer", ar: "الهيدر والقوائم والفوتر" },
  { id: "home", en: "Home page", ar: "الصفحة الرئيسية" },
  { id: "shop", en: "Shop page", ar: "صفحة المتجر" },
  { id: "product", en: "Product page & cards", ar: "صفحة المنتج والكروت" },
  { id: "about", en: "About page", ar: "صفحة من نحن" },
  { id: "contact", en: "Contact page", ar: "صفحة التواصل" },
  { id: "cart", en: "Cart & checkout", ar: "السلة وإتمام الطلب" },
  { id: "other", en: "Other", ar: "أخرى" },
];

const keyArea = (key: string): AreaId => {
  const group = key.split(".")[0];
  if (["nav", "brand", "lang", "common", "footer", "news", "ann"].includes(group)) return "layout";
  if (["hero", "marquee", "featured", "finder", "story", "stat", "pillars", "testi", "cta"].includes(group)) return "home";
  if (group === "shop") return "shop";
  if (group === "product") return "product";
  if (group === "about") return "about";
  if (group === "contact" || group === "faq") return "contact";
  if (group === "cart") return "cart";
  return "other";
};

const fileArea = (file: string): AreaId => {
  if (file.startsWith("components/layout")) return "layout";
  if (file.startsWith("components/cart")) return "cart";
  if (file.startsWith("components/product") || file.startsWith("pages/Product")) return "product";
  if (file.startsWith("pages/Home") || file.startsWith("components/perfume")) return "home";
  if (file.startsWith("pages/Shop")) return "shop";
  if (file.startsWith("pages/About")) return "about";
  if (file.startsWith("pages/Contact")) return "contact";
  return "other";
};

const ALL_ITEMS: TextItem[] = [
  ...dictTextKeys.map((id): TextItem => {
    const entry = (dict as Record<string, Localized>)[id];
    return { id, en: entry?.en ?? "", ar: entry?.ar ?? "", area: keyArea(id) };
  }),
  ...inlineTexts.map((item): TextItem => ({ id: "i:" + item.en, en: item.en, ar: item.ar, area: fileArea(item.file) })),
];

const MAX_ROWS = 80;

/**
 * Every visitor-facing sentence on the site — menus, buttons, the footer, the
 * About and Contact pages, the checkout — in one searchable list. Only the
 * differences from the built-in wording are stored.
 */
export function TextsEditor({ draft, edit, ar }: { draft: SiteContent; edit: Edit; ar: boolean }) {
  const { x } = useLang();
  const [query, setQuery] = useState("");
  const overrides = draft.textOverrides;
  const editedCount = Object.keys(overrides).length;

  const setText = (item: TextItem, side: "en" | "ar", value: string) =>
    edit((n) => {
      const current = n.textOverrides[item.id] ?? { en: item.en, ar: item.ar };
      const next = { ...current, [side]: value };
      if (next.en === item.en && next.ar === item.ar) delete n.textOverrides[item.id];
      else n.textOverrides[item.id] = next;
    });

  const reset = (id: string) => edit((n) => { delete n.textOverrides[id]; });

  const term = query.trim().toLowerCase();
  const matches = useMemo(
    () => (term ? ALL_ITEMS.filter((item) => `${item.id} ${item.en} ${item.ar}`.toLowerCase().includes(term)) : null),
    [term]
  );

  const row = (item: TextItem) => {
    const stored = overrides[item.id];
    const edited = Boolean(stored);
    const long = item.en.length > 72 || item.ar.length > 72;
    const Field = long ? "textarea" : "input";
    return (
      <div key={item.id} className={cn("mb-3 rounded-xl border p-3", edited ? "border-acid-deep/60 bg-acid/10" : "border-ink/10 bg-bone/60")}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-mist" dir="ltr">
            {item.id.startsWith("i:") ? x("Text on the page", "نص في الصفحة") : item.id}
          </span>
          {edited && (
            <button
              type="button"
              onClick={() => reset(item.id)}
              className="press inline-flex shrink-0 items-center gap-1 rounded-full border border-ink/15 px-2.5 py-1 text-[10px] font-bold text-ink/70 hover:border-ink/40"
            >
              <Refresh className="h-3 w-3" /> {x("Restore", "استعادة")}
            </button>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["en", "ar"] as const).map((side) => (
            <label key={side} className="block">
              <span className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-mist/70">{side === "en" ? "English" : "عربي"}</span>
              <Field
                dir={side === "en" ? "ltr" : "rtl"}
                rows={long ? 3 : undefined}
                value={stored && side in stored ? stored[side] : item[side]}
                onChange={(event: { target: { value: string } }) => setText(item, side, event.target.value)}
                className={cn("field", long && "resize-y")}
              />
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <p className="mb-3 rounded-lg bg-bone-2/60 px-3 py-2 text-[10.5px] leading-relaxed text-mist">
        {ar
          ? `${ALL_ITEMS.length} نصاً من نصوص الموقع: القوائم والأزرار والفوتر وصفحتا من نحن والتواصل والسلة. غيّر أي نص بالعربية أو الإنجليزية، وتبقى بقية النصوص كما هي. نصوص الاستوديو نفسه غير قابلة للتعديل عمداً حتى لا تُقفل على نفسك.`
          : `${ALL_ITEMS.length} pieces of site text: menus, buttons, the footer, the About and Contact pages, the cart. Change any of them in either language and the rest stay as they are. The studio's own wording is deliberately not editable, so a typo can never lock you out.`}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative block min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ar ? "ابحث في كل النصوص…" : "Search every text…"}
            className="field ps-10"
          />
        </label>
        <span className="rounded-full bg-bone-2 px-3 py-2 text-[11px] font-bold text-mist" dir="ltr">
          {editedCount} {ar ? "معدّل" : "edited"}
        </span>
        {editedCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (window.confirm(ar ? "استعادة كل النصوص الأصلية؟" : "Restore every text to the original wording?")) {
                edit((n) => { n.textOverrides = {}; });
              }
            }}
            icon={<Refresh className="h-3.5 w-3.5" />}
            iconPosition="start"
          >
            {ar ? "استعادة الكل" : "Restore all"}
          </Button>
        )}
      </div>

      {matches ? (
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-mist">
            {matches.length} {ar ? "نتيجة" : "results"}
            {matches.length > MAX_ROWS && (ar ? ` — يُعرض أول ${MAX_ROWS}` : ` — showing the first ${MAX_ROWS}`)}
          </p>
          {matches.slice(0, MAX_ROWS).map(row)}
          {matches.length === 0 && <p className="rounded-xl border border-dashed border-ink/15 py-8 text-center text-[12px] text-mist">{ar ? "لا نتائج." : "Nothing matches."}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {AREAS.map((area) => {
            const items = ALL_ITEMS.filter((item) => item.area === area.id);
            if (items.length === 0) return null;
            const edited = items.filter((item) => overrides[item.id]).length;
            return (
              <Section key={area.id} title={ar ? area.ar : area.en} badge={edited ? `${edited}/${items.length}` : `${items.length}`}>
                {items.map(row)}
              </Section>
            );
          })}
        </div>
      )}
    </div>
  );
}
