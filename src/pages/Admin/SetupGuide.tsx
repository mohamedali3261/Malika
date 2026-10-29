import { Sparkle, Github, Box as Database, Shield } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";

export function SetupGuide() {
  const { lang } = useLang();

  const storage = [
    {
      label: lang === "ar" ? "الكتالوج" : "Catalogue",
      value: "localStorage · malika.catalogue.v2",
      note: lang === "ar" ? "أي تعديل يظهر فوراً في المتجر دون خادم." : "Every edit appears in the storefront immediately, no server.",
    },
    {
      label: lang === "ar" ? "بيانات المتجر" : "Storefront",
      value: "localStorage · malika.settings.v2",
      note: lang === "ar" ? "أرقام واتساب، ماسنجر، العنوان والمواعيد." : "WhatsApp, Messenger, address and hours.",
    },
    {
      label: lang === "ar" ? "سلة العميل" : "Client bag",
      value: "localStorage · malika.cart.v2",
      note: lang === "ar" ? "محفوظة لكل زائر داخل متصفحه." : "Persisted per visitor in their browser.",
    },
    {
      label: lang === "ar" ? "توكن GitHub" : "GitHub token",
      value: "sessionStorage · malika.github.session",
      note: lang === "ar" ? "يُمسح عند إغلاق التبويب. لا يُرسل لأي خادم." : "Cleared when the tab closes. Never sent to our servers.",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-ink/10 bg-white/40 p-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-plum" />
          <h3 className="text-[12px] font-bold">{lang === "ar" ? "أين تُحفظ البيانات؟" : "Where data lives"}</h3>
        </div>
        <div className="mt-3 space-y-2.5">
          {storage.map((row) => (
            <div key={row.value} className="rounded-xl border border-ink/8 bg-bone/60 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-[10px] font-bold">{row.label}</span>
                <code className="rounded bg-ink/5 px-1.5 py-0.5 text-[9px] text-plum" dir="ltr">{row.value}</code>
              </div>
              <p className="mt-1 text-[9.5px] leading-relaxed text-mist">{row.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-bone">
        <div className="flex items-center gap-2">
          <Sparkle className="h-4 w-4 text-acid" />
          <h3 className="text-[12px] font-bold">{lang === "ar" ? "خريطة المشروع" : "Project structure"}</h3>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-black/25 p-3 text-[9.5px] leading-relaxed text-bone/70" dir="ltr">
{`src/
 ├ pages/
 │  ├ Home/      Hero, Featured, ScentFinder…
 │  ├ Shop/      FilterBar, ProductGrid…
 │  ├ Product/   Gallery, PurchasePanel…
 │  ├ About/  Contact/
 │  └ Admin/     ProductForm, GithubPanel…
 ├ data/products/   ← one file per scent
 ├ components/      layout · product · ui
 ├ context/         store · cart · toast
 ├ i18n/            ar + en dictionary
 └ lib/             router · github · messaging`}
        </pre>
        <p className="mt-3 text-[10px] leading-relaxed text-bone/50">
          {lang === "ar"
            ? "لإضافة عطر من الكود: أنشئ ملفاً في src/data/products ثم استورده في index.ts. أو استخدم استوديو المنتجات هنا."
            : "To add a scent in code: create a file in src/data/products, import it in index.ts. Or use the studio here."}
        </p>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-bone-2/50 p-5 lg:col-span-2">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-plum" />
          <h3 className="text-[12px] font-bold">{lang === "ar" ? "النشر التلقائي — الخطة الكاملة" : "Auto-deploy — the full plan"}</h3>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: lang === "ar" ? "١. مستودع" : "1. Repository",
              body: lang === "ar" ? "ارفع المشروع إلى GitHub (main)." : "Push the project to GitHub (main branch).",
            },
            {
              title: lang === "ar" ? "٢. استضافة" : "2. Hosting",
              body: lang === "ar" ? "اربط المستودع بـ Vercel أو Netlify. أمر البناء: npm run build." : "Connect the repo to Vercel or Netlify. Build command: npm run build.",
            },
            {
              title: lang === "ar" ? "٣. توكن" : "3. Token",
              body: lang === "ar" ? "توكن دقيق بصلاحية Contents: Read & Write فقط للمستودع." : "Fine-grained token with Contents: Read & write for this repo only.",
            },
            {
              title: lang === "ar" ? "٤. ربط ونشر" : "4. Connect & publish",
              body: lang === "ar" ? "سجّل الدخول بـ OAuth، ثم كل نشر = كوميت = إعادة نشر تلقائية." : "Sign in with OAuth, then every publish = commit = automatic redeploy.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-xl border border-ink/10 bg-bone p-3.5">
              <p className="text-[10px] font-bold">{step.title}</p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-mist">{step.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[9.5px] leading-relaxed text-amber-800">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {lang === "ar"
            ? "الموقع فرونت-إند بالكامل: التعديلات محلية في المتصفح. النشر على GitHub يحفظ الكتالوج في المستودع ويعيد بناء الموقع المنشور. لحماية الاستوديو في الإنتاج أضف بوابة كلمة مرور عبر Netlify Identity أو خادم صغير."
            : "This is a front-end-only store: edits live in the browser. Publishing to GitHub saves the JSON in your repository and triggers a rebuild of the hosted site. To protect the studio in production, add a passcode gate via Netlify Identity or a small backend."}
        </div>
      </div>
    </div>
  );
}
