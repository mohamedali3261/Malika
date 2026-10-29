import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, strokeWidth = 1.6, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Base>
);
export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Base>
);
export const ArrowDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </Base>
);
export const Bag = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 8h12l1 12H5L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Base>
);
export const Heart = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3c0 5-7.5 9.6-7.5 9.6Z" />
  </Base>
);
export const Menu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Base>
);
export const X = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Base>
);
export const Sliders = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="10" cy="16" r="2" />
  </Base>
);
export const Globe = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.3 3.8 8.5S14.5 18.1 12 20.5C9.5 18.1 8.2 15.2 8.2 12S9.5 5.9 12 3.5Z" />
  </Base>
);
export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);
export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);
export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
export const Minus = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);
export const Trash = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v5M14 11v5" />
  </Base>
);
export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Base>
);
export const Star = ({ filled = true, ...p }: IconProps & { filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.4}
    aria-hidden="true"
    {...p}
  >
    <path d="m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.3-5.6-3.2-5.6 3.2 1.3-6.3L3 9.6l6.3-.7L12 3Z" />
  </svg>
);
export const Sparkle = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v5M12 16v5M4.5 12h5M14.5 12h5M6.8 6.8l3 3M14.2 14.2l3 3M17.2 6.8l-3 3M9.8 14.2l-3 3" />
  </Base>
);
export const Whatsapp = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.86.5 3.6 1.44 5.1L2 22l5.2-1.6a9.9 9.9 0 0 0 4.84 1.24c5.44 0 9.84-4.4 9.84-9.84C21.88 6.4 17.48 2 12.04 2Zm0 17.9c-1.62 0-3.14-.46-4.44-1.28l-.32-.2-3.1.94.94-3.02-.22-.32a8 8 0 0 1-1.26-4.28c0-4.42 3.6-8.02 8.04-8.02 4.42 0 8.02 3.6 8.02 8.02 0 4.44-3.6 8.16-7.66 8.16Zm4.4-5.98c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.38.1-.5.12-.12.26-.3.4-.46.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.7 4.12 3.68.58.24 1.02.38 1.38.5.58.18 1.1.16 1.52.1.46-.08 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
  </svg>
);
export const Messenger = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2C6.3 2 2 6.2 2 11.7c0 3 .1 4.9 1.7 6.6.9 1 2.3 1.6 3.9 1.7l.4 2.2c.6-.1 1.5-.7 2.2-1.3 1.9.5 4 .5 5.8-.1C19.9 19.3 22 15.9 22 11.7 22 6.2 17.7 2 12 2Zm1.6 12.5-2.3-2.4-4.5 2.4L9 10.2l2.4 2.4 4.4-2.4-2.2 4.3Z" />
  </svg>
);
export const Instagram = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </Base>
);
export const Mail = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.8 6.5 8.2 6 8.2-6" />
  </Base>
);
export const Phone = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z" />
  </Base>
);
export const MapPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);
export const Truck = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 6h11v11H2zM13 10h4l4 3v4h-8" />
    <circle cx="6" cy="18.5" r="1.8" />
    <circle cx="17" cy="18.5" r="1.8" />
  </Base>
);
export const Leaf = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4c0 9-5 14-13 14H5c0-9 5-13 15-14Z" />
    <path d="M4 21c2-6 6-9 11-11" />
  </Base>
);
export const Flask = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 19l-5-10V3" />
    <path d="M7.5 14h9" />
  </Base>
);
export const Gift = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 9h18v4H3zM4 13v8h16v-8M12 9v12" />
    <path d="M12 9C9 9 7 8 7 6a2.5 2.5 0 0 1 5-1c.6 1.4 0 4 0 4Zm0 0c3 0 5-1 5-3a2.5 2.5 0 0 0-5-1c-.6 1.4 0 4 0 4Z" />
  </Base>
);
export const Github = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);
export const Lock = (p: IconProps) => (
  <Base {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v2.5" />
  </Base>
);
export const Download = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
  </Base>
);
export const Copy = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
  </Base>
);
export const KeyRound = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="8" r="4.5" />
    <path d="m11.5 11.5 8 8M16 16l2-2M18.5 18.5l2-2" />
  </Base>
);
export const Upload = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
  </Base>
);
export const Pencil = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4L20 8l-4-4L4 16v4ZM14 6l4 4" />
  </Base>
);
export const Refresh = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 6.1M20 4v7h-7" />
  </Base>
);
export const Eye = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);
export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);
export const Shield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);
export const Quote = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M9.5 5C6 6.8 4 9.8 4 13.4 4 16.3 5.6 18 7.9 18c2 0 3.6-1.4 3.6-3.4 0-1.9-1.3-3.3-3.2-3.3-.4 0-.8.1-1 .2.4-1.8 1.8-3.3 3.6-4.3L9.5 5Zm9 0C15 6.8 13 9.8 13 13.4c0 2.9 1.6 4.6 3.9 4.6 2 0 3.6-1.4 3.6-3.4 0-1.9-1.3-3.3-3.2-3.3-.4 0-.8.1-1 .2.4-1.8 1.8-3.3 3.6-4.3L18.5 5Z" />
  </svg>
);
export const Share = (p: IconProps) => (
  <Base {...p}>
    <circle cx="18" cy="5.5" r="2.8" />
    <circle cx="6" cy="12" r="2.8" />
    <circle cx="18" cy="18.5" r="2.8" />
    <path d="m8.5 10.6 7-3.7M8.5 13.4l7 3.7" />
  </Base>
);
export const Send = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" />
  </Base>
);
export const Box = (p: IconProps) => (
  <Base {...p}>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </Base>
);
