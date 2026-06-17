import { useMemo, useState } from "react";
import { Store, ShoppingBag, MapPin, Search, Filter, ArrowRight, Coins, CreditCard, Sparkles, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type CommerceListing = Tables<"view_public_commerce_directory">;

const Marketplace = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const commerceQuery = useQuery({
        queryKey: ["marketplace-commerce-directory"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("view_public_commerce_directory")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false, nullsFirst: false })
                .limit(80);

            if (error) throw error;
            return (data || []) as CommerceListing[];
        },
    });

    const categories = useMemo(() => {
        const values = new Set(
            (commerceQuery.data || [])
                .map((listing) => listing.category)
                .filter(Boolean)
                .map((category) => String(category))
        );

        return ["All", "Products", "Services", ...Array.from(values).slice(0, 8)];
    }, [commerceQuery.data]);

    const listings = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const category = activeCategory.toLowerCase();

        return (commerceQuery.data || []).filter((listing) => {
            const matchesSearch =
                !query ||
                [
                    listing.name,
                    listing.description,
                    listing.category,
                    listing.merchant_name,
                    listing.venue_name,
                    listing.city,
                    listing.location,
                    listing.listing_kind,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query));

            const matchesCategory =
                category === "all" ||
                (category === "products" && listing.listing_kind !== "service") ||
                (category === "services" && listing.listing_kind === "service") ||
                String(listing.category || "").toLowerCase() === category;

            return matchesSearch && matchesCategory;
        });
    }, [commerceQuery.data, searchQuery, activeCategory]);

    const { purchase, processing } = useMarketplace();

    const handlePurchase = async (listing: CommerceListing, method: 'cash' | 'points') => {
        if (listing.source_table !== "merchant_products" || !listing.source_id) return;
        await purchase(listing.source_id, method);
    };

    const formatPrice = (listing: CommerceListing) => {
        if (typeof listing.price !== "number") return "Open";
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: listing.currency || "USD",
            maximumFractionDigits: 2,
        }).format(listing.price);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Search & Filter Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight mb-2 flex items-center gap-3">
                        Local Marketplace <Store className="w-8 h-8 text-primary" />
                    </h1>
                    <p className="text-muted-foreground">Support local venues, services, and rewards from one commerce directory.</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products or venues..."
                            className="pl-10 bg-card rounded-xl border-border/40 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-border/40">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Categories / Tags */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <Badge
                        key={cat}
                        variant={activeCategory === cat ? "default" : "secondary"}
                        className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </Badge>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {commerceQuery.isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl p-4 border border-border/40 animate-pulse h-80" />
                    ))
                ) : listings.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No listings found</h3>
                        <p className="text-muted-foreground">Check back later or try a different search.</p>
                    </div>
                ) : (
                    listings.map((listing) => (
                        <div key={listing.listing_id} className="group bg-card rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col">
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-muted">
                                {listing.image_url ? (
                                    <img src={listing.image_url} alt={listing.name || "Marketplace listing"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <ShoppingBag className="w-12 h-12 opacity-20" />
                                    </div>
                                )}

                                {listing.is_redeemable_with_points && (
                                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-400" /> POINTS
                                    </div>
                                )}
                                <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground">
                                    {listing.listing_kind === "service" ? "Service" : "Product"}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                                        <MapPin className="w-3 h-3" /> {listing.venue_name || listing.merchant_name || "Local merchant"}
                                    </div>
                                    <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{listing.name}</h3>
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                                    {listing.description || "Available through the Promorang commerce directory."}
                                </p>

                                <div className="mb-3 flex flex-wrap gap-2">
                                    {listing.category ? <Badge variant="outline" className="capitalize">{listing.category}</Badge> : null}
                                    {listing.fulfillment_mode ? <Badge variant="secondary" className="capitalize">{String(listing.fulfillment_mode).replace(/_/g, " ")}</Badge> : null}
                                </div>

                                <div className="space-y-3">
                                    {listing.booking_url ? (
                                        <Button className="w-full justify-between h-10 rounded-xl group/btn" variant="hero" asChild>
                                            <a href={listing.booking_url} target="_blank" rel="noreferrer">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="w-4 h-4" /> Book
                                                </span>
                                                <span className="font-bold">{formatPrice(listing)}</span>
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full justify-between h-10 rounded-xl group/btn"
                                            variant="hero"
                                            disabled={processing || listing.source_table !== "merchant_products"}
                                            onClick={() => handlePurchase(listing, 'cash')}
                                        >
                                            <span className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4" /> {listing.listing_kind === "service" ? "Request" : "Buy Now"}
                                            </span>
                                            <span className="font-bold">{formatPrice(listing)}</span>
                                        </Button>
                                    )}

                                    {/* Redeem with Points */}
                                    {listing.is_redeemable_with_points && (
                                        <Button
                                            className="w-full justify-between h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20"
                                            variant="outline"
                                            disabled={processing || !user || listing.source_table !== "merchant_products"}
                                            onClick={() => handlePurchase(listing, 'points')}
                                        >
                                            <span className="flex items-center gap-2">
                                                <Coins className="w-4 h-4" /> Use Points
                                            </span>
                                            <span className="font-bold">{listing.points_cost} Pts</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Value Prop Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-serif font-bold mb-2">Spend $1, Earn 10 Points</h2>
                    <p className="text-muted-foreground text-sm">Every direct purchase from a local merchant earns you Access Points. Points are used to build your Access Rank and qualify for exclusive, limited-entry moments.</p>
                    <Button variant="link" className="p-0 text-primary mt-4 h-auto">
                        Learn about Access Ranks <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-10">
                    <Sparkles className="w-32 h-32" />
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
