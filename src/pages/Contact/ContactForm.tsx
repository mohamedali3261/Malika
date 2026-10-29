import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/Primitives";
import { ArrowUpRight, Clock, MapPin, Phone, Send, Whatsapp } from "@/components/ui/icons";
import { IMG } from "@/data/images";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/i18n/LanguageContext";
import { contactMessage, openChannel, whatsappUrl } from "@/lib/messaging";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const { t, lang, l, x } = useLang();
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
        <div className="grid overflow-hidden rounded-[2rem] border border-ink/10 bg-white/40 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal className="p-6 sm:p-9 lg:p-11">
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-plum" /> {t("contact.eyebrow")}
            </span>
            <h2 className="hd-sub font-display mt-3 leading-tight">{t("contact.form.title")}</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-mist">{t("contact.form.lead")}</p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.name")} *</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="field" placeholder={x("e.g. Nour", "مثال: نور")} required />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.phone")}</span>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="field" placeholder="+20 1XX XXX XXXX" inputMode="tel" dir="ltr" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-mist">{t("contact.subject")}</span>
                <div className="relative">
                  <select value={subject} onChange={(event) => setSubject(event.target.value)} className="field appearance-none pe-10">
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
                  className="field resize-none"
                  placeholder={x("Tell us about the scents you love, or the occasion…", "أخبرنا عن العطور التي تحبها، أو عن المناسبة…")}
                  required
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button type="submit" variant="acid" icon={<Whatsapp className="h-4 w-4" />} iconPosition="start">
                  {t("contact.send")}
                </Button>
                <span className="text-[9px] leading-snug text-mist">
                  {x("We won't use your details for anything else.", "لن نستخدم بياناتك لأي غرض آخر.")}
                </span>
              </div>
            </form>
          </Reveal>

          <Reveal delay={100} className="relative min-h-[340px] bg-ink p-6 text-bone sm:p-9">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(201,181,247,0.25),transparent_55%)]" />
            <div className="relative flex h-full flex-col">
              <SmartImage src={IMG.atelier} alt={x("Malika atelier", "ورشة مليكة")} className="aspect-[5/3] w-full rounded-[1.3rem] border border-bone/10" />
              <div className="mt-5">
                <h3 className="font-display text-2xl">{t("contact.hours.title")}</h3>
                <ul className="mt-4 space-y-3 text-[11.5px] text-bone/65">
                  <li className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-acid" /> {l(settings.hours)}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-acid" /> {l(settings.address)}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-acid" />
                    <a href={`tel:${settings.phone}`} dir="ltr" className="transition hover:text-acid">{settings.phone}</a>
                  </li>
                </ul>
              </div>
              <a
                href={whatsappUrl(settings.whatsapp, x("Hello MALIKA, I'd like to book a scent consultation", "مرحباً مليكة، أريد حجز استشارة عطرية"))}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 flex items-center justify-between rounded-full border border-bone/20 px-4 py-3 text-[11px] font-bold transition hover:border-acid hover:bg-acid hover:text-ink"
              >
                <span className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" /> {t("contact.visit")}
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
