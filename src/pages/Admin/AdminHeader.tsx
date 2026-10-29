import { Check, Github, Lock, Pencil, Sparkle } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/utils/cn";

export type AdminTab = "products" | "orders" | "inventory" | "delivery" | "images" | "security" | "content" | "settings" | "github" | "guide";

export function AdminHeader({
  tab,
  setTab,
  stats,
  dirty,
}: {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  stats: { products: number; featured: number; saved: number };
  dirty: boolean;
}) {
  const { t, lang } = useLang();

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "products", label: t("admin.tab.products") },
    { key: "orders", label: lang === "ar" ? "الطلبات" : "Orders" },
    { key: "inventory", label: lang === "ar" ? "المخزون" : "Inventory" },
    { key: "delivery", label: lang === "ar" ? "الشحن والخصومات" : "Delivery & discounts" },
    { key: "images", label: lang === "ar" ? "الصور" : "Images" },
    { key: "security", label: lang === "ar" ? "الأمان" : "Security" },
    { key: "content", label: t("admin.tab.content") },
    { key: "settings", label: t("admin.tab.settings") },
    { key: "github", label: t("admin.tab.github") },
    { key: "guide", label: t("admin.tab.guide") },
  ];

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.8rem] bg-ink p-6 text-bone sm:p-8">
        <div className="pointer-events-none absolute -end-10 -top-10 h-56 w-56 rounded-full bg-lilac/20 blur-[70px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em] text-bone/55">
              <Lock className="h-3 w-3" /> {t("admin.eyebrow")}
            </span>
            <h1 className="font-display mt-3 text-[2.2rem] leading-none sm:text-4xl">{t("admin.title")}</h1>
            <p className="mt-2 max-w-xl text-[11.5px] leading-relaxed text-bone/50">{t("admin.lead")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: stats.products, label: t("admin.productCount") },
              { value: stats.featured, label: t("admin.featuredCount") },
              { value: stats.saved, label: t("admin.savedCount") },
            ].map((stat) => (
              <div key={stat.label} className="min-w-[80px] rounded-xl border border-bone/12 bg-bone/[0.04] px-3 py-2.5">
                <p className="font-display text-2xl leading-none text-acid">{stat.value}</p>
                <p className="mt-1 text-[7.5px] font-semibold uppercase leading-tight tracking-[0.1em] text-bone/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-1.5">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10.5px] font-bold transition-all",
                tab === item.key ? "bg-acid text-ink" : "text-bone/55 hover:bg-bone/10 hover:text-bone"
              )}
            >
              {item.key === "github" && <Github className="h-3.5 w-3.5" />}
              {item.key === "products" && <Sparkle className="h-3.5 w-3.5" />}
              {item.key === "content" && <Pencil className="h-3.5 w-3.5" />}
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setTab("github")}
            className={cn(
              "ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition",
              dirty
                ? "bg-amber-300/15 text-amber-200 hover:bg-amber-300/25"
                : "bg-bone/10 text-bone/45 hover:text-bone/70"
            )}
          >
            {dirty ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" /> : <Check className="h-3 w-3" />}
            {dirty ? t("gh.dirty") : t("gh.allPublished")}
          </button>
        </div>
      </div>
    </div>
  );
}
