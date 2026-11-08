import { Check, ChevronDown } from "@/components/ui/icons";
import { cn } from "@/utils/cn";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
}

type MenuPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

/** A styled, keyboard-accessible select whose menu is portalled above clipping containers. */
export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  className,
  buttonClassName,
  disabled = false,
  dir,
}: SelectProps) {
  const generatedId = useId();
  const id = `select-${generatedId.replace(/:/g, "")}`;
  const listboxId = `${id}-listbox`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => setReady(true), []);

  const resolveDirection = useCallback(
    () => dir ?? (typeof document !== "undefined" && document.documentElement.dir === "rtl" ? "rtl" : "ltr"),
    [dir]
  );

  const measurePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === "undefined") return;
    const rect = trigger.getBoundingClientRect();
    const edge = 8;
    const width = Math.min(rect.width, window.innerWidth - edge * 2);
    const rtl = resolveDirection() === "rtl";
    const alignedLeft = rtl ? rect.right - width : rect.left;
    const left = Math.max(edge, Math.min(window.innerWidth - width - edge, alignedLeft));
    const estimatedHeight = Math.min(options.length * 42 + 12, 288);
    const below = Math.max(0, window.innerHeight - rect.bottom - 12);
    const above = Math.max(0, rect.top - 12);
    const openAbove = below < Math.min(estimatedHeight, 220) && above > below;
    const available = openAbove ? above : below;
    const maxHeight = Math.max(96, Math.min(288, available || 288));

    setPosition({
      left,
      width,
      maxHeight,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }),
    });
  }, [options.length, resolveDirection]);

  useEffect(() => {
    if (!open) return;
    measurePosition();
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", measurePosition);
    window.addEventListener("scroll", measurePosition, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", measurePosition);
      window.removeEventListener("scroll", measurePosition, true);
    };
  }, [measurePosition, open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const firstEnabledIndex = (from: number, direction: 1 | -1): number => {
    if (options.length === 0) return 0;
    for (let step = 0; step < options.length; step += 1) {
      const index = (from + step * direction + options.length) % options.length;
      if (!options[index].disabled) return index;
    }
    return from;
  };

  const showMenu = (from = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(firstEnabledIndex(from, 1));
    setPosition(null);
    setOpen(true);
  };

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        showMenu(event.key === "ArrowDown" ? selectedIndex : selectedIndex < 0 ? options.length - 1 : selectedIndex);
      } else {
        setActiveIndex((current) => firstEnabledIndex(current + direction, direction));
      }
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(firstEnabledIndex(event.key === "Home" ? 0 : options.length - 1, event.key === "Home" ? 1 : -1));
      if (!open) showMenu(event.key === "Home" ? 0 : options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) showMenu();
      else if (options[activeIndex]) choose(options[activeIndex]);
      return;
    }
    if (event.key === "Tab") setOpen(false);
  };

  const menuStyle: CSSProperties | undefined = position
    ? {
        position: "fixed",
        zIndex: 200,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        ...(position.top !== undefined ? { top: position.top } : {}),
        ...(position.bottom !== undefined ? { bottom: position.bottom } : {}),
      }
    : undefined;

  return (
    <div className={cn("relative min-w-0", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        dir={dir}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-option-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : showMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-ink/12 bg-surface/80 px-4 text-start text-[12px] font-semibold text-ink shadow-sm transition duration-200 hover:border-ink/25 hover:bg-surface focus:border-plum focus:outline-none focus:ring-4 focus:ring-lilac/25 disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-plum shadow-[0_0_0_4px_rgba(201,181,247,0.2)]",
          buttonClassName
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-mist")}>
          {selected?.label ?? placeholder ?? "—"}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-mist transition-transform duration-200", open && "rotate-180 text-plum")} />
      </button>

      {ready && open && position && menuStyle && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          dir={dir ?? resolveDirection()}
          style={menuStyle}
          className="overflow-y-auto overscroll-contain rounded-2xl border border-ink/12 bg-bone p-1.5 text-ink shadow-[0_20px_55px_-18px_rgba(20,16,25,0.5)] ring-1 ring-ink/5 backdrop-blur-xl"
        >
          {options.map((option, index) => {
            const selectedOption = option.value === value;
            const active = activeIndex === index;
            return (
              <div
                key={option.value}
                ref={(node) => { optionRefs.current[index] = node; }}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={selectedOption}
                aria-disabled={option.disabled || undefined}
                onMouseMove={() => !option.disabled && setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-start text-[12px] font-semibold transition-colors",
                  selectedOption ? "bg-ink text-bone" : active ? "bg-lilac-soft text-ink" : "text-ink/75 hover:bg-lilac-soft/70 hover:text-ink",
                  option.disabled && "cursor-not-allowed opacity-40"
                )}
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {selectedOption && <Check className="h-3.5 w-3.5 shrink-0 text-acid" />}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
