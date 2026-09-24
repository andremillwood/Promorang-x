import { FormEvent, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { findOrAskSearchHref, type FindOrAskIntent } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

type FindOrAskEntryProps = {
  source: FindOrAskIntent["source"];
  city?: string;
  className?: string;
  compact?: boolean;
  initialQuery?: string;
  onSubmit?: () => void;
};

export function FindOrAskEntry({
  source,
  city,
  className,
  compact = false,
  initialQuery = "",
  onSubmit,
}: FindOrAskEntryProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    onSubmit?.();
    navigate(findOrAskSearchHref({ query: nextQuery, city, source }));
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={submit}
        role="search"
        aria-label={t("findOrAsk.searchLabel")}
        className={cn(
          "group flex items-center rounded-2xl border border-white/15 bg-black/65 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,.35)] backdrop-blur-xl transition focus-within:border-orange-400/70 focus-within:ring-2 focus-within:ring-orange-400/20",
          compact ? "min-h-11 rounded-xl" : "min-h-16 sm:min-h-[4.5rem]",
        )}
      >
        <Search className={cn("ml-3 shrink-0 text-orange-400", compact ? "h-4 w-4" : "h-5 w-5 sm:ml-4")} aria-hidden="true" />
        <label htmlFor={`find-or-ask-${source}`} className="sr-only">
          {t("findOrAsk.searchLabel")}
        </label>
        <input
          id={`find-or-ask-${source}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("findOrAsk.placeholder")}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-3 text-white outline-none placeholder:text-white/40",
            compact ? "text-xs" : "text-sm sm:px-4 sm:text-lg",
          )}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-500 font-black text-black transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-45",
            compact ? "h-8 px-3 text-[10px] uppercase tracking-[0.08em]" : "min-h-12 px-4 text-xs uppercase tracking-[0.08em] sm:px-6",
          )}
        >
          {compact ? t("findOrAsk.findShort") : t("findOrAsk.find")}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>
      {!compact ? (
        <p className="mt-3 text-xs leading-5 text-white/50">{t("findOrAsk.promise")}</p>
      ) : null}
    </div>
  );
}
