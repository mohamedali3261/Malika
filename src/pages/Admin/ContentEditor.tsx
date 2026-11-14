import { Button } from "@/components/ui/Button";
import { Check, Eye, Refresh } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { Link } from "@/lib/router";
import { siteBackground } from "@/lib/theme";
import { Section } from "@/pages/Admin/ContentFields";
import { ShowcaseEditor } from "@/pages/Admin/ShowcaseEditor";
import type { SiteContent } from "@/types/content";
import { draftsChanged, registerDraft } from "@/lib/studioDrafts";
import { useEffect, useRef, useState } from "react";

export function ContentEditor({ onManageProducts }: { onManageProducts?: () => void }) {
  const { content, products, updateContent, resetContent } = useStore();
  const { t, lang } = useLang();
  const { push } = useToast();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [dirty, setDirty] = useState(false);
  const ar = lang === "ar";

  useEffect(() => {
    setDraft(content);
    setDirty(false);
  }, [content]);

  const live = useRef({ draft, dirty, updateContent });
  live.current = { draft, dirty, updateContent };
  useEffect(() => registerDraft({
    isDirty: () => live.current.dirty,
    commit: () => { live.current.updateContent(live.current.draft); return { content: live.current.draft }; },
  }), []);
  useEffect(() => { draftsChanged(); }, [dirty]);

  const edit = (mutate: (next: SiteContent) => void) => {
    setDraft((prev) => {
      const next: SiteContent = structuredClone(prev);
      mutate(next);
      return next;
    });
    setDirty(true);
  };

  const save = () => {
    updateContent(draft);
    setDirty(false);
    push(ar ? "تم حفظ محتوى الموقع." : "Site content saved.");
  };
  const reset = () => {
    if (!window.confirm(ar ? "استعادة كل الأقسام الأصلية؟" : "Restore all sections?")) return;
    resetContent();
    push(ar ? "تمت استعادة المحتوى." : "Content restored.", "info");
  };

  const sections: { key: keyof SiteContent["sections"]; label: string; hint: string }[] = [
    { key: "runwayLookbook", label: ar ? "منصّة العرض (Runway)" : "Runway lookbook", hint: ar ? "سلايدر المنتجات العلوي" : "Top product slider" },
    { key: "showcase", label: ar ? "كارت الصور" : "Image card", hint: ar ? "حتى ٥ صور" : "Up to 5 images" },
    { key: "featured", label: ar ? "المنتجات المميزة" : "Featured products", hint: ar ? "المختارة" : "Picked" },
    { key: "story", label: ar ? "حكايتنا" : "Our story", hint: ar ? "قسم القصة" : "Story block" },
    { key: "contactCta", label: ar ? "دعوة التواصل" : "Contact CTA", hint: ar ? "آخر الصفحة" : "Bottom CTA" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="sticky top-[76px] z-20 -mx-1 mb-4 flex items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-bone px-3 py-2 shadow-[0_8px_24px_-18px_rgba(20,16,25,0.6)]">
        <p className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-mist">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dirty ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`} />
          <span className="truncate">{dirty ? (ar ? "تعديلات غير محفوظة" : "Unsaved edits") : ar ? "كل شيء محفوظ" : "All saved"}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button to="/" size="sm" variant="ghost" icon={<Eye className="h-3.5 w-3.5" />} iconPosition="start"><span className="max-sm:hidden">{ar ? "معاينة" : "Preview"}</span></Button>
          <Button size="sm" variant="outline" onClick={reset} icon={<Refresh className="h-3.5 w-3.5" />} iconPosition="start"><span className="max-sm:hidden">{ar ? "استعادة الأصل" : "Restore"}</span></Button>
          <Button size="sm" variant="acid" onClick={save} disabled={!dirty} icon={<Check className="h-3.5 w-3.5" />} iconPosition="start">{ar ? "حفظ" : "Save"}</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-surface p-5">
        <h3 className="text-sm font-bold">{ar ? "إظهار / إخفاء أقسام الصفحة الرئيسية" : "Show / hide home sections"}</h3>
        <p className="mt-1 text-xs leading-relaxed text-mist">{ar ? "أظهر أو أخفِ أقسام الرئيسية، وعدّل صور كارت العرض وبطاقات العطور من أدوات الإدارة أدناه." : "Show or hide home sections, then manage the image showcase and product cards with the tools below."}</p>

        <div className="mt-5 grid gap-2">
          {sections.map((s) => {
            const on = Boolean(draft.sections[s.key]);
            return (
              <label key={s.key} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition ${on ? "border-ink bg-ink text-bone" : "border-ink/10 bg-bone-2/40 text-ink hover:border-ink/20"}`}>
                <div>
                  <p className={`text-sm font-bold ${on ? "text-bone" : "text-ink"}`}>{s.label}</p>
                  <p className={`text-xs ${on ? "text-bone/60" : "text-mist"}`}>{s.hint}</p>
                </div>
                <span className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${on ? "text-acid" : "text-mist"}`}>{on ? (ar ? 'ظاهر' : 'Visible') : (ar ? 'مخفي' : 'Hidden')}</span>
                  <input type="checkbox" checked={on} onChange={(e) => edit((n) => { (n.sections as any)[s.key] = e.target.checked; })} className="h-5 w-9 appearance-none rounded-full bg-ink/15 p-0.5 transition checked:bg-acid" />
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-4">
          <Button variant="acid" onClick={save} disabled={!dirty} icon={<Check className="h-4 w-4" />} iconPosition="start">{ar ? "حفظ التغييرات" : "Save changes"}</Button>
          <Link to="/" className="text-xs font-bold text-plum underline decoration-acid decoration-2 underline-offset-4">{ar ? "معاينة الموقع ↗" : "Preview storefront ↗"}</Link>
          <span className="text-xs text-mist">{t("admin.dirtyNote")}</span>
        </div>
      </div>

      <div className="mt-3">
        <Section
          title={ar ? "ألوان الموقع" : "Site colours"}
          description={ar ? "اختر ألوان الموقع؛ درجات الخلفيات وبطاقات المنتجات تتناسق معها تلقائياً. احفظ ثم انشر لتظهر للزوار." : "Choose the site palette; backgrounds and product card shades follow automatically. Save and publish to make changes visible to visitors."}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { key: "ink", label: ar ? "النص واللون الداكن" : "Text and dark colour" },
              { key: "bone", label: ar ? "اللون الفاتح الأساسي" : "Base light colour" },
              { key: "accent", label: ar ? "لون التمييز والأزرار" : "Accent and buttons" },
              { key: "lilac", label: ar ? "اللون الثانوي" : "Secondary colour" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-bone/50 p-3">
                <input
                  type="color"
                  value={draft.theme[key]}
                  onChange={(event) => edit((next) => { next.theme[key] = event.target.value; })}
                  className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-ink/15 bg-surface p-1"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-ink">{label}</span>
                  <span dir="ltr" className="mt-1 block text-[11px] text-mist">{draft.theme[key].toUpperCase()}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-5 border-t border-ink/10 pt-4">
            <h4 className="text-sm font-bold">{ar ? "خلفية الموقع" : "Site background"}</h4>
            <p className="mt-1 text-xs leading-relaxed text-mist">{ar ? "اختر خلفية الموقع في الوضع النهاري، مع لون متباين للنص حتى يبقى واضحاً." : "Choose the day mode background and a contrasting text colour for readability."}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {([
                { key: "backgroundLight", mode: "light", label: ar ? "لون الخلفية" : "Background colour" },
              ] as const).map(({ key, mode, label }) => (
                <div key={key} className="rounded-xl border border-ink/10 bg-bone/50 p-3">
                  <label className="flex items-center gap-3">
                    <input type="color" value={siteBackground(draft.theme, mode)}
                      onChange={(event) => edit((next) => { next.theme[key] = event.target.value; })}
                      className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-ink/15 bg-surface p-1" />
                    <span>
                      <span className="block text-xs font-bold text-ink">{label}</span>
                      <span dir="ltr" className="mt-1 block text-[11px] text-mist">{siteBackground(draft.theme, mode).toUpperCase()}</span>
                    </span>
                  </label>
                  {draft.theme[key] && <button type="button" className="mt-2 text-xs font-bold text-ink underline underline-offset-4"
                    onClick={() => edit((next) => { delete next.theme[key]; })}>
                    {ar ? "استخدام الدرجة التلقائية" : "Use automatic shade"}
                  </button>}
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-3">
        <Section
          title={ar ? "بطاقات العرض المصوّرة في الرئيسية" : "Homepage image showcase cards"}
          description={ar ? "أضف أو عدّل أو احذف الصور التي تظهر في كارت العرض." : "Add, edit or remove the images shown in the homepage showcase."}
          badge={`${draft.showcase.images.length}/5`}
        >
          <ShowcaseEditor
            value={draft.showcase}
            products={products}
            onChange={(value) => edit((next) => { next.showcase = value; })}
          />
        </Section>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface p-4">
        <div>
          <h3 className="text-sm font-bold">{ar ? "بطاقات العطور في الرئيسية والمتجر" : "Product cards on the homepage and shop"}</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-mist">
            {ar ? "من تبويب المنتجات أضف أو عدّل أو احذف العطور، وافتح الرئيسية أو المتجر لتصفية بطاقات كل صفحة. من نموذج العطر اختر الصفحات التي يظهر فيها." : "In the Products tab, add, edit or delete scents. Filter by Homepage or Shop to manage each page, then choose card visibility in the product form."}
          </p>
        </div>
        {onManageProducts && (
          <Button variant="outline" onClick={() => { if (dirty) save(); onManageProducts(); }}>
            {ar ? "إدارة كروت المنتجات" : "Manage product cards"}
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-mist">{ar ? "لا تنسَ حفظ التغييرات قبل النشر." : "Remember to save your changes before publishing."}</p>
    </div>
  );
}
