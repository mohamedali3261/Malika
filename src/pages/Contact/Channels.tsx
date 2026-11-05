import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight, Instagram, Mail, Messenger, Whatsapp } from "@/components/ui/icons";
import { useStore } from "@/context/StoreContext";
import { useLang } from "@/i18n/LanguageContext";
import { instagramUrl, messengerUrl, whatsappUrl } from "@/lib/messaging";

export function Channels() {
  const { t, x } = useLang();
  const { settings } = useStore();

  const channels = [
    {
      label: t("contact.wa"),
      description: t("contact.wa.desc"),
      href: whatsappUrl(settings.whatsapp, x("Hello VLOR 🌿", "مرحباً ڨلور 🌿")),
      icon: Whatsapp,
      tone: "hover:bg-[#25D366] hover:border-[#25D366] hover:text-ink",
      badge: x("fastest", "الأسرع"),
    },
    {
      label: t("contact.messenger"),
      description: t("contact.messenger.desc"),
      href: messengerUrl(settings.messenger),
      icon: Messenger,
      tone: "hover:bg-[#C9B5F7] hover:border-lilac hover:text-ink",
      badge: null,
    },
    {
      label: t("contact.instagram"),
      description: t("contact.instagram.desc"),
      href: instagramUrl(settings.instagram),
      icon: Instagram,
      tone: "hover:bg-[#F0AEC9] hover:border-[#F0AEC9] hover:text-ink",
      badge: null,
    },
    {
      label: x("Email", "البريد الإلكتروني"),
      description: settings.email,
      href: `mailto:${settings.email}`,
      icon: Mail,
      tone: "hover:bg-acid hover:border-acid hover:text-ink",
      badge: null,
    },
  ];

  return (
    <section className="bg-bone pb-10">
      <div className="mx-auto grid max-w-[1400px] gap-2.5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        {channels.map((channel, index) => (
          <Reveal key={channel.label} variant="m-spring-soft" delay={index * 55}>
            <a
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`m-hover-lift-md group flex h-full min-h-[112px] flex-col justify-between rounded-[1.25rem] border border-ink/10 bg-white/50 p-4 transition-colors duration-300 ${channel.tone}`}
            >
              <div className="flex items-start justify-between">
                <span className="flex items-center gap-2">
                  <channel.icon className="h-4.5 w-4.5" />
                  {channel.badge && (
                    <span className="rounded-full bg-acid px-2 py-0.5 text-[7.5px] font-extrabold uppercase tracking-[0.1em] text-ink">
                      {channel.badge}
                    </span>
                  )}
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="mt-3">
                <h3 className="text-[12.5px] font-bold">{channel.label}</h3>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed opacity-60">{channel.description}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
