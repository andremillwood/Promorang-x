import type { SVGProps } from "react";

export type PromorangSemanticMarkKind = "move" | "explore" | "return" | "proof" | "kept";

type Props = Omit<SVGProps<SVGSVGElement>, "children"> & {
  kind: PromorangSemanticMarkKind;
  size?: number;
};

/**
 * PROMORANG-owned semantic marks.
 *
 * Utility actions should continue to use familiar UI icons. These marks are
 * reserved for product meaning: Move / Explore / Return / Proof / Kept.
 */
export function PromorangSemanticMark({ kind, size = 44, className = "", ...props }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    className,
    "aria-hidden": true,
    ...props,
  } as const;

  if (kind === "move") {
    return (
      <svg {...common}>
        <path d="M12 43C19 24 35 14 52 18" stroke="#FF6A00" strokeWidth="5" strokeLinecap="round" />
        <path d="M44 11L54 18L46 28" stroke="#F6C453" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="43" r="4" fill="#7A2E17" />
      </svg>
    );
  }

  if (kind === "explore") {
    return (
      <svg {...common}>
        <path d="M10 44C18 22 30 46 39 26C44 15 51 18 55 11" stroke="#FF6A00" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
        <circle cx="10" cy="44" r="4" fill="#F6C453" />
        <circle cx="39" cy="26" r="4" fill="#7A2E17" />
        <circle cx="55" cy="11" r="4" fill="#FF6A00" />
      </svg>
    );
  }

  if (kind === "return") {
    return (
      <svg {...common}>
        <path d="M48 19C39 10 22 13 16 26C11 37 17 49 29 50C39 51 47 44 48 35" stroke="#C65F1A" strokeWidth="6" strokeLinecap="round" />
        <path d="M12 24L17 13L28 17" stroke="#F6C453" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "proof") {
    return (
      <svg {...common}>
        <circle cx="32" cy="32" r="22" stroke="#FF6A00" strokeWidth="4" />
        <circle cx="32" cy="32" r="10" stroke="#F6C453" strokeWidth="3" />
        <circle cx="32" cy="32" r="3.5" fill="#FF6A00" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="12" y="12" width="40" height="40" rx="12" stroke="#F6C453" strokeWidth="3.5" />
      <circle cx="32" cy="32" r="11" fill="#7A2E17" stroke="#FF6A00" strokeWidth="3" />
      <circle cx="32" cy="32" r="3.5" fill="#EADCC6" />
    </svg>
  );
}
