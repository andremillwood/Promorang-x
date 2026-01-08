import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Zap, Target, ShoppingBag, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';
import { Input } from '../../../components/ui/input';

interface SearchResult {
    id: string;
    title: string;
    type: 'drop' | 'product' | 'content' | 'forecast';
    meta: string;
    image?: string;
    link: string;
}

export default function PublicSearch() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                setIsOpen(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/api/search/public?q=${encodeURIComponent(query)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setResults(data);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
            <Input
                leftIcon={<Search className="h-5 w-5" />}
                rightIcon={query && (
                    <button
                        onClick={() => setQuery('')}
                        className="flex items-center text-pr-text-muted hover:text-pr-text-1 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                containerClassName="group"
                className="py-4 bg-pr-surface-card border-pr-border rounded-2xl text-pr-text-1 placeholder-pr-text-muted focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xl"
                placeholder="Search Drops, Products, or Forecasts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setIsOpen(true)}
            />

            {/* Search Results Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-4 w-full bg-pr-surface-card border border-pr-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {isSearching && results.length === 0 ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-pr-text-muted">Searching the ecosystem...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-2 space-y-1">
                                {results.map((result) => (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => {
                                            navigate(result.link);
                                            setIsOpen(false);
                                            setQuery('');
                                        }}
                                        className="w-full flex items-center gap-4 p-3 hover:bg-pr-surface-2 rounded-xl transition-colors text-left group/result"
                                    >
                                        <div className="h-12 w-12 rounded-lg bg-pr-surface-background overflow-hidden flex-shrink-0 border border-pr-border">
                                            {result.image ? (
                                                <img src={result.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    {result.type === 'drop' && <Sparkles className="h-6 w-6 text-yellow-500" />}
                                                    {result.type === 'product' && <ShoppingBag className="h-6 w-6 text-purple-500" />}
                                                    {result.type === 'content' && <Zap className="h-6 w-6 text-blue-500" />}
                                                    {result.type === 'forecast' && <Target className="h-6 w-6 text-green-500" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black uppercase tracking-widest text-pr-text-muted">
                                                    {result.type}
                                                </span>
                                                {result.type === 'forecast' && (
                                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold">LIVE</span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-pr-text-1 truncate">{result.title}</h4>
                                            <p className="text-xs text-pr-text-muted font-medium">{result.meta}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-pr-text-muted opacity-0 group-hover/result:opacity-100 group-hover/result:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        ) : query.length >= 2 ? (
                            <div className="p-8 text-center">
                                <p className="text-pr-text-muted">No results found for "{query}"</p>
                                <p className="text-xs text-pr-text-muted mt-2">Try a different keyword or category</p>
                            </div>
                        ) : null}
                    </div>

                    {results.length > 0 && (
                        <div className="p-4 bg-pr-surface-2 border-t border-pr-border flex justify-between items-center">
                            <span className="text-[10px] font-bold text-pr-text-muted uppercase tracking-widest">
                                Showing {results.length} results
                            </span>
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1"
                            >
                                Browse All Marketplace <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
