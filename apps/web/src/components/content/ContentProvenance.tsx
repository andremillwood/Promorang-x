import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

type ContentProvenanceBadgeProps = {
  className?: string;
  compact?: boolean;
};

export function ContentProvenanceBadge({ className, compact = false }: ContentProvenanceBadgeProps) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/75 font-black uppercase text-white/80 backdrop-blur-md",
        compact ? "px-2 py-1 text-[9px] tracking-[0.14em]" : "px-2.5 py-1.5 text-[10px] tracking-[0.18em]",
        className,
      )}
      title={t("sample.title")}
    >
      <FlaskConical className="h-3 w-3 text-primary" aria-hidden="true" />
      {t("sample.badge")}
    </span>
  );
}

type SampleContentNoticeProps = {
  className?: string;
  noun?: string;
};

export function SampleContentNotice({ className, noun }: SampleContentNoticeProps) {
  const { t } = useI18n();
  const resolvedNoun = noun ?? t("sample.defaultNoun");
  return (
    <aside
      className={cn(
        "flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/55",
        className,
      )}
      aria-label={t("sample.aria")}
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <p>
        <strong className="font-bold text-white/85">{t("sample.disclosureLead", { noun: resolvedNoun })}</strong>{" "}
        {t("sample.disclosureBody")}
      </p>
    </aside>
  );
}
