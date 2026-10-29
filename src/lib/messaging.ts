import { formatNumber, formatPrice } from "@/lib/format";
import type { CartLine, Lang, Product, SiteSettings } from "@/types";

/** Chat clients should receive plain text — strip the UI-only bidi isolates. */
function chatNumber(value: number, lang: Lang): string {
  return formatNumber(value, lang).replace(/[\u2066-\u2069]/g, "");
}

function chatPrice(value: number, lang: Lang): string {
  return formatPrice(value, lang).replace(/[\u2066-\u2069]/g, "");
}

export function cleanPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function messengerUrl(username: string): string {
  const handle = username.replace(/^@/, "").replace(/^https?:\/\/(www\.)?(m\.me|facebook\.com)\//, "");
  return `https://m.me/${handle || "malika.perfumes"}`;
}

export function instagramUrl(username: string): string {
  const handle = username.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "");
  return `https://instagram.com/${handle || "malika.perfumes"}`;
}

export function openChannel(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function productMessage(product: Product, ml: number, price: number, lang: Lang): string {
  const name = product.name[lang];
  if (lang === "ar") {
    return [
      "مرحباً مليكة 🌿",
      `مهتم بعطر: ${name}`,
      `الحجم: ${chatNumber(ml, lang)} مل — ${chatPrice(price, lang)}`,
      "هل هو متوفر الآن؟",
    ].join("\n");
  }
  return [
    "Hello MALIKA 🌿",
    `I'm interested in: ${name}`,
    `Size: ${ml} ml — ${chatPrice(price, lang)}`,
    "Is it available right now?",
  ].join("\n");
}

export interface OrderCustomer {
  name: string;
  phone: string;
  city: string;
  address: string;
  note?: string;
}

/**
 * Full order message: every bag line, quantities, subtotal, delivery logic and
 * the customer's details — ready to paste into WhatsApp or Messenger.
 */
export function cartMessage(
  lines: CartLine[],
  lang: Lang,
  _settings: SiteSettings,
  customer?: OrderCustomer
): string {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  if (lang === "ar") {
    const header = customer
      ? `مرحباً مليكة 🌿 أريد تأكيد هذا الطلب:`
      : `مرحباً مليكة 🌿 أريد الاستفسار عن هذا الطلب:`;
    const items = lines.map(
      (line, index) =>
        `${chatNumber(index + 1, lang)}. ${line.name.ar} — ${chatNumber(line.ml, lang)} مل × ${chatNumber(
          line.qty,
          lang
        )} = ${chatPrice(line.price * line.qty, lang)}`
    );
    const totals = [
      "—",
      `عدد القطع: ${chatNumber(lines.reduce((sum, line) => sum + line.qty, 0), lang)}`,
      `الإجمالي: ${chatPrice(subtotal, lang)}`,
      `التوصيل: يُحدد حسب المحافظة`,
      `الدفع: عند الاستلام`,
    ];
    const details = customer
      ? [
          "—",
          "بيانات التوصيل:",
          `الاسم: ${customer.name}`,
          `الهاتف: ${customer.phone}`,
          `المحافظة: ${customer.city}`,
          `العنوان: ${customer.address}`,
          customer.note ? `ملاحظات: ${customer.note}` : "",
        ].filter(Boolean)
      : ["—", "اسمي:", "العنوان:", "رقم الهاتف:"];
    return [header, "", ...items, "", ...totals, ...details].join("\n");
  }

  const header = customer
    ? "Hello MALIKA 🌿 I'd like to confirm this order:"
    : "Hello MALIKA 🌿 I'd like to ask about this order:";
  const items = lines.map(
    (line, index) =>
      `${index + 1}. ${line.name.en} — ${line.ml}ml × ${line.qty} = ${chatPrice(
        line.price * line.qty,
        lang
      )}`
  );
  const totals = [
    "—",
    `Items: ${lines.reduce((sum, line) => sum + line.qty, 0)}`,
    `Subtotal: ${chatPrice(subtotal, lang)}`,
    `Shipping: Calculated per governorate`,
    "Payment: cash on delivery",
  ];
  const details = customer
    ? [
        "—",
        "Delivery details:",
        `Name: ${customer.name}`,
        `Phone: ${customer.phone}`,
        `City: ${customer.city}`,
        `Address: ${customer.address}`,
        customer.note ? `Notes: ${customer.note}` : "",
      ].filter(Boolean)
    : ["—", "My name:", "Address:", "Phone number:"];
  return [header, "", ...items, "", ...totals, ...details].join("\n");
}

/** Deep link that copies the order for Messenger, which cannot prefill text. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function contactMessage(payload: {
  name: string;
  phone: string;
  subject: string;
  message: string;
  lang: Lang;
}): string {
  const { name, phone, subject, message, lang } = payload;
  if (lang === "ar") {
    return [
      "مرحباً فريق مليكة،",
      `الاسم: ${name}`,
      `الهاتف: ${phone}`,
      `الموضوع: ${subject}`,
      "",
      message,
    ].join("\n");
  }
  return [
    "Hello MALIKA team,",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `About: ${subject}`,
    "",
    message,
  ].join("\n");
}
