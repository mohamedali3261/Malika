import { Button } from "@/components/ui/Button";
import { Portal, SmartImage } from "@/components/ui/Primitives";
import { ArrowRight, Check, Copy, Messenger, Send, Truck, Whatsapp, X } from "@/components/ui/icons";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useToast } from "@/context/ToastContext";
import { useBodyLock } from "@/hooks/useUi";
import { useLang } from "@/i18n/LanguageContext";
import { formatPrice } from "@/lib/format";
import {
  cartMessage,
  copyText,
  messengerUrl,
  openChannel,
  whatsappUrl,
  type OrderCustomer,
} from "@/lib/messaging";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState, type FormEvent } from "react";

const governorates = [
  { en: "Cairo", ar: "القاهرة" },
  { en: "Giza", ar: "الجيزة" },
  { en: "Alexandria", ar: "الإسكندرية" },
  { en: "Qalyubia", ar: "القليوبية" },
  { en: "Sharqia", ar: "الشرقية" },
  { en: "Dakahlia", ar: "الدقهلية" },
  { en: "Gharbia", ar: "الغربية" },
  { en: "Monufia", ar: "المنوفية" },
  { en: "Beheira", ar: "البحيرة" },
  { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { en: "Damietta", ar: "دمياط" },
  { en: "Port Said", ar: "بورسعيد" },
  { en: "Ismailia", ar: "الإسماعيلية" },
  { en: "Suez", ar: "السويس" },
  { en: "Faiyum", ar: "الفيوم" },
  { en: "Beni Suef", ar: "بني سويف" },
  { en: "Minya", ar: "المنيا" },
  { en: "Asyut", ar: "أسيوط" },
  { en: "Sohag", ar: "سوهاج" },
  { en: "Qena", ar: "قنا" },
  { en: "Luxor", ar: "الأقصر" },
  { en: "Aswan", ar: "أسوان" },
  { en: "Red Sea", ar: "البحر الأحمر" },
  { en: "Matrouh", ar: "مطروح" },
  { en: "North Sinai", ar: "شمال سيناء" },
  { en: "South Sinai", ar: "جنوب سيناء" },
  { en: "New Valley", ar: "الوادي الجديد" },
] as const;

interface CheckoutSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CheckoutSheet({ open, onClose }: CheckoutSheetProps) {
  const { lines, count, clear, close: closeCart } = useCart();
  const { settings } = useStore();
  const { lang, t, l } = useLang();
  const { push } = useToast();
  useBodyLock(open);

  const [step, setStep] = useState<"details" | "sent">("details");
  const [customer, setCustomer] = useState<OrderCustomer>({ name: "", phone: "", city: "", address: "", note: "" });
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean; city?: boolean; address?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [quote, setQuote] = useState<{signature:string;subtotal:number;shipping:number;discount:number;total:number;prices:{productId:string;ml:number;price:number}[]} | null>(null);
  const [tracking, setTracking] = useState('');
  const [confirmedSubtotal, setConfirmedSubtotal] = useState<number | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const displayedSubtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const quoteInput = { city: customer.city, ...(coupon.trim() ? {coupon: coupon.trim().toUpperCase()} : {}), items: lines.map(({productId,ml,qty}) => ({productId,ml,qty})) };
  const quoteSignature = JSON.stringify(quoteInput);
  const activeQuote = quote?.signature === quoteSignature ? quote : null;

  useEffect(() => {
    if (!open) return;
    setStep("details");
    setConfirmedSubtotal(null);
    setQuote(null);
    setTracking('');
    setErrors({});
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof OrderCustomer, value: string) =>
    setCustomer((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next = {
      name: customer.name.trim().length < 2,
      phone: customer.phone.replace(/\D/g, "").length < 8,
      city: !customer.city,
      address: customer.address.trim().length < 6,
    };
    setErrors(next);
    if (next.phone) push(t("cart.phoneInvalid"), "error");
    else if (Object.values(next).some(Boolean)) push(t("cart.required"), "error");
    return !Object.values(next).some(Boolean);
  };

  const finish = () => {
    setStep("sent");
    closeCart();
    push(t("cart.successTitle"));
  };

  const submitOrder = async (channel: "whatsapp" | "messenger") => {
    if (submitting || !validate()) { nameRef.current?.focus(); return; }
    setSubmitting(true);
    try {
      if (!activeQuote) {
        const response=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:quoteSignature});
        if (!response.ok) { push(lang === 'ar' ? 'الشحن غير متاح للمحافظة أو الكوبون غير صالح. تواصل مع المتجر.' : 'Shipping is unavailable for this city or the coupon is invalid. Contact the store.', 'error'); return; }
        const result=await response.json();setQuote({...result,signature:quoteSignature});return;
      }
      const body = JSON.stringify({ customer, ...(coupon.trim() ? {coupon:coupon.trim().toUpperCase()} : {}), expectedShipping:activeQuote.shipping, expectedDiscount:activeQuote.discount, items: lines.map(({productId, ml, qty}) => ({productId, ml, qty, expectedPrice: activeQuote.prices.find(x=>x.productId===productId&&x.ml===ml)!.price})) });
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))), x => x.toString(16).padStart(2, '0')).join('');
      let pending: {digest:string;key:string} | null = null;
      try { pending = JSON.parse(sessionStorage.getItem('malika.pendingOrder') || 'null'); } catch { /* create a new key */ }
      if (!pending || pending.digest !== digest) { pending = {digest, key: crypto.randomUUID()}; sessionStorage.setItem('malika.pendingOrder', JSON.stringify(pending)); }
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': pending.key }, body });
      const result = await response.json();
      if (response.status === 409 && result.error === 'Prices changed') { setQuote(null); push(lang === 'ar' ? 'تغير السعر؛ احسب الإجمالي مجددًا.' : 'Prices changed; recalculate your total.', 'error'); return; }
      if (response.status === 409) { setQuote(null); push(lang === 'ar' ? 'تغير السعر أو المخزون. راجع السلة وأعد المحاولة.' : 'Price or stock changed. Refresh your cart and try again.', 'error'); return; }
      if (!response.ok) throw new Error('Order failed');
      // The optional message uses the server's recalculated subtotal, not stale cart prices.
      const message = `${lang === 'ar' ? 'رقم الطلب' : 'Order'}: ${result.id}\n${lang === 'ar' ? 'الإجمالي قبل الشحن' : 'Subtotal before shipping'}: ${result.subtotal}`;
      if (channel === 'whatsapp') openChannel(whatsappUrl(settings.whatsapp, message));
      else { await copyText(message); openChannel(messengerUrl(settings.messenger)); }
      setConfirmedSubtotal(result.total);
      setTracking(result.trackingToken);
      finish();
    } catch { push(lang === 'ar' ? 'تعذر حفظ الطلب، حاول مجدداً.' : 'Could not save order. Please try again.', 'error'); }
    finally { setSubmitting(false); }
  };
  const sendWhatsapp = () => void submitOrder('whatsapp');
  const sendMessenger = () => void submitOrder('messenger');

  const copyOrder = async () => {
    const ok = await copyText(cartMessage(lines, lang, settings, customer));
    push(ok ? t("cart.copied") : t("cart.copy"), ok ? "success" : "error");
  };

  if (!open) return null;

  return (
    <Portal>
    <div className="fixed inset-0 z-[125] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={t("cart.detailsTitle")}>
      <div onClick={onClose} className="anim-fade absolute inset-0 bg-ink/55 backdrop-blur-sm" />
      <div className="anim-pop safe-bottom relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[1.6rem] bg-bone shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-[1.8rem]">
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-4 sm:px-5">
          <div>
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-mist">
              <Truck className="h-3.5 w-3.5" /> {t("cart.deliveryEstimate")}
            </p>
            <h2 className="font-display mt-1 text-2xl leading-none sm:text-3xl">
              {step === "details" ? t("cart.detailsTitle") : t("cart.successTitle")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 transition hover:bg-ink hover:text-bone"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "details" ? (
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              sendWhatsapp();
            }}
            className="flex-1 overflow-y-auto px-4 py-4 sm:px-5"
          >
            <p className="text-[12px] leading-relaxed text-mist">{t("cart.detailsLead")}</p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-ink/10 bg-white/50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex -space-x-2 rtl:space-x-reverse">
                  {lines.slice(0, 3).map((line) => (
                    <SmartImage key={line.key} src={line.image} alt={line.name[lang]} className="h-9 w-8 rounded-md border border-bone" />
                  ))}
                </span>
                <span className="text-[11px] font-semibold text-ink/70">
                  {count} {t("cart.items")} · {formatPrice(displayedSubtotal, lang)}
                </span>
              </div>
              <button type="button" onClick={onClose} className="inline-flex items-center gap-1 text-[10px] font-bold text-plum underline decoration-acid decoration-2 underline-offset-2">
                {t("cart.back")}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("cart.fullName")} *</span>
                  <input
                    ref={nameRef}
                    value={customer.name}
                    onChange={(event) => set("name", event.target.value)}
                    className={cn("field", errors.name && "border-rose-400 bg-rose-50")}
                    placeholder={t("cart.namePh")}
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("cart.phone")} *</span>
                  <input
                    value={customer.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    className={cn("field", errors.phone && "border-rose-400 bg-rose-50")}
                    placeholder={t("cart.phonePh")}
                    inputMode="tel"
                    dir="ltr"
                    autoComplete="tel"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("cart.city")} *</span>
                <div className="relative">
                  <select
                    value={customer.city}
                    onChange={(event) => set("city", event.target.value)}
                    className={cn("field appearance-none pe-10", errors.city && "border-rose-400 bg-rose-50")}
                  >
                    <option value="">{t("cart.cityPh")}</option>
                    {governorates.map((governorate) => (
                      <option key={governorate.en} value={governorate.en}>
                        {l(governorate)}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("cart.address")} *</span>
                <textarea
                  value={customer.address}
                  onChange={(event) => set("address", event.target.value)}
                  rows={2}
                  className={cn("field resize-none", errors.address && "border-rose-400 bg-rose-50")}
                  placeholder={t("cart.addressPh")}
                  autoComplete="street-address"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{t("cart.noteField")}</span>
                <input
                  value={customer.note}
                  onChange={(event) => set("note", event.target.value)}
                  className="field"
                  placeholder={t("cart.notePh")}
                />
              </label>
            </div>

            <label className="mt-3 block"><span className="text-xs">{lang === 'ar' ? 'كود الخصم (اختياري)' : 'Coupon code (optional)'}</span><input className="field" value={coupon} maxLength={40} onChange={e=>setCoupon(e.target.value)} /></label>
            {activeQuote && <div className="mt-4 rounded-xl border border-ink/10 p-3 text-sm" role="status">
              <p className="font-bold">{lang === 'ar' ? 'راجع الأسعار قبل تأكيد الطلب:' : 'Review prices before confirming:'}</p>
              {activeQuote.prices.map(p=><p key={`${p.productId}:${p.ml}`}>{lines.find(x=>x.productId===p.productId && x.ml===p.ml)?.name[lang]} · {p.ml} ml: {formatPrice(p.price,lang)}</p>)}
              <p>{lang === 'ar' ? 'المنتجات' : 'Subtotal'}: {formatPrice(activeQuote.subtotal,lang)}</p><p>{lang === 'ar' ? 'الخصم' : 'Discount'}: {formatPrice(activeQuote.discount,lang)}</p><p>{lang === 'ar' ? 'الشحن' : 'Shipping'}: {formatPrice(activeQuote.shipping,lang)}</p><strong>{lang === 'ar' ? 'الإجمالي' : 'Total'}: {formatPrice(activeQuote.total,lang)}</strong>
            </div>}
            <div className="mt-4 rounded-xl border border-ink/10 bg-white/40 p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-mist">{t("cart.subtotal")}</span>
                <span className="font-display text-xl">{formatPrice(displayedSubtotal, lang)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-mist">
                <span>{t("cart.shipping")}</span>
                <span>{activeQuote ? formatPrice(activeQuote.shipping, lang) : t("cart.calc")}</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-acid/40 px-2 py-1.5 text-[10px] font-semibold text-ink">
                <Check className="h-3.5 w-3.5 shrink-0" /> {t("cart.cod")}
              </p>
            </div>

            <div className="sticky bottom-0 -mx-4 mt-4 space-y-2 border-t border-ink/10 bg-bone/95 px-4 pb-1 pt-3 backdrop-blur sm:-mx-5 sm:px-5">
              <Button type="submit" disabled={submitting} variant="acid" full size="lg" icon={<Whatsapp className="h-4 w-4" />} iconPosition="start">
                {activeQuote ? (lang === "ar" ? "تأكيد الطلب" : "Confirm order") : (lang === "ar" ? "حساب الإجمالي" : "Calculate total")}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" disabled={submitting} onClick={sendMessenger} icon={<Messenger className="h-3.5 w-3.5" />} iconPosition="start">
                  {activeQuote ? t("cart.sendMessenger") : (lang === "ar" ? "حساب الإجمالي" : "Calculate total")}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={copyOrder} icon={<Copy className="h-3.5 w-3.5" />} iconPosition="start">
                  {t("cart.copy")}
                </Button>
              </div>
              <p className="pb-1 text-center text-[10px] leading-relaxed text-mist">{t("cart.note")}</p>
            </div>
          </form>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-acid">
              <Check className="h-7 w-7 text-ink" />
            </span>
            <h3 className="font-display mt-4 text-3xl">{t("cart.successTitle")}</h3>
            <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-mist">{t("cart.successBody")}</p>
            {confirmedSubtotal !== null && <p className="mt-2">{lang === "ar" ? "الإجمالي المؤكد" : "Confirmed total"}: {formatPrice(confirmedSubtotal, lang)}</p>}
            {tracking && <a className="mt-3 underline" href={`#/track/${tracking}`}>{lang === "ar" ? "تتبع طلبك — احفظ الرابط" : "Track your order — save this link"}</a>}
            <div className="mt-6 w-full space-y-2">
              <Button
                variant="acid"
                full
                href={whatsappUrl(settings.whatsapp, lang === "ar" ? "تم تسجيل طلبي" : "My order has been placed")}
                icon={<Whatsapp className="h-4 w-4" />}
                iconPosition="start"
              >
                {t("cart.sendOrder")}
              </Button>
              <Button variant="outline" full onClick={onClose} icon={<ArrowRight className="h-4 w-4" />}>
                {t("cart.keepBag")}
              </Button>
              <Button
                variant="ghost"
                full
                size="sm"
                onClick={() => {
                  clear();
                  sessionStorage.removeItem("malika.pendingOrder");
                  onClose();
                }}
              >
                {t("cart.clearBag")}
              </Button>
            </div>
            <Send className="mt-6 h-4 w-4 text-mist/50" />
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
