import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PromiseItem = {
  label: string;
  text: string;
};

type MarketingPromiseStripProps = {
  items: PromiseItem[];
  ctaLabel?: string;
  ctaHref?: string;
  variant?: "light" | "dark";
  className?: string;
};

export function MarketingPromiseStrip({
  items,
  ctaLabel,
  ctaHref,
  variant = "light",
  className,
}: MarketingPromiseStripProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "rounded-3xl border p-4 shadow-soft md:p-5",
        isDark
          ? "border-white/10 bg-white/[0.07] text-white"
          : "border-border bg-card text-foreground",
        className,
      )}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-2xl border p-4",
              isDark ? "border-white/10 bg-black/20" : "border-border/70 bg-background/70",
            )}
          >
            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "text-primary" : "text-primary/80")}>
              {item.label}
            </p>
            <p className={cn("mt-2 text-sm font-semibold leading-6", isDark ? "text-zinc-100" : "text-foreground")}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
      {ctaLabel && ctaHref ? (
        <Link
          to={ctaHref}
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition",
            isDark
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export default MarketingPromiseStrip;
