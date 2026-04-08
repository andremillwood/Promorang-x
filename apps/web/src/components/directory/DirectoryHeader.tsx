import { useNavigate, Link as RouterLink } from "react-router-dom";
const Link = RouterLink as any;
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as LucideSearch, SlidersHorizontal as LucideSliders, X as LucideX, ArrowRight as LucideArrow } from "lucide-react";
const Search = LucideSearch as any;
const SlidersHorizontal = LucideSliders as any;
const X = LucideX as any;
const ArrowRight = LucideArrow as any;
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DirectoryHeaderProps {
    title: string;
    description: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    category: string;
    setCategory: (category: string) => void;
    categories: { value: string; label: string }[];
    placeholder?: string;
    onClearFilters?: () => void;
    searchCategory?: 'moment' | 'brand' | 'merchant' | 'host' | 'all';
}

export const DirectoryHeader = ({
    title,
    description,
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    categories,
    placeholder = "Search...",
    onClearFilters,
    searchCategory = "all"
}: DirectoryHeaderProps) => {
    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                {onClearFilters && (searchTerm || category !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs h-8 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3 h-3 mr-2" />
                        Clear all filters
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-card border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={placeholder}
                            className="pl-9 bg-background focus-visible:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            data-tour="directory-search"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-[160px] bg-background" data-tour="directory-category">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="shrink-0 bg-background" data-tour="directory-filters">
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {searchTerm && searchTerm.length >= 2 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-1">
                        <p className="text-xs text-muted-foreground">
                            Searching <span className="font-semibold text-foreground">{title}</span> for "{searchTerm}"
                        </p>
                        <Link
                            to={`/search?q=${encodeURIComponent(searchTerm)}&category=${searchCategory}`}
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 group"
                        >
                            Search all Moments, Brands & Hosts
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
