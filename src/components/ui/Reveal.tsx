import { useReveal } from "@/hooks/useUi";
import { cn } from "@/utils/cn";
import type { CSSProperties, ElementType, ReactNode, Ref } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
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
  children?: ReactNode;
};

export function Reveal({ children, className, delay = 0, as, scale, id }: RevealProps) {
  const Tag = (as ?? "div") as unknown as (props: RevealTagProps) => ReactNode;
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <Tag
      id={id}
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined }}
      className={cn("reveal", scale && "reveal-scale", visible && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}
