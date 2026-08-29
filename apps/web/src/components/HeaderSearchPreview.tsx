import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, Store, Users, Building2, ArrowRight, Loader2, Compass, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  result_type: 'moment' | 'brand' | 'merchant' | 'host' | 'user';
  image_url: string;
  path: string;
  relevance_score: number;
}

export const HeaderSearchPreview: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd + K / Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["header-instant-search", searchTerm],
    enabled: searchTerm.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_global_search', {
        search_term: searchTerm
      });
      if (error) {
        console.warn("Global search RPC fallback:", error);
        return [];
      }
      return (data as SearchResult[]) || [];
    },
    staleTime: 30000,
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'moment': return <Calendar className="w-3.5 h-3.5" />;
      case 'merchant': return <Store className="w-3.5 h-3.5" />;
      case 'brand': return <Building2 className="w-3.5 h-3.5" />;
      default: return <Users className="w-3.5 h-3.5" />;
    }
  };

  const handleSelectResult = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={`w-full flex items-center justify-between gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground transition-all shadow-sm group focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Search className="h-3.5 w-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-muted-foreground group-hover:text-foreground transition-colors truncate">
            {t("headerSearch.triggerPlaceholder")}
          </span>
          <span className="inline sm:hidden text-muted-foreground">{t("headerSearch.triggerShort")}</span>
        </div>
        <kbd className="hidden md:inline-flex h-4 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[9px] font-medium text-muted-foreground shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Instant Search Command Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 max-w-2xl bg-popover text-popover-foreground border border-border rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Search Input Row */}
          <div className="relative flex items-center border-b border-border px-4 py-3.5">
            <Search className="h-5 w-5 text-primary shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("headerSearch.inputPlaceholder")}
              className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Tag Suggestions */}
          {searchTerm.length < 2 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> {t("headerSearch.popularSearches")}
              </div>
              <div className="flex flex-wrap gap-2">
                {["Kingston Moments", "Sponsor Perks", "Local Merchant Deals", "Live Creators", "Proof Rewards"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {searchTerm.length >= 2 && (
            <div className="max-h-[380px] overflow-y-auto p-3 space-y-1 divide-y divide-border">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-xs">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> {t("headerSearch.searching")}
                </div>
              ) : results && results.length > 0 ? (
                results.map((item) => (
                  <div
                    key={`${item.result_type}-${item.id}`}
                    onClick={() => handleSelectResult(item.path)}
                    className="group flex items-center justify-between p-3 rounded-2xl hover:bg-accent transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center text-primary">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          getTypeIcon(item.result_type)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                            {item.result_type}
                          </span>
                          {item.subtitle && (
                            <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-2">
                  <p className="text-sm text-muted-foreground">{t("headerSearch.noResults")} "{searchTerm}"</p>
                  <button
                    onClick={() => handleSelectResult(`/search?q=${encodeURIComponent(searchTerm)}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {t("search.startCopy")} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer View All Link */}
          <div className="border-t border-border bg-muted/40 p-3 text-center">
            <Link
              to={searchTerm ? `/search?q=${encodeURIComponent(searchTerm)}` : "/search"}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition"
            >
              Open Full Search Hub →
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
