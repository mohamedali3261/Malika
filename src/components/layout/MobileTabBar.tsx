import { Bag, Whatsapp } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/lib/messaging";
import { Link, useRoute } from "@/lib/router";
import { cn } from "@/utils/cn";

function HomeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function ShopGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h16l-1.3 11.2a1.5 1.5 0 0 1-1.5 1.3H6.8a1.5 1.5 0 0 1-1.5-1.3L4 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M9.5 12.5h5" />
    </svg>
  );
}

/** Thumb-friendly navigation for phones. Hidden on the studio & product page (which has its own bar). */
export function MobileTabBar() {
  const { path } = useRoute();
  const { t, x } = useLang();
  const { count, open } = useCart();
  const { settings } = useStore();

  if (path === "/studio" || path === "/admin" || path.startsWith("/product/")) return null;

  const itemClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition",
      active ? "text-ink" : "text-ink/45"
    );

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-[75] border-t border-ink/10 bg-bone/95 px-2 pt-1.5 backdrop-blur-xl lg:hidden"
      aria-label={x("Mobile navigation", "تنقل الموبايل")}
    >
      <div className="mx-auto flex max-w-md items-stretch">
        <Link to="/" className={itemClass(path === "/")} aria-current={path === "/" ? "page" : undefined}>
          <HomeGlyph className="h-5 w-5" />
          {t("nav.home")}
        </Link>
        <Link to="/shop" className={itemClass(path === "/shop")} aria-current={path === "/shop" ? "page" : undefined}>
          <ShopGlyph className="h-5 w-5" />
          {t("nav.shop")}
        </Link>
        <a
          href={whatsappUrl(settings.whatsapp, x("Hello MALIKA, I'd love help choosing a scent 🌿", "مرحباً مليكة، أريد المساعدة في اختيار عطر 🌿"))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-ink/45"
        >
          <span className="grid h-5 w-5 place-items-center text-[#1fa855]">
            <Whatsapp className="h-5 w-5" />
          </span>
          {t("contact.wa")}
        </a>
        <button onClick={open} className={cn(itemClass(false), "relative")}>
          <span className="relative">
            <Bag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -end-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-acid px-1 text-[9px] font-extrabold text-ink">
                {count}
              </span>
            )}
          </span>
          {t("nav.cart")}
        </button>
      </div>
    </nav>
  );
}
