import { Button } from "@/components/ui/Button";
import { Check } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import type { SiteSettings } from "@/types";
import { draftsChanged, registerDraft } from "@/lib/studioDrafts";
import { useEffect, useRef, useState } from "react";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[9px] text-mist/80">{hint}</span>}
    </label>
  );
}

export function StoreSettingsForm({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => void;
}) {
  const { t, lang } = useLang();
  const [draft, setDraft] = useState<SiteSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  // Let the Publish button see — and save — edits that are still in this form.
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);
  const live = useRef({ draft, changed, onSave });
  live.current = { draft, changed, onSave };
  useEffect(
    () =>
      registerDraft({
        isDirty: () => live.current.changed,
        commit: () => {
          live.current.onSave(live.current.draft);
          return { settings: live.current.draft };
        },
      }),
    []
  );
  useEffect(() => {
    draftsChanged();
  }, [changed]);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-ink/10 bg-white/40 p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mist">{t("admin.contactSection")}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-mist">
          {lang === "ar"
            ? "كل أزرار الطلب والتواصل في الموقع تقرأ من هنا. استخدم رقم واتساب بصيغة دولية بدون +."
            : "Every order and contact button on the storefront reads from here. Use WhatsApp numbers in international format without +."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="WhatsApp number" hint="e.g. 201234567890">
            <input value={draft.whatsapp} onChange={(event) => set("whatsapp", event.target.value)} className="field" dir="ltr" inputMode="tel" />
          </Field>
          <Field label="Messenger username" hint="facebook.com/yourpage → malika.perfumes">
            <input value={draft.messenger} onChange={(event) => set("messenger", event.target.value)} className="field" dir="ltr" />
          </Field>
          <Field label="Instagram handle">
            <input value={draft.instagram} onChange={(event) => set("instagram", event.target.value)} className="field" dir="ltr" />
          </Field>
          <Field label="Email">
            <input type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} className="field" dir="ltr" />
          </Field>
          <Field label="Display phone">
            <input value={draft.phone} onChange={(event) => set("phone", event.target.value)} className="field" dir="ltr" />
          </Field>
          <Field label="Free shipping threshold (EGP)">
            <input type="number" min={0} value={draft.freeShippingThreshold} onChange={(event) => set("freeShippingThreshold", Number(event.target.value))} className="field" dir="ltr" />
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-white/40 p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-mist">{t("admin.brandSection")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Address (English)">
            <input value={draft.address.en} onChange={(event) => set("address", { ...draft.address, en: event.target.value })} className="field" dir="ltr" />
          </Field>
          <Field label="العنوان (عربي)">
            <input value={draft.address.ar} onChange={(event) => set("address", { ...draft.address, ar: event.target.value })} className="field" dir="rtl" />
          </Field>
          <Field label="Hours (English)">
            <input value={draft.hours.en} onChange={(event) => set("hours", { ...draft.hours, en: event.target.value })} className="field" dir="ltr" />
          </Field>
          <Field label="المواعيد (عربي)">
            <input value={draft.hours.ar} onChange={(event) => set("hours", { ...draft.hours, ar: event.target.value })} className="field" dir="rtl" />
          </Field>
        </div>
      </div>

      <Button onClick={() => onSave(draft)} variant="acid" className="mt-5" icon={<Check className="h-4 w-4" />} iconPosition="start">
        {lang === "ar" ? "حفظ بيانات المتجر" : "Save storefront details"}
      </Button>
    </div>
  );
}
