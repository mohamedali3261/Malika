import { Button } from "@/components/ui/Button";
import { Check, Eye, Refresh } from "@/components/ui/icons";
import {
  AddButton,
  BilingualField,
  ColorField,
  NumberField,
  RepeatableItem,
  Section,
  TextField,
  Toggle,
} from "@/pages/Admin/ContentFields";
import { ShowcaseEditor } from "@/pages/Admin/ShowcaseEditor";
import { StripsEditor } from "@/pages/Admin/StripsEditor";
import { TextsEditor } from "@/pages/Admin/TextsEditor";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { Link } from "@/lib/router";
import type { Localized } from "@/types";
import type { SiteContent } from "@/types/content";
import { SCALE_LIMITS, applyScale, type ScaleKey } from "@/lib/scale";
import { draftsChanged, registerDraft } from "@/lib/studioDrafts";
import { useEffect, useRef, useState } from "react";

const emptyLocalized: Localized = { en: "", ar: "" };
const uid = () => Math.random().toString(36).slice(2, 8);

/**
 * Full control over every piece of storefront copy, the marquee, section
 * visibility and the theme. Edits are held locally until "Save", then written
 * to the store (and flagged for GitHub publishing).
 */
export function ContentEditor() {
  const { content, updateContent, resetContent, products } = useStore();
  const { t, lang } = useLang();
  const { push } = useToast();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(content);
    setDirty(false);
  }, [content]);

  // Live preview. The site itself restyles while a slider moves; leaving the
  // editor (or saving) puts back whatever is actually stored.
  const { headingScale, bodyScale, sectionSpacing } = draft.theme;
  useEffect(() => {
    applyScale({ headingScale, bodyScale, sectionSpacing });
  }, [headingScale, bodyScale, sectionSpacing]);
  // Only on leaving the editor. Depending on `content.theme` here would also
  // fire after every save and overwrite the new values with the old ones.
  const savedTheme = useRef(content.theme);
  savedTheme.current = content.theme;
  useEffect(() => () => applyScale(savedTheme.current), []);

  // Let the Publish button see — and save — edits that are still in this editor.
  const live = useRef({ draft, dirty, updateContent });
  live.current = { draft, dirty, updateContent };
  useEffect(
    () =>
      registerDraft({
        isDirty: () => live.current.dirty,
        commit: () => {
          const { draft: current, updateContent: save } = live.current;
          save(current);
          return { content: current };
        },
      }),
    []
  );
  useEffect(() => {
    draftsChanged();
  }, [dirty]);

  const edit = (mutate: (next: SiteContent) => void) => {
    setDraft((previous) => {
      const next: SiteContent = structuredClone(previous);
      mutate(next);
      return next;
    });
    setDirty(true);
  };

  const save = () => {
    updateContent(draft);
    setDirty(false);
    push(lang === "ar" ? "تم حفظ محتوى الموقع." : "Site content saved.");
  };

  const reset = () => {
    if (!window.confirm(lang === "ar" ? "استعادة كل النصوص الأصلية؟" : "Restore all original content?")) return;
    resetContent();
    push(lang === "ar" ? "تمت استعادة المحتوى." : "Content restored.", "info");
  };

  const ar = lang === "ar";

  return (
    <div className="max-w-4xl">
      {/* sticky action bar */}
      <div className="sticky top-[76px] z-20 -mx-1 mb-4 flex items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-bone px-3 py-2 shadow-[0_8px_24px_-18px_rgba(20,16,25,0.6)]">
        <p className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-mist">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dirty ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`} />
          <span className="truncate">
            {dirty ? (ar ? "تعديلات غير محفوظة" : "Unsaved edits") : ar ? "كل شيء محفوظ" : "All saved"}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button to="/" size="sm" variant="ghost" aria-label={ar ? "معاينة" : "Preview"} icon={<Eye className="h-3.5 w-3.5" />} iconPosition="start">
            <span className="max-sm:hidden">{ar ? "معاينة" : "Preview"}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={reset} aria-label={ar ? "استعادة الأصل" : "Restore defaults"} icon={<Refresh className="h-3.5 w-3.5" />} iconPosition="start">
            <span className="max-sm:hidden">{ar ? "استعادة الأصل" : "Restore defaults"}</span>
          </Button>
          <Button size="sm" variant="acid" onClick={save} disabled={!dirty} icon={<Check className="h-3.5 w-3.5" />} iconPosition="start">
            {ar ? "حفظ" : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {/* ---------------- sections on/off ---------------- */}
        <Section
          title={ar ? "أقسام الصفحة الرئيسية" : "Home page sections"}
          description={ar ? "أظهر أو أخفِ أي قسم فوراً." : "Show or hide any section instantly."}
          defaultOpen
        >
          {(
            [
              ["marquee", ar ? "الشريط المتحرك" : "Moving strip"],
              ["showcase", ar ? "كارت الصور" : "Image card"],
              ["featured", ar ? "المنتجات المميزة" : "Featured products"],
              ["perfume3d", ar ? "تجربة الزجاجة ثلاثية الأبعاد" : "3D bottle experience"],
              ["scentFinder", ar ? "اكتشف عطرك" : "Scent finder"],
              ["story", ar ? "حكايتنا" : "Our story"],
              ["pillars", ar ? "الوعود الثلاثة" : "The three promises"],
              ["testimonials", ar ? "آراء العملاء" : "Testimonials"],
              ["contactCta", ar ? "دعوة التواصل" : "Contact CTA"],
            ] as const
          ).map(([key, label]) => (
            <Toggle
              key={key}
              label={label}
              checked={draft.sections[key]}
              onChange={(value) => edit((next) => { next.sections[key] = value; })}
            />
          ))}
        </Section>

        {/* ---------------- sizes & spacing ---------------- */}
        <Section
          title={ar ? "الأحجام والمسافات" : "Sizes & spacing"}
          description={ar ? "حجم العناوين والنصوص الرئيسية والمسافة بين الأقسام — تُطبَّق فوراً." : "Heading size, main text size and the space between sections — applied live."}
          defaultOpen
        >
          {(
            [
              ["headingScale", ar ? "حجم العناوين" : "Heading size"],
              ["sectionSpacing", ar ? "المسافة بين الأقسام" : "Section spacing"],
              ["bodyScale", ar ? "حجم النصوص التمهيدية" : "Lead text size"],
            ] as [ScaleKey, string][]
          ).map(([key, label]) => (
            <NumberField
              key={key}
              label={label}
              value={draft.theme[key]}
              min={SCALE_LIMITS[key].min}
              max={SCALE_LIMITS[key].max}
              step={SCALE_LIMITS[key].step}
              suffix="%"
              onChange={(value) => edit((n) => { n.theme[key] = value; })}
            />
          ))}

          <div className="mt-1 rounded-xl border border-ink/10 bg-bone p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "معاينة" : "Preview"}</p>
            <h4 className="hd-section font-display mt-2 leading-[1.05] text-ink">{ar ? "عنوان قسم نموذجي" : "A sample section title"}</h4>
            <p className="lead-copy mt-2 max-w-md text-mist">
              {ar ? "هكذا يظهر النص التمهيدي أسفل كل عنوان في الموقع." : "This is how the lead text under every heading will read on the site."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => edit((n) => { n.theme.headingScale = 100; n.theme.bodyScale = 100; n.theme.sectionSpacing = 100; })}
            className="press mt-3 inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-2 text-[11px] font-bold text-ink/70 hover:border-ink/40"
          >
            <Refresh className="h-3.5 w-3.5" /> {ar ? "الرجوع إلى ١٠٠٪" : "Reset to 100%"}
          </button>
        </Section>

        {/* ---------------- shop hero slider ---------------- */}
        <Section
          title={ar ? "سلايدر صفحة المتجر" : "Shop page slider"}
          description={ar ? "الكارت التفاعلي في أعلى المتجر: اعرض منتجاتك واحداً واحداً." : "The interactive card at the top of the shop: walk through your scents one by one."}
        >
          <Toggle
            label={ar ? "إظهار السلايدر" : "Show the slider"}
            checked={draft.shopHero.enabled}
            onChange={(value) => edit((n) => { n.shopHero.enabled = value; })}
          />
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "حجم الكارت" : "Card size"}</p>
          <div className="mb-3 flex gap-2">
            {(["compact", "standard"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => edit((n) => { n.shopHero.size = size; })}
                aria-pressed={draft.shopHero.size === size}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition ${
                  draft.shopHero.size === size ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/60 hover:border-ink/40"
                }`}
              >
                {size === "compact" ? (ar ? "مدمج (افتراضي)" : "Compact (default)") : ar ? "كبير" : "Standard (taller)"}
              </button>
            ))}
          </div>
          <div className="mb-3 flex gap-2">
            {(["all", "featured"] as const).map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => edit((n) => { n.shopHero.scope = scope; })}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition ${
                  draft.shopHero.scope === scope ? "border-ink bg-ink text-bone" : "border-ink/15 text-ink/60 hover:border-ink/40"
                }`}
              >
                {scope === "all" ? (ar ? "كل المنتجات" : "All products") : ar ? "المميزة فقط" : "Featured only"}
              </button>
            ))}
          </div>
          <NumberField
            label={ar ? "أقصى عدد شرائح" : "Maximum slides"}
            value={draft.shopHero.max}
            min={3}
            max={12}
            step={1}
            onChange={(value) => edit((n) => { n.shopHero.max = value; })}
          />
          <p className="rounded-lg bg-bone-2/60 px-3 py-2 text-[9.5px] leading-relaxed text-mist">
            {ar
              ? "كل شريحة تعرض منتجاً حقيقياً: الاسم والسعر والأحجام والنوتات ومدة الثبات — وتضيفه للسلة مباشرة."
              : "Each slide is a real product: name, price, sizes, notes and longevity — and it adds straight to the bag."}
          </p>
        </Section>

        {/* ---------------- shop filters ---------------- */}
        <Section
          title={ar ? "فلاتر المتجر" : "Shop filters"}
          description={ar ? "اختر ما يظهر للزائر. أقل = أبسط." : "Choose what visitors see. Fewer is simpler."}
        >
          {(
            [
              ["search", ar ? "مربع البحث" : "Search box", ar ? "بحث بالاسم أو النوتة" : "Search by name or note"],
              ["family", ar ? "العائلات العطرية" : "Scent families", ar ? "الأزرار الظاهرة: الكل، منعش، زهري…" : "The pills: all, fresh, floral…"],
              ["sort", ar ? "الترتيب" : "Sort order", ar ? "قائمة منسدلة صغيرة" : "A small drop-down"],
              ["gender", ar ? "نسائي / رجالي / للجنسين" : "Women / men / unisex", ar ? "داخل زر «المزيد»" : "Inside the “More” panel"],
              ["price", ar ? "أقصى سعر" : "Maximum price", ar ? "داخل زر «المزيد»" : "Inside the “More” panel"],
              ["savedOnly", ar ? "المحفوظة فقط" : "Saved only", ar ? "داخل زر «المزيد»" : "Inside the “More” panel"],
            ] as const
          ).map(([key, label, description]) => (
            <Toggle
              key={key}
              label={label}
              description={description}
              checked={draft.shopFilters[key]}
              onChange={(value) => edit((n) => { n.shopFilters[key] = value; })}
            />
          ))}
          <p className="rounded-lg bg-bone-2/60 px-3 py-2 text-[9.5px] leading-relaxed text-mist">
            {ar ? "فلتر مُخفى لا يُطبَّق على الزائر أبداً، حتى لو كان مفعّلاً من قبل." : "A hidden filter is never applied to a visitor, even if it was switched on earlier."}
          </p>
        </Section>

        {/* ---------------- moving strips ---------------- */}
        <Section
          title={ar ? "الشرائط المتحركة (الثلاثة)" : "Moving strips (all three)"}
          description={ar ? "الشريط العلوي وشريط الهيرو وشريط النوتات: العناصر والسرعة والاتجاه لكل واحد." : "Announcement bar, hero strip and notes strip: items, speed and direction for each."}
          badge="3"
          defaultOpen
        >
          <StripsEditor draft={draft} edit={edit} ar={ar} />
        </Section>

        {/* ---------------- showcase card ---------------- */}
        <Section
          title={ar ? "كارت الصور (حتى ٥ صور)" : "Image card (up to 5 images)"}
          description={ar ? "كارت تفاعلي بصور منتجاتك — ارفع صورة أو اختر من العطور." : "An interactive card of your product images — upload, link or pick from your scents."}
          badge={`${draft.showcase.images.length}/5`}
        >
          <ShowcaseEditor
            value={draft.showcase}
            products={products}
            onChange={(next) => edit((n) => { n.showcase = next; })}
          />
        </Section>

        {/* ---------------- hero ---------------- */}
        <Section title={ar ? "القسم الرئيسي (الهيرو)" : "Hero section"} description={ar ? "أول ما يراه الزائر." : "The first thing a visitor sees."}>
          <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={draft.hero.eyebrow} onChange={(v) => edit((n) => { n.hero.eyebrow = v; })} />
          <BilingualField label={ar ? "العنوان — السطر الأول" : "Title line 1"} value={draft.hero.titleLine1} onChange={(v) => edit((n) => { n.hero.titleLine1 = v; })} />
          <BilingualField label={ar ? "العنوان — السطر الثاني (بلون مميز)" : "Title line 2 (accent colour)"} value={draft.hero.titleLine2} onChange={(v) => edit((n) => { n.hero.titleLine2 = v; })} />
          <BilingualField label={ar ? "النص التعريفي" : "Lead paragraph"} value={draft.hero.lead} onChange={(v) => edit((n) => { n.hero.lead = v; })} multiline rows={3} />
          <BilingualField label={ar ? "الزر الأساسي" : "Primary button"} value={draft.hero.primaryCta} onChange={(v) => edit((n) => { n.hero.primaryCta = v; })} />
          <BilingualField label={ar ? "الزر الثانوي" : "Secondary button"} value={draft.hero.secondaryCta} onChange={(v) => edit((n) => { n.hero.secondaryCta = v; })} />

          <p className="mb-2 mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-mist">
            {ar ? "الأرقام" : "Stats"}
          </p>
          {draft.hero.stats.map((stat, index) => (
            <RepeatableItem key={stat.id} index={index} onRemove={() => edit((n) => { n.hero.stats.splice(index, 1); })}>
              <div className="grid gap-2 sm:grid-cols-2">
                <TextField label={ar ? "القيمة" : "Value"} value={stat.value} onChange={(v) => edit((n) => { n.hero.stats[index].value = v; })} />
                <TextField label={ar ? "اللاحقة" : "Suffix"} value={stat.suffix} onChange={(v) => edit((n) => { n.hero.stats[index].suffix = v; })} />
              </div>
              <BilingualField label={ar ? "الوصف" : "Label"} value={stat.label} onChange={(v) => edit((n) => { n.hero.stats[index].label = v; })} />
            </RepeatableItem>
          ))}
          <AddButton
            label={ar ? "إضافة رقم" : "Add stat"}
            onClick={() => edit((n) => { n.hero.stats.push({ id: uid(), value: "0", suffix: "", label: { ...emptyLocalized } }); })}
          />
        </Section>

        {/* ---------------- simple section copy ---------------- */}
        {(
          [
            ["featured", ar ? "قسم المنتجات المميزة" : "Featured section"],
            ["finder", ar ? "قسم اكتشف عطرك" : "Scent finder section"],
            ["cta", ar ? "قسم دعوة التواصل" : "Contact CTA section"],
          ] as const
        ).map(([key, label]) => (
          <Section key={key} title={label}>
            <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={draft[key].eyebrow} onChange={(v) => edit((n) => { n[key].eyebrow = v; })} />
            <BilingualField label={ar ? "العنوان" : "Title"} value={draft[key].title} onChange={(v) => edit((n) => { n[key].title = v; })} />
            <BilingualField label={ar ? "النص" : "Lead"} value={draft[key].lead} onChange={(v) => edit((n) => { n[key].lead = v; })} multiline rows={3} />
          </Section>
        ))}

        {/* ---------------- story ---------------- */}
        <Section title={ar ? "قسم حكايتنا" : "Story section"}>
          <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={draft.story.eyebrow} onChange={(v) => edit((n) => { n.story.eyebrow = v; })} />
          <BilingualField label={ar ? "العنوان" : "Title"} value={draft.story.title} onChange={(v) => edit((n) => { n.story.title = v; })} />
          <BilingualField label={ar ? "النص" : "Lead"} value={draft.story.lead} onChange={(v) => edit((n) => { n.story.lead = v; })} multiline rows={4} />
          <BilingualField label={ar ? "الاقتباس" : "Quote"} value={draft.story.quote} onChange={(v) => edit((n) => { n.story.quote = v; })} multiline rows={2} />
          <BilingualField label={ar ? "صاحب الاقتباس" : "Quote author"} value={draft.story.quoteBy} onChange={(v) => edit((n) => { n.story.quoteBy = v; })} />
        </Section>

        {/* ---------------- pillars ---------------- */}
        <Section title={ar ? "الوعود الثلاثة" : "The promises"} badge={`${draft.pillars.items.length}`}>
          <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={draft.pillars.eyebrow} onChange={(v) => edit((n) => { n.pillars.eyebrow = v; })} />
          <BilingualField label={ar ? "العنوان" : "Title"} value={draft.pillars.title} onChange={(v) => edit((n) => { n.pillars.title = v; })} />
          {draft.pillars.items.map((item, index) => (
            <RepeatableItem key={item.id} index={index} onRemove={() => edit((n) => { n.pillars.items.splice(index, 1); })}>
              <BilingualField label={ar ? "العنوان" : "Title"} value={item.title} onChange={(v) => edit((n) => { n.pillars.items[index].title = v; })} />
              <BilingualField label={ar ? "النص" : "Body"} value={item.body} onChange={(v) => edit((n) => { n.pillars.items[index].body = v; })} multiline />
            </RepeatableItem>
          ))}
          <AddButton
            label={ar ? "إضافة وعد" : "Add promise"}
            onClick={() => edit((n) => { n.pillars.items.push({ id: uid(), title: { ...emptyLocalized }, body: { ...emptyLocalized } }); })}
          />
        </Section>

        {/* ---------------- testimonials ---------------- */}
        <Section title={ar ? "آراء العملاء" : "Testimonials"} badge={`${draft.testimonials.items.length}`}>
          <BilingualField label={ar ? "السطر العلوي" : "Eyebrow"} value={draft.testimonials.eyebrow} onChange={(v) => edit((n) => { n.testimonials.eyebrow = v; })} />
          <BilingualField label={ar ? "العنوان" : "Title"} value={draft.testimonials.title} onChange={(v) => edit((n) => { n.testimonials.title = v; })} />
          <BilingualField label={ar ? "النص" : "Lead"} value={draft.testimonials.lead} onChange={(v) => edit((n) => { n.testimonials.lead = v; })} multiline />
          {draft.testimonials.items.map((item, index) => (
            <RepeatableItem key={item.id} index={index} onRemove={() => edit((n) => { n.testimonials.items.splice(index, 1); })}>
              <BilingualField label={ar ? "الرأي" : "Quote"} value={item.quote} onChange={(v) => edit((n) => { n.testimonials.items[index].quote = v; })} multiline rows={3} />
              <BilingualField label={ar ? "الاسم" : "Name"} value={item.name} onChange={(v) => edit((n) => { n.testimonials.items[index].name = v; })} />
              <BilingualField label={ar ? "المدينة" : "City"} value={item.city} onChange={(v) => edit((n) => { n.testimonials.items[index].city = v; })} />
              <div className="grid gap-2 sm:grid-cols-3">
                <TextField label={ar ? "الأحرف" : "Initials"} value={item.initials} onChange={(v) => edit((n) => { n.testimonials.items[index].initials = v.slice(0, 3).toUpperCase(); })} />
                <TextField label={ar ? "التقييم" : "Rating"} type="number" value={String(item.rating)} onChange={(v) => edit((n) => { n.testimonials.items[index].rating = Math.min(5, Math.max(1, Number(v) || 5)); })} />
                <ColorField label={ar ? "اللون" : "Accent"} value={item.accent} onChange={(v) => edit((n) => { n.testimonials.items[index].accent = v; })} />
              </div>
            </RepeatableItem>
          ))}
          <AddButton
            label={ar ? "إضافة رأي" : "Add testimonial"}
            onClick={() =>
              edit((n) => {
                n.testimonials.items.push({
                  id: uid(),
                  quote: { ...emptyLocalized },
                  name: { ...emptyLocalized },
                  city: { ...emptyLocalized },
                  rating: 5,
                  initials: "AA",
                  accent: "#DDF25C",
                });
              })
            }
          />
        </Section>

        {/* ---------------- FAQ ---------------- */}
        <Section title={ar ? "الأسئلة الشائعة" : "FAQ"} badge={`${draft.faq.length}`}>
          {draft.faq.map((item, index) => (
            <RepeatableItem key={item.id} index={index} onRemove={() => edit((n) => { n.faq.splice(index, 1); })}>
              <BilingualField label={ar ? "السؤال" : "Question"} value={item.question} onChange={(v) => edit((n) => { n.faq[index].question = v; })} />
              <BilingualField label={ar ? "الإجابة" : "Answer"} value={item.answer} onChange={(v) => edit((n) => { n.faq[index].answer = v; })} multiline rows={3} />
            </RepeatableItem>
          ))}
          <AddButton
            label={ar ? "إضافة سؤال" : "Add question"}
            onClick={() => edit((n) => { n.faq.push({ id: uid(), question: { ...emptyLocalized }, answer: { ...emptyLocalized } }); })}
          />
        </Section>

        {/* ---------------- 3D bottle experience ---------------- */}
        <Section
          title={ar ? "تجربة الزجاجة ثلاثية الأبعاد" : "3D bottle experience"}
          description={ar ? "النصوص التي تظهر أثناء تفكيك الزجاجة وتجميعها." : "The words that appear while the bottle comes apart and back together."}
        >
          <label className="mb-3 block">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "العطر الظاهر في الختام" : "Scent shown at the end"}</span>
            <select
              value={draft.perfume3d.productSlug}
              onChange={(event) => edit((n) => { n.perfume3d.productSlug = event.target.value; })}
              className="field"
            >
              {products.map((product) => (
                <option key={product.id} value={product.slug}>{product.name[lang]}</option>
              ))}
            </select>
          </label>
          <BilingualField label={ar ? "اسم المجموعة" : "Collection"} value={draft.perfume3d.collection} onChange={(v) => edit((n) => { n.perfume3d.collection = v; })} />
          <BilingualField label={ar ? "الاسم" : "Name"} value={draft.perfume3d.name} onChange={(v) => edit((n) => { n.perfume3d.name = v; })} />
          <BilingualField label={ar ? "الشعار" : "Tagline"} value={draft.perfume3d.tagline} onChange={(v) => edit((n) => { n.perfume3d.tagline = v; })} />
          <BilingualField label={ar ? "سطر التركيز" : "Concentration line"} value={draft.perfume3d.heroLine} onChange={(v) => edit((n) => { n.perfume3d.heroLine = v; })} />
          <BilingualField label={ar ? "عنوان الحرفية" : "Craft title"} value={draft.perfume3d.craftTitle} onChange={(v) => edit((n) => { n.perfume3d.craftTitle = v; })} />
          <BilingualField label={ar ? "نص الحرفية" : "Craft text"} value={draft.perfume3d.craftBody} onChange={(v) => edit((n) => { n.perfume3d.craftBody = v; })} multiline rows={4} />
          <BilingualField label={ar ? "سطر الختام" : "Closing line"} value={draft.perfume3d.finalLine} onChange={(v) => edit((n) => { n.perfume3d.finalLine = v; })} />
          <p className="mb-2 mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{ar ? "النوتات" : "Notes"}</p>
          {draft.perfume3d.notes.map((note, index) => (
            <RepeatableItem key={index} index={index} onRemove={() => edit((n) => { n.perfume3d.notes.splice(index, 1); })}>
              <BilingualField label={ar ? "سطر النوتات" : "Notes line"} value={note} onChange={(v) => edit((n) => { n.perfume3d.notes[index] = v; })} />
            </RepeatableItem>
          ))}
          {draft.perfume3d.notes.length < 5 && (
            <AddButton label={ar ? "إضافة سطر" : "Add line"} onClick={() => edit((n) => { n.perfume3d.notes.push({ ...emptyLocalized }); })} />
          )}
        </Section>

        {/* ---------------- brand ---------------- */}
        <Section
          title={ar ? "اسم العلامة" : "Brand name"}
          description={ar ? "الشعار والفوتر وشريط المتجر والكلمة الكبيرة خلف الهيرو." : "The logo, footer, shop card and the large word behind the hero."}
        >
          <BilingualField label={ar ? "الاسم" : "Name"} value={draft.brand.wordmark} onChange={(v) => edit((n) => { n.brand.wordmark = v; })} />
          <BilingualField label={ar ? "الوصف تحت الاسم" : "Descriptor under the name"} value={draft.brand.descriptor} onChange={(v) => edit((n) => { n.brand.descriptor = v; })} />
        </Section>

        {/* ---------------- every other text ---------------- */}
        <Section
          title={ar ? "كل نصوص الموقع الأخرى" : "Every other text on the site"}
          description={ar ? "القوائم والأزرار والفوتر والمتجر وصفحة المنتج ومن نحن والتواصل والسلة." : "Menus, buttons, footer, shop, product page, About, Contact and cart."}
          badge={`${Object.keys(draft.textOverrides).length}`}
        >
          <TextsEditor draft={draft} edit={edit} ar={ar} />
        </Section>

        {/* ---------------- theme ---------------- */}
        <Section title={ar ? "ألوان الموقع" : "Theme colours"} description={ar ? "تُطبَّق على الموقع كله فوراً." : "Applied across the whole storefront instantly."}>
          <div className="grid gap-2 sm:grid-cols-2">
            <ColorField label={ar ? "اللون الداكن" : "Ink (dark)"} value={draft.theme.ink} onChange={(v) => edit((n) => { n.theme.ink = v; })} />
            <ColorField label={ar ? "الخلفية الفاتحة" : "Bone (light)"} value={draft.theme.bone} onChange={(v) => edit((n) => { n.theme.bone = v; })} />
            <ColorField label={ar ? "لون التمييز" : "Accent"} value={draft.theme.accent} onChange={(v) => edit((n) => { n.theme.accent = v; })} />
            <ColorField label={ar ? "اللون الثانوي" : "Lilac"} value={draft.theme.lilac} onChange={(v) => edit((n) => { n.theme.lilac = v; })} />
          </div>
          <p className="mt-2 rounded-lg bg-bone-2/60 px-3 py-2 text-[9.5px] leading-relaxed text-mist">
            {ar
              ? "نصيحة: حافظ على تباين قوي بين الداكن والفاتح حتى تبقى النصوص مقروءة."
              : "Tip: keep a strong contrast between ink and bone so text stays readable."}
          </p>
        </Section>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="acid" onClick={save} disabled={!dirty} icon={<Check className="h-4 w-4" />} iconPosition="start">
          {ar ? "حفظ المحتوى" : "Save content"}
        </Button>
        <Link to="/" className="text-[11px] font-bold text-plum underline decoration-acid decoration-2 underline-offset-4">
          {ar ? "معاينة الموقع ↗" : "Preview the storefront ↗"}
        </Link>
        <span className="text-[10px] text-mist">{t("admin.dirtyNote")}</span>
      </div>
    </div>
  );
}
