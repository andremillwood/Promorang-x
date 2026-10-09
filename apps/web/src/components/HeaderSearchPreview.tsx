import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Calendar, Clock3, Compass, CornerDownLeft, Gift, Loader2, MapPin, Search, Sparkles, Store, Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { searchPromorang, type GlobalSearchResult, type GlobalSearchResultType } from "@/lib/global-search";
import { cn } from "@/lib/utils";

const RECENT_SEARCH_KEY = "promorang_recent_searches";
const suggestedSearches = ["Kingston", "Live music", "Food", "Free", "Sea Deck"];

const typeConfig: Record<GlobalSearchResultType, { label: string; icon: typeof Search; tint: string }> = {
  moment: { label: "Moments", icon: Calendar, tint: "text-orange-300 bg-orange-500/12" },
  venue: { label: "Places", icon: MapPin, tint: "text-emerald-300 bg-emerald-500/12" },
  discovery: { label: "Discoveries", icon: Compass, tint: "text-sky-300 bg-sky-500/12" },
  offer: { label: "Offers", icon: Gift, tint: "text-amber-300 bg-amber-500/12" },
  product: { label: "Products & services", icon: Store, tint: "text-amber-300 bg-amber-500/12" },
  brand: { label: "Brands", icon: Building2, tint: "text-violet-300 bg-violet-500/12" },
  merchant: { label: "Merchants", icon: Store, tint: "text-emerald-300 bg-emerald-500/12" },
  host: { label: "Hosts", icon: Users, tint: "text-fuchsia-300 bg-fuchsia-500/12" },
  user: { label: "People", icon: Users, tint: "text-fuchsia-300 bg-fuchsia-500/12" },
};
const groupOrder: GlobalSearchResultType[] = ["moment", "venue", "discovery", "offer", "product", "merchant", "brand", "host", "user"];

function readRecentSearches() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const clean = term.trim();
  if (clean.length < 2) return;
  const next = [clean, ...readRecentSearches().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
  localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
}

function Highlight({ value, query }: { value: string; query: string }) {
  const normalized = query.trim();
  if (!normalized) return <>{value}</>;
  const index = value.toLowerCase().indexOf(normalized.toLowerCase());
  if (index < 0) return <>{value}</>;
  return <>{value.slice(0, index)}<mark className="bg-transparent font-black text-orange-300">{value.slice(index, index + normalized.length)}</mark>{value.slice(index + normalized.length)}</>;
}

