import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, Store, Users, Building2, ArrowRight, Loader2, Compass, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export const HeaderSearchPreview: React.FC = () => {
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
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/70 hover:border-primary/40 hover:bg-white/[0.08] hover:text-white transition-all shadow-sm group focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
      >
        <Search className="h-3.5 w-3.5 text-primary/80 group-hover:text-primary group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Search moments...</span>
        <span className="inline sm:hidden">Search</span>
        <kbd className="hidden md:inline-flex h-4 items-center gap-0.5 rounded border border-white/15 bg-white/10 px-1.5 font-mono text-[9px] font-medium text-white/50">
          ⌘K
        </kbd>
      </button>

      {/* Instant Search Command Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 max-w-2xl bg-[#0e0e10] border border-white/15 text-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Search Input Row */}
          <div className="relative flex items-center border-b border-white/10 px-4 py-3.5">
            <Search className="h-5 w-5 text-primary shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search moments, merchants, creators, rewards..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Tag Suggestions */}
          {searchTerm.length < 2 && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {["Kingston Moments", "Sponsor Perks", "Local Merchant Deals", "Live Creators", "Proof Rewards"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/80 hover:border-primary hover:text-primary transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {searchTerm.length >= 2 && (
            <div className="max-h-[380px] overflow-y-auto p-3 space-y-1 divide-y divide-white/5">
              {isLoading ? (
                <div className="flex items-center justify-center py-10 text-white/50 text-xs">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" /> Searching Promorang signal...
                </div>
              ) : results && results.length > 0 ? (
                results.map((item) => (
                  <div
                    key={`${item.result_type}-${item.id}`}
                    onClick={() => handleSelectResult(item.path)}
                    className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.06] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center text-primary">
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
                            <span className="text-xs text-white/40 truncate">{item.subtitle}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition truncate">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-primary group-hover:translate-x-1 transition shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 space-y-2">
                  <p className="text-sm text-white/70">No results found for "{searchTerm}"</p>
                  <button
                    onClick={() => handleSelectResult(`/search?q=${encodeURIComponent(searchTerm)}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Perform full market search →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer View All Link */}
          <div className="border-t border-white/10 bg-white/[0.02] p-3 text-center">
            <Link
              to={searchTerm ? `/search?q=${encodeURIComponent(searchTerm)}` : "/search"}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-white/70 hover:text-primary transition"
            >
              Open Full Search Hub →
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
