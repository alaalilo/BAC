import type { SVGProps } from "react";

export type CustomIconName =
  | "home"
  | "subjects"
  | "terms"
  | "focus"
  | "calculator"
  | "settings"
  | "math"
  | "physics"
  | "biology"
  | "technology"
  | "arabic"
  | "language"
  | "translation"
  | "third-language"
  | "philosophy"
  | "geography"
  | "islamic"
  | "economy"
  | "accounting"
  | "law"
  | "book";

type CustomIconProps = SVGProps<SVGSVGElement> & {
  name: CustomIconName;
  size?: number;
};

/** Small, consistent line icons drawn specifically for the platform. */
export function CustomIcon({ name, size = 20, ...props }: CustomIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    focusable: false as const,
    ...props,
  };

  switch (name) {
    case "home":
      return <svg {...common}><path d="m3 10 9-7 9 7"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-6h6v6"/><path d="M17 5.8V3.5h2.2v4"/></svg>;
    case "subjects":
      return <svg {...common}><path d="M3 5.6c3.2-1.4 6.2-1.1 9 1v13c-2.8-2.1-5.8-2.4-9-1z"/><path d="M21 5.6c-3.2-1.4-6.2-1.1-9 1v13c2.8-2.1 5.8-2.4 9-1z"/><path d="M6 9h3M6 12h3M15 9h3M15 12h3"/></svg>;
    case "terms":
      return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 11h5M8 15h4"/><path d="m15.5 14.5 1.2 1.2 2.3-2.6"/></svg>;
    case "focus":
      return <svg {...common}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/><path d="m16.8 7.2 4-4M17 3h3.8v3.8"/></svg>;
    case "calculator":
      return <svg {...common}><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="8" y="5.5" width="8" height="3.2" rx=".7"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 19h.01M12 19h3.5"/></svg>;
    case "settings":
      return <svg {...common}><path d="M12 2.8 14 4l2.3-.2.9 2.2 2 1.2-.5 2.3 1.1 2-1.5 1.8-.1 2.3-2.3.7-1.4 1.8-2.2-.8-2.2.8-1.4-1.8-2.3-.7-.1-2.3-1.5-1.8 1.1-2-.5-2.3 2-1.2.9-2.2L10 4z"/><circle cx="12" cy="11.8" r="3.1"/></svg>;
    case "math":
      return <svg {...common}><path d="M5 19 18.5 5.5M7 5h12v12"/><circle cx="7" cy="18" r="2.2"/><path d="M4 8h6M7 5v6"/><path d="M14 14h6"/></svg>;
    case "physics":
      return <svg {...common}><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>;
    case "biology":
      return <svg {...common}><path d="M12 21v-9"/><path d="M12 15C6 15 4 11 4.5 6c5.3-.1 8.1 2.7 7.5 9Z"/><path d="M12 12c0-5 3.1-8 7.5-8-.1 5.2-2.8 8.2-7.5 8Z"/><path d="M7.5 9.2 12 14M16.8 7 12 12"/></svg>;
    case "technology":
      return <svg {...common}><rect x="6.5" y="6.5" width="11" height="11" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".8"/><path d="M9 2.5v4M15 2.5v4M9 17.5v4M15 17.5v4M2.5 9h4M2.5 15h4M17.5 9h4M17.5 15h4"/></svg>;
    case "arabic":
      return <svg {...common}><path d="M4 19.5h16"/><path d="M6 16.5 15.5 5l2.5 2.1-9.5 11.4-3.5 1z"/><path d="m13.7 7.2 2.5 2"/><path d="M5 4.5h5"/></svg>;
    case "language":
      return <svg {...common}><path d="M4 5h11M9.5 3v2M6.5 5c.4 4.3 2.5 7.2 6 9"/><path d="M12 5c-.7 3.6-3 6.5-6.7 8"/><path d="m11 19 3.3-8 3.3 8M12.2 16h4.2M17 4h3M18.5 2.5v3"/></svg>;
    case "translation":
      return <svg {...common}><path d="M4 7h12M10 4v3M6.5 7c.5 3.5 2.2 5.7 5.5 7"/><path d="M13 7c-.7 2.7-2.2 4.8-5.5 6.5"/><path d="M14 17h6M17 14l3 6"/><path d="m4 19 3-6 3 6"/></svg>;
    case "third-language":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.2 5.4 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.4-3.2-9s1-6.6 3.2-9Z"/><path d="m16.5 6 2 2-2 2M7.5 18l-2-2 2-2"/></svg>;
    case "philosophy":
      return <svg {...common}><path d="M8 16.5c-1.7-1.2-2.8-3.1-2.8-5.3a6.8 6.8 0 1 1 13.6 0c0 2.2-1.1 4.1-2.8 5.3-.7.5-1 1.3-1 2.1H9c0-.8-.3-1.6-1-2.1Z"/><path d="M9.5 21h5M10 18.6h4M12 7.5v4M10 9.5h4"/></svg>;
    case "geography":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.3 2.5 3.4 5.5 3.4 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.4 5.5-3.4 9S9.7 18.5 12 21"/><path d="m15.5 7.5 2 1.2-1.2 2.1"/></svg>;
    case "islamic":
      return <svg {...common}><path d="M15.8 3.5A8.8 8.8 0 1 0 20.5 17 7.4 7.4 0 0 1 15.8 3.5Z"/><path d="m17.8 7.2.6 1.4 1.5.1-1.2.9.4 1.5-1.3-.8-1.2.8.4-1.5-1.2-.9 1.5-.1z"/><path d="M4 19.5h10M6 17V14l3-2 3 2v3"/></svg>;
    case "economy":
      return <svg {...common}><path d="M4 20V11h4v9M10 20V7h4v13M16 20V3h4v17"/><path d="m4 8 5-3 4 1 6-4"/><path d="M16 2h3v3"/></svg>;
    case "accounting":
      return <svg {...common}><rect x="4.5" y="3" width="15" height="18" rx="2.5"/><rect x="7.5" y="6" width="9" height="3" rx=".7"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>;
    case "law":
      return <svg {...common}><path d="M12 3v17M7 20h10M5 6h14M12 3l-2 3M12 3l2 3"/><path d="m6 6-3 7h6L6 6ZM18 6l-3 7h6l-3-7Z"/><path d="M3 13c.5 2 1.5 3 3 3s2.5-1 3-3M15 13c.5 2 1.5 3 3 3s2.5-1 3-3"/></svg>;
    case "book":
    default:
      return <svg {...common}><path d="M4 5.5c3-1.2 5.7-.7 8 1.2v13c-2.3-1.9-5-2.4-8-1.2z"/><path d="M20 5.5c-3-1.2-5.7-.7-8 1.2v13c2.3-1.9 5-2.4 8-1.2z"/><path d="M7 9h2M7 12h2M15 9h2M15 12h2"/></svg>;
  }
}

export function subjectIconName(id: string): CustomIconName {
  const icons: Record<string, CustomIconName> = {
    math: "math",
    phys: "physics",
    nat: "biology",
    tech: "technology",
    ar: "arabic",
    fr: "language",
    en: "translation",
    L3: "third-language",
    ph: "philosophy",
    hg: "geography",
    isl: "islamic",
    mgt: "economy",
    acc: "accounting",
    law: "law",
  };
  return icons[id] ?? "book";
}