export const HeaderSearchPreview: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { t: webT } = useI18n();
  const { t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTerm(searchTerm.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(readRecentSearches());
      window.setTimeout(() => inputRef.current?.focus(), 40);
      return;
    }
    setSearchTerm("");
    setDebouncedTerm("");
    setActiveIndex(0);
  }, [isOpen]);

  const searchQuery = useQuery({
    queryKey: ["header-instant-search", debouncedTerm],
    enabled: debouncedTerm.length >= 2,
    queryFn: () => searchPromorang(debouncedTerm),
    staleTime: 60_000,
  });
  const groupedResults = useMemo(() => groupOrder.flatMap((type) => {
    const items = (searchQuery.data || []).filter((item) => item.result_type === type).slice(0, 4);
    return items.length ? [{ type, items }] : [];
  }), [searchQuery.data]);
  const visibleResults = useMemo(() => groupedResults.flatMap((group) => group.items), [groupedResults]);
  const searching = searchTerm.trim().length >= 2 && (searchQuery.isFetching || debouncedTerm !== searchTerm.trim());

  useEffect(() => setActiveIndex(0), [debouncedTerm]);

  useEffect(() => {
    if (!isOpen || !visibleResults.length) return;
    document.getElementById(`global-result-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen, visibleResults.length]);

  const openResult = (item: GlobalSearchResult) => {
    saveRecentSearch(searchTerm || item.title);
    setIsOpen(false);
    navigate(item.path);
  };
  const openFullSearch = () => {
    const term = searchTerm.trim();
    if (term) saveRecentSearch(term);
    setIsOpen(false);
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && visibleResults.length) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % visibleResults.length);
    } else if (event.key === "ArrowUp" && visibleResults.length) {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + visibleResults.length) % visibleResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = visibleResults[activeIndex];
      if (selected) openResult(selected);
      else openFullSearch();
    }
  };

  let flatIndex = -1;
  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button" aria-label={webT("findOrAsk.discoverSearchLabel")} className={cn("group flex w-full min-w-0 items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-xs text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition hover:border-orange-400/35 hover:bg-white/[0.075] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70", className)}>
        <span className="flex min-w-0 items-center gap-2.5"><Search className="h-3.5 w-3.5 shrink-0 text-orange-400 transition group-hover:scale-110" /><span className="truncate text-white/55 transition group-hover:text-white/80">{t("headerSearch.triggerPlaceholder")}</span></span>
        <kbd className="hidden h-5 shrink-0 items-center rounded-md border border-white/10 bg-black/20 px-1.5 font-mono text-[9px] font-semibold text-white/40 md:inline-flex">⌘K</kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="search-command overflow-hidden border-white/12 bg-[#0b0b0a] p-0 text-white shadow-[0_32px_120px_rgba(0,0,0,.72)] sm:max-w-3xl sm:rounded-[1.75rem] [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:text-white/45">
          <DialogTitle className="sr-only">{webT("findOrAsk.discoverSearchLabel")}</DialogTitle>
          <div className="h-1 bg-[linear-gradient(90deg,#ff5a00,#ff9a3d_45%,transparent)]" />
          <div className="relative flex items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-6 sm:py-5">
            {searching ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-orange-400" /> : <Search className="h-5 w-5 shrink-0 text-orange-400" />}
            <input ref={inputRef} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={handleInputKeyDown} placeholder="Search moments, places, offers, people…" role="combobox" aria-expanded={visibleResults.length > 0} aria-controls="global-search-results" aria-activedescendant={visibleResults.length ? `global-result-${activeIndex}` : undefined} aria-autocomplete="list" className="min-w-0 flex-1 bg-transparent text-base font-semibold tracking-[-0.01em] text-white outline-none placeholder:text-white/30 sm:text-lg" />
            {searchTerm ? <button type="button" onClick={() => setSearchTerm("")} aria-label={webT("publicDiscover.clearSearch")} className="grid h-8 w-8 place-items-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button> : null}
          </div>

          <div id="global-search-results" role="listbox" className="max-h-[min(68vh,590px)] overflow-y-auto overscroll-contain">
            {searchTerm.trim().length < 2 ? (
              <div className="grid gap-0 md:grid-cols-[1fr_1.2fr]">
                <section className="border-b border-white/10 p-5 md:border-b-0 md:border-r md:p-6"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-white/35"><Sparkles className="h-3.5 w-3.5 text-orange-400" /> Explore quickly</p><div className="mt-4 flex flex-wrap gap-2">{suggestedSearches.map((term) => <button key={term} type="button" onClick={() => setSearchTerm(term)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/70 transition hover:border-orange-400/45 hover:bg-orange-500/10 hover:text-orange-200">{term}</button>)}</div></section>
                <section className="p-5 md:p-6"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-white/35"><Clock3 className="h-3.5 w-3.5" /> Recent searches</p><div className="mt-3 space-y-1">{recentSearches.length ? recentSearches.map((term) => <button key={term} type="button" onClick={() => setSearchTerm(term)} className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-white/65 transition hover:bg-white/[0.055] hover:text-white"><span className="truncate">{term}</span><ArrowRight className="h-3.5 w-3.5 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-orange-400" /></button>) : <p className="px-3 py-5 text-sm leading-6 text-white/35">Your searches will stay here so you can jump back into the city quickly.</p>}</div></section>
              </div>
            ) : searching && !searchQuery.data ? (
              <div className="grid place-items-center px-6 py-16 text-center" aria-live="polite"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-400/20 bg-orange-500/10"><Loader2 className="h-5 w-5 animate-spin text-orange-400" /></div><p className="mt-4 text-sm font-bold text-white/75">Looking across Promorang…</p><p className="mt-1 text-xs text-white/35">Moments, places, offers, people and local knowledge.</p></div>
            ) : groupedResults.length ? (
              <div className="p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between px-2"><p className="text-[10px] font-black uppercase tracking-[.2em] text-white/35">Best matches</p><span className="font-mono text-[10px] text-white/25">{searchQuery.data?.length || 0} found</span></div>
                {groupedResults.map((group) => {
                  const config = typeConfig[group.type];
                  return <section key={group.type} className="mb-4 last:mb-0"><div className="mb-1.5 flex items-center gap-2 px-2 py-1"><config.icon className="h-3.5 w-3.5 text-white/35" /><h3 className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">{config.label}</h3><span className="font-mono text-[9px] text-white/20">{group.items.length}</span></div><div className="space-y-1">{group.items.map((item) => {
                    flatIndex += 1;
                    const itemIndex = flatIndex;
                    const Icon = typeConfig[item.result_type].icon;
                    const active = itemIndex === activeIndex;
                    return <button id={`global-result-${itemIndex}`} key={`${item.result_type}-${item.id}`} type="button" role="option" aria-selected={active} onMouseEnter={() => setActiveIndex(itemIndex)} onClick={() => openResult(item)} className={cn("group grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-2.5 py-2.5 text-left transition", active ? "border-orange-400/25 bg-[linear-gradient(90deg,rgba(249,115,22,.13),rgba(255,255,255,.035))]" : "border-transparent hover:bg-white/[0.045]")}><span className={cn("grid h-11 w-11 place-items-center overflow-hidden rounded-xl", typeConfig[item.result_type].tint)}>{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}</span><span className="min-w-0"><span className="block truncate text-sm font-bold text-white"><Highlight value={item.title} query={debouncedTerm} /></span><span className="mt-0.5 block truncate text-xs text-white/38">{item.subtitle || item.description || config.label}</span></span><span className={cn("flex items-center gap-1.5 pr-2 text-[10px] font-bold text-white/25 transition", active && "text-orange-300")}><span className="hidden sm:inline">{webT("auth.open")}</span><CornerDownLeft className="h-3.5 w-3.5" /></span></button>;
                  })}</div></section>;
                })}
              </div>
            ) : (
              <div className="px-6 py-14 text-center" aria-live="polite"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.035]"><Compass className="h-5 w-5 text-white/35" /></div><h3 className="mt-4 text-base font-black">No exact match yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">Search the full discovery hub for <span className="font-semibold text-white/65">“{searchTerm.trim()}”</span>, or record what you want the city to answer.</p><button type="button" onClick={openFullSearch} className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-black text-black transition hover:bg-orange-400">Continue in full search <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" /></button></div>
            )}
          </div>
          <footer className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.025] px-5 py-3 text-[10px] text-white/30 sm:px-6"><span className="hidden items-center gap-3 sm:flex"><span><kbd className="font-mono text-white/50">↑↓</kbd> navigate</span><span><kbd className="font-mono text-white/50">↵</kbd> {webT("support.statusOpen")}</span><span><kbd className="font-mono text-white/50">esc</kbd> close</span></span><button type="button" onClick={openFullSearch} className="ml-auto flex items-center gap-2 font-black uppercase tracking-[.14em] text-white/55 transition hover:text-orange-300">{webT("publicDiscover.allResults")} <ArrowRight className="h-3.5 w-3.5" /></button></footer>
        </DialogContent>
      </Dialog>
    </>
  );
};
