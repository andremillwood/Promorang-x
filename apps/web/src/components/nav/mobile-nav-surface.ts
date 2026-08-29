/** High-contrast mobile drawer tokens. Opaque surfaces only — no glass/white-on-cream. */
export const mobileNavSheetClass =
  "max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-border bg-background text-foreground lg:hidden px-3 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]";

export const mobileNavSectionLabelClass =
  "text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2";

export const mobileNavItemClass =
  "flex items-center gap-2 p-2.5 rounded-xl bg-muted text-foreground font-medium transition hover:bg-accent";

export const mobileNavTextItemClass =
  "p-2.5 rounded-xl bg-muted text-foreground font-medium transition hover:bg-accent text-center";
