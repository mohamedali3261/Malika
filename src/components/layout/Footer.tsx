import { useBrand } from "@/hooks/useBrand";
import { Logo } from "@/components/ui/Primitives";
import { BRAND } from "@/data/site";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import {
  ArrowUpRight,
  Clock,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Messenger,
  Whatsapp,
} from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { instagramUrl, messengerUrl, whatsappUrl } from "@/lib/messaging";
import { Link } from "@/lib/router";
import { StudioDot } from "@/components/layout/SecretEntry";

export function Footer() {
  const { wordmark } = useBrand();
  const { t, lang, l, toggle, x } = useLang();
  const { settings } = useStore();
  const year = new Date().getFullYear();

  const explore = [
    { label: t("footer.shopAll"), to: "/shop" },
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink text-bone">
      <div className="grain pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-40 end-0 h-[420px] w-[420px] rounded-full bg-plum/70 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 start-1/4 h-64 w-64 rounded-full bg-lilac/15 blur-[90px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* newsletter */}
        <div className="grid gap-8 border-b border-bone/12 py-12 md:grid-cols-[1fr_1fr] md:items-center lg:py-16">
          <div>
            <h3 className="font-display text-4xl leading-none sm:text-5xl">{t("news.title")}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/55">{t("news.lead")}</p>
          </div>
          <div className="md:justify-self-end md:w-[420px]">
            <NewsletterForm dark />
            <p className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-bone/35">
              <span className="h-1 w-1 rounded-full bg-acid" /> {t("footer.made")}
            </p>
          </div>
        </div>

        {/* columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-bone/55">{t("brand.tagline")}</p>
            <div className="mt-6 flex gap-2">
              {[
                { href: whatsappUrl(settings.whatsapp, x("Hello MALIKA 🌿", "مرحباً مليكة 🌿")), icon: Whatsapp, label: "WhatsApp" },
                { href: messengerUrl(settings.messenger), icon: Messenger, label: "Messenger" },
                { href: instagramUrl(settings.instagram), icon: Instagram, label: "Instagram" },
                { href: `mailto:${settings.email}`, icon: Mail, label: "Email" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-bone/15 text-bone/70 transition-all duration-300 hover:border-acid hover:bg-acid hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-bone/35">{t("footer.explore")}</h4>
            <ul className="mt-5 space-y-3">
              {explore.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="group inline-flex items-center gap-1.5 text-[13px] text-bone/70 transition hover:text-acid">
                    {item.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-bone/35">{t("footer.help")}</h4>
            <ul className="mt-5 space-y-3 text-[13px] text-bone/70">
              <li>
                <Link to="/contact" className="transition hover:text-acid">{t("footer.faq")}</Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-acid">{t("footer.shipping")}</Link>
              </li>
              <li>
                <a href={whatsappUrl(settings.whatsapp, x("Hello MALIKA, I need help with an order", "مرحباً مليكة، أحتاج مساعدة في طلب"))} target="_blank" rel="noopener noreferrer" className="transition hover:text-acid">
                  {t("footer.contact")}
                </a>
              </li>
              <li>
                <button onClick={toggle} className="flex items-center gap-1.5 transition hover:text-acid">
                  <Globe className="h-3.5 w-3.5" /> {t("footer.lang")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.28em] text-bone/35">{t("footer.house")}</h4>
            <ul className="mt-5 space-y-4 text-[13px] text-bone/70">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                <span>{l(settings.address)}</span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                <span>{l(settings.hours)}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                <a href={`mailto:${settings.email}`} className="transition hover:text-acid">{settings.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative select-none overflow-hidden border-t border-bone/12 pt-6">
          <p className="font-display text-center text-[19vw] leading-[0.72] tracking-[0.06em] text-bone/[0.055] sm:text-[15vw]">
            {wordmark}
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bone/12 py-5 text-[10px] uppercase tracking-[0.16em] text-bone/35 sm:flex-row">
          <p>
            {/* Isolated so the year never reorders inside the RTL line. */}
            <span dir="ltr">© {year}</span> {wordmark} ·{" "}
            {t("footer.rights")}
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-acid" />
            {t("footer.made")}
          </p>
          <span className="flex items-center gap-3">
            {BRAND.city[lang]}
            <StudioDot />
          </span>
        </div>
      </div>
    </footer>
  );
}
