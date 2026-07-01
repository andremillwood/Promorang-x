import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

type ContentProvenanceBadgeProps = {
  className?: string;
  compact?: boolean;
};

export function ContentProvenanceBadge({ className, compact = false }: ContentProvenanceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/75 font-black uppercase text-white/80 backdrop-blur-md",
        compact ? "px-2 py-1 text-[9px] tracking-[0.14em]" : "px-2.5 py-1.5 text-[10px] tracking-[0.18em]",
        className,
      )}
      title="Illustrative content provided by Promorang"
    >
      <FlaskConical className="h-3 w-3 text-primary" aria-hidden="true" />
      Sample
    </span>
  );
}

type SampleContentNoticeProps = {
  className?: string;
  noun?: string;
};

export function SampleContentNotice({ className, noun = "content" }: SampleContentNoticeProps) {
  return (
    <aside
      className={cn(
        "flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/55",
        className,
      )}
      aria-label="Sample content disclosure"
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <p>
        <strong className="font-bold text-white/85">Sample {noun}.</strong>{" "}
        These examples show how Promorang works. They are illustrative, not live listings or verified activity.
      </p>
    </aside>
  );
}
