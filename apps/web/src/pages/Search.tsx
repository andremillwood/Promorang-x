import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search as SearchIcon,
    Calendar,
    Building2,
    Store,
    Users,
    ArrowRight,
    Loader2,
    Frown,
    MapPin
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const initialCategory = searchParams.get("category") || "all";
    const { roles } = useAuth();
    const primaryRole = roles[0] || "participant";

    const [inputValue, setInputValue] = useState(query);
    const [activeTab, setActiveTab] = useState(initialCategory);

    const { data: results, isLoading, error } = useQuery({
        queryKey: ["global-search", query],
        enabled: query.length >= 2,
        queryFn: async () => {
            const { data, error } = await supabase.rpc('fn_global_search', {
                search_term: query
            });
            if (error) throw error;
            return data as SearchResult[];
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchParams({ q: inputValue.trim(), category: activeTab });
        }
    };

    const filteredResults = results?.filter(r =>
        activeTab === "all" ? true : r.result_type === activeTab
    ) || [];

    // Grouping for the "All" tab if needed, or just sorted by relevance
    const sortedResults = [...filteredResults].sort((a, b) => {
        // If a category was specified in URL, boost it
        if (initialCategory !== "all") {
            if (a.result_type === initialCategory && b.result_type !== initialCategory) return -1;
            if (b.result_type === initialCategory && a.result_type !== initialCategory) return 1;
        }
        return b.relevance_score - a.relevance_score;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'moment': return <Calendar className="w-4 h-4" />;
            case 'brand': return <Building2 className="w-4 h-4" />;
            case 'merchant': return <Store className="w-4 h-4" />;
            case 'host': return <Users className="w-4 h-4" />;
            case 'user': return <Users className="w-4 h-4" />;
            default: return <SearchIcon className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'moment': return "text-primary bg-primary/10";
            case 'brand': return "text-blue-600 bg-blue-500/10";
            case 'merchant': return "text-emerald-600 bg-emerald-500/10";
            case 'host': return "text-orange-600 bg-orange-500/10";
            case 'user': return "text-violet-600 bg-violet-500/10";
            default: return "text-muted-foreground bg-muted";
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Unified Search</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Find moments, brands, venues, and hosts across the entire Promorang ecosystem.
                </p>
            </div>

            <form onSubmit={handleSearch} className="relative mx-auto mb-12 flex max-w-2xl flex-col gap-3 sm:block">
                <SearchIcon className="absolute left-4 top-7 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search for anything..."
                    className="h-14 rounded-2xl pl-12 text-base shadow-soft sm:pr-32 sm:text-lg"
                />
                <Button
                    type="submit"
                    className="h-11 w-full rounded-xl px-6 sm:absolute sm:right-2 sm:top-1/2 sm:h-10 sm:w-auto sm:-translate-y-1/2"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
            </form>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-8 w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 sm:gap-8">
                    <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-1">All Results</TabsTrigger>
                    <TabsTrigger value="moment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-1">Moments</TabsTrigger>
                    <TabsTrigger value="brand" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-1">Brands</TabsTrigger>
                    <TabsTrigger value="merchant" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-1">Merchants</TabsTrigger>
                    <TabsTrigger value="host" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-1">Hosts</TabsTrigger>
                    <TabsTrigger value="user" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-4 px-1">People</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground text-sm">Searching the ecosystem...</p>
                        </div>
                    ) : query.length < 2 ? (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Ready to search</h3>
                            <p className="text-muted-foreground mt-1">Start typing to find what you're looking for.</p>
                        </div>
                    ) : sortedResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {sortedResults.map((result) => (
                                <Link
                                    key={`${result.result_type}-${result.id}`}
                                    to={result.path}
                                    className="group flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:bg-muted/50 sm:flex-row sm:items-center"
                                >
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm">
                                        {result.image_url ? (
                                            <img
                                                src={result.image_url}
                                                alt={result.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                {getTypeIcon(result.result_type)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1",
                                                getTypeColor(result.result_type)
                                            )}>
                                                {getTypeIcon(result.result_type)}
                                                {result.result_type}
                                            </span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="min-w-0 truncate text-xs text-muted-foreground">{result.subtitle}</span>
                                        </div>
                                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                                            {result.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {result.description}
                                        </p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <Frown className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No results found for "{query}"</h3>
                            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                                Try searching with different keywords or check your spelling.
                            </p>
                            <Button variant="link" className="mt-2" onClick={() => setInputValue("")}>
                                Clear search
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {results && results.length > 0 && (
                <div className="mt-12 pt-12 border-t text-center">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Didn't find what you need?</h3>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link to="/explore/moments">Browse Moments</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/brands">Partner with Brands</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link to="/merchants">Locate Venues</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
