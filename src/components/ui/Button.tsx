import { Link } from "@/lib/router";
import { cn } from "@/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "acid" | "outline" | "ghost" | "light" | "dark" | "lilac";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bone hover:bg-plum shadow-lg shadow-ink/10",
  acid: "bg-acid text-ink hover:bg-acid-deep shadow-lg shadow-acid/25",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-bone",
  ghost: "text-ink hover:bg-ink/[0.06]",
  light: "bg-bone text-ink hover:bg-white shadow-lg shadow-black/10",
  dark: "bg-plum text-bone hover:bg-plum-2 border border-white/10",
  lilac: "bg-lilac text-ink hover:bg-lilac-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[12px] gap-1.5",
  md: "h-11 px-5 text-[13px] gap-2",
  lg: "h-13 px-7 text-sm gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  href,
  icon,
  iconPosition = "end",
  full,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = cn(
    "group/btn inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    full && "w-full",
    className
  );

  const content = (
    <>
      {icon && iconPosition === "start" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "end" && (
        <span className="shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
