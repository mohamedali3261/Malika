import { Button } from "@/components/ui/Button";
import { Check, Eye, Refresh } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { Link } from "@/lib/router";
import type { SiteContent } from "@/types/content";
import { draftsChanged, registerDraft } from "@/lib/studioDrafts";
import { useEffect, useRef, useState } from "react";

export function ContentEditor() {
  const { content, updateContent, resetContent } = useStore();
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
    { key: "offers", label: ar ? "عروض ڨلور — الباقات" : "VLOR Offers", hint: ar ? "باقات بسعر واحد" : "Bundled sets" },
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

      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <h3 className="text-sm font-bold">{ar ? "إظهار / إخفاء أقسام الصفحة الرئيسية" : "Show / hide home sections"}</h3>
        <p className="mt-1 text-xs leading-relaxed text-mist">{ar ? "اضغط لإخفاء أي قسم فوراً. لا توجد إعدادات أخرى هنا — كل شيء أصبح أبسط." : "Tap to hide any section instantly. No other settings here — everything is simpler."}</p>

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

      <p className="mt-3 text-center text-[11px] text-mist">{ar ? "تم تبسيط صفحة المحتوى حسب طلبك — فقط أزرار الإخفاء." : "Content page simplified as requested — toggles only."}</p>
    </div>
  );
}
