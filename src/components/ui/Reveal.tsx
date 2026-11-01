import { useReveal } from "@/hooks/useUi";
import { cn } from "@/utils/cn";
import type { CSSProperties, ElementType, ReactNode, Ref } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Optional duration override in milliseconds when using a `variant`. */
  durationMs?: number;
  /** Any named motion class from the 200-motion catalog (e.g. "m-3d-flip-x-up", "m-clip-arch"). */
  variant?: string;
  /** Rendered element — defaults to a div. */
  as?: ElementType;
  scale?: boolean;
  id?: string;
}

/**
 * Props accepted by the dynamic tag. Declared explicitly because
 * @react-three/fiber augments the global JSX namespace, which makes an
 * unconstrained `ElementType` resolve its props to `never`.
 */
type RevealTagProps = {
  id?: string;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  className?: string;
  "data-motion"?: string;
  children?: ReactNode;
};

export function Reveal({ children, className, delay = 0, durationMs, variant, as, scale, id }: RevealProps) {
  const Tag = (as ?? "div") as unknown as (props: RevealTagProps) => ReactNode;
  const { ref, visible } = useReveal<HTMLDivElement>();

  const style: Record<string, string | undefined> = {};
  if (variant) {
    if (delay > 0) style["--m-delay"] = `${delay}ms`;
    if (durationMs) style["--m-dur"] = `${durationMs}ms`;
  } else if (visible && delay > 0) {
    style.transitionDelay = `${delay}ms`;
  }

  return (
    <Tag
      id={id}
      ref={ref}
      data-motion={variant}
      style={style as CSSProperties}
      className={cn(
        "reveal",
        !variant && scale && "reveal-scale",
        visible && "is-visible",
        visible && variant,
        className
      )}
    >
      {children}
    </Tag>
  );
}
