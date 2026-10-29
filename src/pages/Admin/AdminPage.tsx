import { GithubPanel } from "@/pages/Admin/GithubPanel";
import { AdminHeader, type AdminTab } from "@/pages/Admin/AdminHeader";
import { ProductForm } from "@/pages/Admin/ProductForm";
import { ProductTable } from "@/pages/Admin/ProductTable";
import { ContentEditor } from "@/pages/Admin/ContentEditor";
import { SetupGuide } from "@/pages/Admin/SetupGuide";
import { StoreSettingsForm } from "@/pages/Admin/StoreSettingsForm";
import { Button } from "@/components/ui/Button";
import { Download, Plus, Refresh, Upload } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/utils/cn";
import { useLang } from "@/i18n/LanguageContext";
import { downloadJson } from "@/lib/format";
import { Link } from "@/lib/router";
import type { Product, SiteSettings } from "@/types";
import { useRef, useState } from "react";

export function AdminPage() {
  const { t, lang, l } = useLang();
  const { products, settings, wishlist, saveProduct, deleteProduct, resetCatalogue, replaceCatalogue, updateSettings, content, dirty, lastPublishedAt } = useStore();
  const { push } = useToast();
  const [tab, setTab] = useState<AdminTab>("products");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleSave = (product: Product) => {
    const conflict = products.some((item) => item.slug === product.slug && item.id !== product.id);
    if (conflict) {
      push(lang === "ar" ? "هذا الرابط (slug) مستخدم بالفعل. اختر رابطاً آخر." : "That slug is already in use. Choose another one.", "error");
      return;
    }
    saveProduct(product);
    setFormOpen(false);
    push(`${l(product.name)} · ${t("admin.saved")}`);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`${t("admin.deleteConfirm")}\n${product.name[lang]}`)) {
      deleteProduct(product.id);
      push(t("admin.deleted"), "error");
    }
  };

  const handleReset = () => {
    if (window.confirm(t("admin.resetConfirm"))) {
      resetCatalogue();
      push(t("admin.resetDone"), "info");
    }
  };

  const exportAll = () => {
    downloadJson("catalog.json", { generatedAt: new Date().toISOString(), settings, content, products });
    push(lang === "ar" ? "تم تصدير الكتالوج." : "Catalogue exported.", "info");
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const next: unknown = Array.isArray(parsed) ? parsed : parsed?.products;
        if (
          !Array.isArray(next) ||
          next.some(
            (item) =>
              !item?.slug ||
              !item?.name?.en ||
              !Array.isArray(item?.sizes) ||
              item.sizes.length === 0 ||
              !Array.isArray(item?.notes?.top)
          )
        ) {
          throw new Error("invalid");
        }
        replaceCatalogue(next as Product[]);
        push(lang === "ar" ? "تم استيراد الكتالوج." : "Catalogue imported.");
      } catch {
        push(lang === "ar" ? "ملف JSON غير صالح." : "Invalid JSON file.", "error");
      }
    };
    reader.readAsText(file);
    fileRef.current!.value = "";
  };

  const saveSettings = (next: SiteSettings) => {
    updateSettings(next);
    push(t("admin.settingsSaved"));
  };

  return (
    <div className="anim-page bg-bone pb-28 pt-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-mist transition hover:text-ink">
            <span className="rtl:rotate-180">←</span> {lang === "ar" ? "العودة للمتجر" : "Back to storefront"}
          </Link>
          <span className="rounded-full border border-ink/10 bg-white/50 px-3 py-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-mist">
            v2.0 · local-first
          </span>
        </div>

        <AdminHeader tab={tab} setTab={setTab} dirty={dirty} stats={{ products: products.length, featured: products.filter((product) => product.featured).length, saved: wishlist.length }} />

        <div className="mt-5 rounded-[1.5rem] border border-ink/10 bg-bone/60 p-4 sm:p-5">
          {tab === "products" && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[13px] font-bold">{t("admin.collection")}</h2>
                  <p className="text-[10px] text-mist">
                    {lang === "ar" ? "أضف، عدّل، أو احذف أي عطر — الحفظ فوري." : "Add, edit or remove any scent — saved instantly."}
                  </p>
                  <p className={cn("mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold", dirty ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", dirty ? "bg-amber-500" : "bg-emerald-500")} />
                    {dirty ? t("admin.dirtyNote") : t("admin.publishedNote")}
                    {lastPublishedAt && <span className="opacity-60"> · {new Date(lastPublishedAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB")}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(event) => event.target.files?.[0] && importFile(event.target.files[0])}
                  />
                  <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />} iconPosition="start">
                    {t("admin.import")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={exportAll} icon={<Download className="h-3.5 w-3.5" />} iconPosition="start">
                    {t("admin.export")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleReset} icon={<Refresh className="h-3.5 w-3.5" />} iconPosition="start">
                    {t("admin.reset")}
                  </Button>
                  <Button size="sm" variant="acid" onClick={openNew} icon={<Plus className="h-3.5 w-3.5" />} iconPosition="start">
                    {t("admin.newProduct")}
                  </Button>
                </div>
              </div>
              <ProductTable products={products} onEdit={openEdit} onDelete={handleDelete} />
            </>
          )}

          {tab === "content" && (
            <>
              <div className="mb-4">
                <h2 className="text-[13px] font-bold">{t("admin.tab.content")}</h2>
                <p className="text-[10px] text-mist">
                  {lang === "ar"
                    ? "تحكّم كامل في نصوص الموقع والأقسام والألوان."
                    : "Full control over every text, section and colour on the site."}
                </p>
              </div>
              <ContentEditor />
            </>
          )}

          {tab === "settings" && (
            <>
              <div className="mb-4">
                <h2 className="text-[13px] font-bold">{t("admin.tab.settings")}</h2>
                <p className="text-[10px] text-mist">{lang === "ar" ? "بيانات التواصل والشحن المستخدمة في كل الصفحات." : "Contact and shipping details used across every page."}</p>
              </div>
              <StoreSettingsForm settings={settings} onSave={saveSettings} />
            </>
          )}

          {tab === "github" && (
            <>
              <div className="mb-4">
                <h2 className="text-[13px] font-bold">{t("gh.title")}</h2>
                <p className="text-[10px] text-mist">{lang === "ar" ? "ارفع الكتالوج إلى مستودعك وأطلق النشر التلقائي." : "Push the catalogue to your repo and trigger auto-deploy."}</p>
              </div>
              <GithubPanel products={products} settings={settings} content={content} />
            </>
          )}

          {tab === "guide" && (
            <>
              <div className="mb-4">
                <h2 className="text-[13px] font-bold">{t("admin.tab.guide")}</h2>
                <p className="text-[10px] text-mist">{lang === "ar" ? "الخطة الكاملة: البيانات، الاستضافة، والنشر." : "The complete plan: data, hosting and publishing."}</p>
              </div>
              <SetupGuide />
            </>
          )}
        </div>
      </div>

      <ProductForm open={formOpen} initial={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
    </div>
  );
}
