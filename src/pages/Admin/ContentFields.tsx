import { ChevronDown, Minus, Plus, Trash } from "@/components/ui/icons";
import { useLang } from "@/i18n/LanguageContext";
import type { Localized } from "@/types";
import { cn } from "@/utils/cn";
import { useState, type ReactNode } from "react";

/* Small, reusable building blocks for the content editor. */

export function Section({
  title,
  description,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/40">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition hover:bg-white/60"
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="text-[13px] font-bold">{title}</span>
            {badge && (
              <span className="rounded-full bg-bone-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-mist">
                {badge}
              </span>
            )}
          </span>
          {description && <span className="mt-0.5 block text-[10.5px] leading-relaxed text-mist">{description}</span>}
        </span>
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300",
            open ? "rotate-180 border-ink bg-ink text-bone" : "border-ink/15 text-ink"
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>
      {open && <div className="border-t border-ink/10 px-4 py-4">{children}</div>}
    </div>
  );
}

/** Paired Arabic + English inputs for one localized string. */
export function BilingualField({
  label,
  value,
  onChange,
  multiline,
  rows = 2,
  hint,
}: {
  label: string;
  value: Localized;
  onChange: (next: Localized) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const Input = multiline ? "textarea" : "input";
  return (
    <div className="mb-3">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-mist/70">English</span>
          <Input
            dir="ltr"
            rows={multiline ? rows : undefined}
            value={value.en}
            onChange={(event: { target: { value: string } }) => onChange({ ...value, en: event.target.value })}
            className={cn("field", multiline && "resize-y")}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[8.5px] font-bold uppercase tracking-[0.1em] text-mist/70">عربي</span>
          <Input
            dir="rtl"
            rows={multiline ? rows : undefined}
            value={value.ar}
            onChange={(event: { target: { value: string } }) => onChange({ ...value, ar: event.target.value })}
            className={cn("field", multiline && "resize-y")}
          />
        </label>
      </div>
      {hint && <span className="mt-1 block text-[9px] text-mist/80">{hint}</span>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  dir = "ltr",
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  dir?: "ltr" | "rtl";
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      <input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 400,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="mb-3">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink/15"
          aria-label="-"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="range-acid flex-1"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="press grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink/15"
          aria-label="+"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span className="w-16 shrink-0 text-end text-[12px] font-bold" dir="ltr">
          {value}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.14em] text-mist">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
        />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="field" dir="ltr" />
      </div>
    </label>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="mb-2 flex w-full items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white/50 px-3.5 py-3 text-start transition hover:border-ink/25"
    >
      <span className="min-w-0">
        <span className="block text-[12px] font-bold">{label}</span>
        {description && <span className="mt-0.5 block text-[10px] leading-relaxed text-mist">{description}</span>}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-ink" : "bg-ink/15"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full transition-all duration-300",
            checked ? "start-6 bg-acid" : "start-1 bg-white"
          )}
        />
      </span>
    </button>
  );
}

/** Add / remove wrapper for list items. */
export function RepeatableItem({
  index,
  onRemove,
  children,
  title,
}: {
  index: number;
  onRemove?: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="mb-3 rounded-xl border border-ink/10 bg-bone/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-mist">
          {title ?? `#${String(index + 1).padStart(2, "0")}`}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="press grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-mist hover:bg-rose-50 hover:text-rose-600"
            aria-label="remove"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  const { lang } = useLang();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink/25 px-3.5 py-2 text-[11px] font-bold text-plum transition hover:border-ink/50 hover:bg-white/60"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
