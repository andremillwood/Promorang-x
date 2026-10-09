import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { findOrAskSearchHref, type FindOrAskIntent } from "@promorang/shared";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";
import { useInstantSearch } from "@/hooks/useInstantSearch";

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
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const instant = useInstantSearch(query);
  const results = (instant.data || []).slice(0, 6);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, maxHeight: 0 });
  const isOpen = showResults && query.trim().length >= 2;
  const listId = `find-or-ask-results-${source}`;

  useLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const rect = rootRef.current?.querySelector("form")?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const bottom = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight);
      const viewportTop = (viewport?.offsetTop || 0) + 8;
      const belowTop = Math.max(rect.bottom + 8, viewportTop);
      const below = Math.max(0, bottom - belowTop - 12);
      const above = Math.max(0, rect.top - viewportTop - 8);
      const placeAbove = below < 160 && above > below;
      const maxHeight = Math.min(384, placeAbove ? above : below);
      const top = placeAbove ? rect.top - maxHeight - 8 : belowTop;
      setBounds({ left: rect.left, top, width: rect.width, maxHeight });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const dismissOutside = (event: Event) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setShowResults(false);
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    setShowResults(false);
    inputRef.current?.blur();
    onSubmit?.();
    navigate(findOrAskSearchHref({ query: nextQuery, city, language: locale, source }));
  }

  function openResult(index: number) {
    const result = results[index];
    if (!result) return;
    setShowResults(false);
    inputRef.current?.blur();
    onSubmit?.();
    navigate(result.path);
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)} onKeyDown={(event) => { if (event.key === "Escape") { inputRef.current?.focus(); setShowResults(false); } }}>
      <form
        id={`find-or-ask-form-${source}`}
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
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={isOpen && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          id={`find-or-ask-${source}`}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setShowResults(true); setActiveIndex(0); }}
          onFocus={() => setShowResults(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && results.length) { event.preventDefault(); setShowResults(true); setActiveIndex((current) => (current + 1) % results.length); }
            if (event.key === "ArrowUp" && results.length) { event.preventDefault(); setShowResults(true); setActiveIndex((current) => (current - 1 + results.length) % results.length); }
            if (event.key === "Enter" && showResults && results[activeIndex]) { event.preventDefault(); openResult(activeIndex); }
            if (event.key === "Escape") setShowResults(false);
          }}
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
      {isOpen ? createPortal(
        <div ref={listRef} id={listId} role="listbox" aria-label={t("findOrAsk.searchLabel")} style={{ ...bounds, WebkitOverflowScrolling: "touch" }} className="fixed z-[100] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-[#0b0b0b] p-2 text-left shadow-[0_28px_80px_rgba(0,0,0,.72)] backdrop-blur-xl">
          {instant.isSearching && !results.length ? <div className="flex items-center gap-2 px-4 py-5 text-xs text-white/55"><Loader2 className="h-4 w-4 animate-spin text-orange-400" />{t("search.searching")}</div> : results.length ? results.map((result, index) => <button key={`${result.result_type}-${result.id}`} id={`${listId}-${index}`} type="button" role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => openResult(index)} className={cn("grid w-full grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2 text-left transition", index === activeIndex ? "bg-orange-500/12" : "hover:bg-white/[.05]")}><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white/[.06] text-orange-300">{result.image_url ? <img src={result.image_url} alt="" className="h-full w-full object-cover" /> : <Search className="h-4 w-4" />}</span><span className="min-w-0"><span className="block truncate text-sm font-bold text-white">{result.title}</span><span className="block truncate text-[11px] text-white/45">{result.subtitle}</span></span><span className="pr-2 text-[9px] font-black uppercase tracking-[.08em] text-white/35">{result.result_type}</span></button>) : null}
          {results.length ? <button type="submit" form={`find-or-ask-form-${source}`} className="mt-1 flex w-full items-center justify-between rounded-xl border-t border-white/10 px-3 py-3 text-xs font-black text-orange-300">{t("search.button")} “{query.trim()}”<ArrowRight className="h-4 w-4" /></button> : null}
        </div>, document.body
      ) : null}
      {!compact ? (
        <p className="mt-3 text-xs leading-5 text-white/50">{t("findOrAsk.promise")}</p>
      ) : null}
    </div>
  );
}
