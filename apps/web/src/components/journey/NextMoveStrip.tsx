import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import type { MemberNextMove } from "@/lib/member-next-move";
import { cn } from "@/lib/utils";

type NextMoveStripProps = {
  move: MemberNextMove;
  className?: string;
};

export function NextMoveStrip({ move, className }: NextMoveStripProps) {
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-orange-500/30 bg-[#141211]/90 p-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300">
          {t("nextMove.eyebrow")}
        </p>
        <p className="mt-1 truncate text-sm font-black text-white">{t(move.titleKey, move.vars)}</p>
        <p className="truncate text-[12px] text-white/60">{t(move.whyKey, move.vars)}</p>
      </div>
      <Link
        to={move.href}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-black text-white"
      >
        {t(move.ctaKey, move.vars)}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </aside>
  );
}
