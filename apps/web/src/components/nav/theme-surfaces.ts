/** Theme-aware site chrome. Opaque tokens only — no glass or white-on-cream. */
export {
  mobileNavItemClass,
  mobileNavSectionLabelClass,
  mobileNavSheetClass,
  mobileNavTextItemClass,
} from "./mobile-nav-surface";

export const themeBarClass =
  "border-b border-border bg-background text-foreground shadow-sm";

export const themeOverlayClass =
  "rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl";

export const themeDialogClass =
  "border border-border bg-popover text-popover-foreground shadow-2xl";

export const themeChipClass =
  "border-border bg-muted text-foreground hover:bg-accent";

export const themeNavIdleClass =
  "text-foreground hover:text-foreground hover:bg-accent";

export const themeNavActiveClass =
  "bg-primary/15 text-primary border border-primary/30";

export const themeMutedClass = "text-muted-foreground";
