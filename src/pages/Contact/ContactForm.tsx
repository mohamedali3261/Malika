import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/Primitives";
import { ArrowUpRight, Phone, Send, Whatsapp } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { contactMessage, openChannel, whatsappUrl } from "@/lib/messaging";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const { t, lang, x } = useLang();
  const { settings } = useStore();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(t("contact.choose1"));
  const [message, setMessage] = useState("");

  const subjects = [t("contact.choose1"), t("contact.choose2"), t("contact.choose3"), t("contact.choose4")];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      push(t("contact.required"), "error");
      return;
    }
    const text = contactMessage({ name, phone, subject, message, lang });
    openChannel(whatsappUrl(settings.whatsapp, text));
    push(x("Opening WhatsApp to continue…", "جارٍ فتح واتساب لإكمال المحادثة…"), "info");
  };

  return (
    <section className="bg-bone pb-14 lg:pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid overflow-hidden rounded-[2rem] border border-ink/10 bg-surface shadow-[0_24px_80px_rgba(16,16,16,0.07)] lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="p-6 sm:p-8 lg:p-10">
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-plum" /> {t("contact.eyebrow")}
            </span>
            <h2 className="hd-sub font-display mt-3 leading-[1.05] tracking-tight">{t("contact.form.title")}</h2>
            <p className="mt-2.5 max-w-lg text-[12.5px] leading-relaxed text-mist">{t("contact.form.lead")}</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.name")} *</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="field h-11 rounded-xl border border-ink/12 bg-bone-2/40 px-4 text-[13px] transition focus:border-plum focus:bg-surface focus:outline-none" placeholder={x("e.g. Nour", "مثال: نور")} required />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.phone")}</span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="field h-11 rounded-xl border border-ink/12 bg-bone-2/40 px-4 text-[13px] transition focus:border-plum focus:bg-surface focus:outline-none" placeholder="+20 1XX XXX XXXX" inputMode="tel" dir="ltr" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.subject")}</span>
                <div className="relative">
                  <select value={subject} onChange={(event) => setSubject(event.target.value)} className="field h-11 w-full appearance-none rounded-xl border border-ink/12 bg-bone-2/40 px-4 pe-10 text-[13px] transition focus:border-plum focus:bg-surface focus:outline-none">
                    {subjects.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.message")} *</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  className="field min-h-[120px] resize-none rounded-xl border border-ink/12 bg-bone-2/40 px-4 py-3 text-[13px] leading-relaxed transition focus:border-plum focus:bg-surface focus:outline-none"
                  placeholder={x("Tell us about the scents you love, or the occasion…", "أخبرنا عن العطور التي تحبها، أو عن المناسبة…")}
                  required
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <Button type="submit" variant="acid" size="lg" className="w-full sm:w-auto" icon={<Whatsapp className="h-4.5 w-4.5" />} iconPosition="start">
                  {t("contact.send")}
                </Button>
                <span className="text-center text-[10px] leading-snug text-mist sm:text-start">
                  {x("We reply on WhatsApp within minutes — no spam.", "نرد عبر واتساب خلال دقائق — بلا إزعاج.")}
                </span>
              </div>
            </form>
          </Reveal>

          <Reveal delay={110} className="relative flex flex-col bg-ink p-6 text-bone sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(201,181,247,0.22),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(213,255,74,0.08),transparent_40%)]" />
            <div className="relative flex h-full flex-col">
              <div className="overflow-hidden rounded-[1.4rem] border border-bone/10">
                <SmartImage src={IMG.atelier} alt={x("VLOR — online atelier", "ڨلور — ورشة أونلاين")} className="aspect-[16/10] w-full" />
              </div>
              <div className="mt-6 space-y-1">
                <h3 className="font-display text-[26px] leading-none">{x("We’re online", "نحن أونلاين")}</h3>
                <p className="text-[11px] leading-relaxed text-bone/60">{x("No storefront — we ship across Egypt and reply fast on WhatsApp.", "لا يوجد متجر فعلي — نشحن لكل محافظات مصر ونرد بسرعة على واتساب.")}</p>
              </div>
              <ul className="mt-5 space-y-3 text-[12px]">
                <li className="flex items-center gap-3 rounded-xl bg-bone/8 px-3.5 py-3 backdrop-blur">
                  <Phone className="h-4 w-4 shrink-0 text-acid" />
                  <a href={`tel:${settings.phone}`} dir="ltr" className="font-medium leading-snug text-bone transition hover:text-acid">{settings.phone}</a>
                </li>
              </ul>
              <a
                href={whatsappUrl(settings.whatsapp, x("Hello VLOR, I'd like a scent consultation", "مرحباً ڨلور، أريد استشارة عطرية"))}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 flex items-center justify-between rounded-full border border-bone/15 bg-bone/8 px-4 py-3.5 text-[12px] font-bold backdrop-blur transition hover:border-acid hover:bg-acid hover:text-[#141019]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-acid text-[#141019] group-hover:bg-ink group-hover:text-acid">
                    <Send className="h-3.5 w-3.5" />
                  </span>
                  {t("contact.visit")}
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </a>
              <p className="mt-3 text-center text-[10px] text-bone/40">{x("Average reply: < 1 hour", "متوسط الرد: أقل من ساعة")}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
