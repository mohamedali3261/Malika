import { Announcement } from "@/components/layout/Announcement";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Primitives";
import {
  Bag,
  Globe,
  Heart,
  Menu,
  Messenger,
  Whatsapp,
  X,
} from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useBodyLock, useScrolled } from "@/hooks/useUi";
import { useLang } from "@/i18n/LanguageContext";
import { messengerUrl, whatsappUrl } from "@/lib/messaging";
import { Link, useRoute } from "@/lib/router";
import { useBagPulse } from "@/motion";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

const links = [
  { to: "/", key: "nav.home" as const, index: "01" },
  { to: "/shop", key: "nav.shop" as const, index: "02" },
  { to: "/contact", key: "nav.contact" as const, index: "03" },
];

export function Navbar() {
  const { lang, t, toggle, x } = useLang();
  const { path } = useRoute();
  const { count, open } = useCart();
  const { wishlist, settings } = useStore();
  const scrolled = useScrolled(24);
  const bagPulsing = useBagPulse();
  const [mobileOpen, setMobileOpen] = useState(false);
  useBodyLock(mobileOpen);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Announcement />
      <header
        dir="ltr"
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled ? "glass border-b border-ink/10 shadow-[0_12px_40px_-24px_rgba(20,16,25,0.35)]" : "bg-bone"
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/12 text-ink transition hover:bg-ink hover:text-bone lg:hidden"
              aria-label={t("nav.menu")}
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <Link to="/" aria-label={x("VLOR home", "الرئيسية ڨلور")} className="shrink-0">
              <Logo className="h-8 w-24 sm:h-12 sm:w-40" />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 rounded-full border border-ink/10 bg-surface/40 p-1.5 lg:flex">
            {links.map((link) => {
              const active = path === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold tracking-tight transition-all duration-300",
                    active ? "bg-ink text-bone" : "text-ink/70 hover:bg-ink/[0.05] hover:text-ink"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[8px] tracking-normal",
                      active ? "text-acid" : "text-ink/30"
                    )}
                  >
                    {link.index}
                  </span>
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <button
              onClick={toggle}
              className="hidden h-10 items-center gap-1.5 rounded-full border border-ink/12 px-3 text-[11px] font-bold uppercase tracking-widest text-ink transition hover:border-ink/40 sm:flex"
              aria-label={t("lang.switch")}
            >
              <Globe className="h-3.5 w-3.5" />
              {(lang === "ar" ? "EN" : "ع")}
            </button>
            <Link
              to="/wishlist"
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full border transition",
                path === "/wishlist"
                  ? "border-ink bg-ink text-bone"
                  : "border-ink/12 text-ink hover:border-ink/40"
              )}
              aria-label={t("product.wishlist")}
              aria-current={path === "/wishlist" ? "page" : undefined}
            >
              <Heart className="h-4 w-4" fill={wishlist.length > 0 || path === "/wishlist" ? "currentColor" : "none"} />
              {wishlist.length > 0 && (
                <span className="absolute -end-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-lilac px-1 text-[9px] font-bold text-[#141019]">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <a
              href={whatsappUrl(settings.whatsapp, x("Hello VLOR 🌿", "مرحباً ڨلور 🌿"))}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 w-10 place-items-center rounded-full border border-ink/12 text-ink transition hover:border-ink/40 hover:bg-[#25D366]/15 md:grid"
              aria-label={t("nav.order")}
            >
              <Whatsapp className="h-4 w-4" />
            </a>
            <button
              onClick={open}
              className="m-press-spring group relative flex h-10 items-center gap-2.5 rounded-full bg-ink ps-4 pe-3 text-bone transition hover:bg-plum"
              aria-label={t("nav.cart")}
            >
              <span className={cn("grid place-items-center", bagPulsing && "m-bag-jiggle")}>
                <Bag className="h-4 w-4" />
              </span>
              <span className="hidden text-[11px] font-bold uppercase tracking-widest sm:block">
                {t("nav.cart")}
              </span>
              <span
                key={count}
                className={cn(
                  "grid h-5 min-w-5 place-items-center rounded-full bg-acid px-1 text-[10px] font-extrabold text-[#141019]",
                  count > 0 && "m-badge-ping-pop"
                )}
              >
                {count}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        dir="ltr"
        className={cn(
          "fixed inset-0 z-[80] lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-400",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-bone shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5">
            <Logo />
            <button
              onClick={() => setMobileOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink"
              aria-label={t("nav.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-5 py-8">
            {links.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-baseline justify-between border-b border-ink/8 py-4 transition",
                  path === link.to ? "text-ink" : "text-ink/60"
                )}
              >
                <span className="font-display text-4xl leading-none">{t(link.key)}</span>
                <span className="font-mono text-[10px] text-mist">0{index + 1}</span>
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center justify-between border-b border-ink/8 py-4 transition",
                path === "/wishlist" ? "text-ink" : "text-ink/60"
              )}
            >
              <span className="inline-flex items-center gap-2.5 font-display text-4xl leading-none">
                {x("Saved", "المفضلة")}
                {wishlist.length > 0 && (
                  <span className="rounded-full bg-lilac px-2 py-0.5 font-sans text-xs font-bold text-[#141019]">
                    {wishlist.length}
                  </span>
                )}
              </span>
              <span className="font-mono text-[10px] text-mist">04</span>
            </Link>
          </nav>
          <div className="space-y-3 border-t border-ink/10 p-5">
            <Button
              variant="acid"
              full
              href={whatsappUrl(settings.whatsapp, x("Hello VLOR 🌿", "مرحباً ڨلور 🌿"))}
              icon={<Whatsapp className="h-4 w-4" />}
              iconPosition="start"
            >
              {t("nav.order")}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" href={messengerUrl(settings.messenger)} icon={<Messenger className="h-3.5 w-3.5" />} iconPosition="start">
                {t("contact.messenger")}
              </Button>
              <Button variant="outline" size="sm" onClick={toggle} icon={<Globe className="h-3.5 w-3.5" />} iconPosition="start">
                {(lang === "ar" ? "English" : "العربية")}
              </Button>
            </div>
            <div className="flex justify-center pt-1">
              <ThemeToggle className="sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
