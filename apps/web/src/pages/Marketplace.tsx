import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Store, ShoppingBag, MapPin, Search, Filter, ArrowRight, Sparkles, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import { ValueOutcomeChips, type ValueOutcome } from "@/components/economy/ValueOutcomes";
import { commerceCategorySlug, isSampleCommerceListing } from "@/lib/commerce-provenance";

type CommerceListing = Tables<"view_public_commerce_directory">;

const KINGSTON_EXPERIENCE_LISTINGS: CommerceListing[] = [
    {
        listing_id: "devon-house-tasting-passport",
        source_id: "devon-house-passport",
        source_table: "products",
        listing_kind: "product",
        name: "Devon House Tasting Passport",
        description: "The ultimate culinary sampler: 1 Devon House I Scream single scoop + 1 Tacbar signature street taco + 1 Gourmet Bakery pastry.",
        category: "Food & Dining",
        price: 18.50,
        currency: "USD",
        points_cost: 250,
        is_redeemable_with_points: true,
        image_url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=800",
        merchant_name: "Devon House Courtyard Merchants",
        merchant_slug: "devon-house",
        venue_name: "Devon House Estate",
        city: "Kingston",
        location: "26 Hope Rd, Kingston",
        is_active: true,
        is_featured: true,
        fulfillment_mode: "in_person",
        created_at: new Date().toISOString(),
    },
    {
        listing_id: "fat-wednesday-vip-pack",
        source_id: "fat-wednesday-pack",
        source_table: "products",
        listing_kind: "product",
        name: "FAT Wednesday VIP Table Pack",
        description: "Midweek VIP lounge experience: 1 Signature Jerk Sampler Platter + 2 Bolt Craft Beers + reserved seating for live DJ sets.",
        category: "Nightlife & Dining",
        price: 24.00,
        currency: "USD",
        points_cost: 320,
        is_redeemable_with_points: true,
        image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
        merchant_name: "Usain Bolt's Tracks & Records",
        merchant_slug: "tracks-and-records",
        venue_name: "Marketplace Kingston",
        city: "Kingston",
        location: "67 Constant Spring Rd, Kingston",
        is_active: true,
        is_featured: true,
        fulfillment_mode: "in_person",
        created_at: new Date().toISOString(),
    },
    {
        listing_id: "blue-mountain-coffee-flight",
        source_id: "blue-mountain-flight",
        source_table: "products",
        listing_kind: "product",
        name: "Blue Mountain Coffee & High Tea Flight",
        description: "100% Grade 1 Jamaica Blue Mountain Coffee cupping tasting flight with artisan fresh scones at Cafe Blue Irish Town.",
        category: "Beverage & Experiences",
        price: 16.00,
        currency: "USD",
        points_cost: 220,
        is_redeemable_with_points: true,
        image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
        merchant_name: "Cafe Blue & Strawberry Hill",
        merchant_slug: "cafe-blue",
        venue_name: "Cafe Blue Irish Town",
        city: "Irish Town",
        location: "Irish Town, St. Andrew",
        is_active: true,
        is_featured: true,
        fulfillment_mode: "in_person",
        created_at: new Date().toISOString(),
    },
    {
        listing_id: "downtown-artwalk-reggae-pass",
        source_id: "artwalk-reggae-pass",
        source_table: "products",
        listing_kind: "product",
        name: "Downtown Artwalk & Reggae Heritage Pass",
        description: "Guided street mural walking pass in Downtown Kingston Art District with official audio tour and Bob Marley Museum pass.",
        category: "Arts & Culture",
        price: 28.00,
        currency: "USD",
        points_cost: 380,
        is_redeemable_with_points: true,
        image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800",
        merchant_name: "Kingston Creative & Heritage Guild",
        merchant_slug: "kingston-creative",
        venue_name: "Water Lane Art District",
        city: "Kingston",
        location: "Water Lane, Downtown Kingston",
        is_active: true,
        is_featured: true,
        fulfillment_mode: "in_person",
        created_at: new Date().toISOString(),
    }
];

const Marketplace = () => {
    const { category: categoryParam } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSamples, setShowSamples] = useState(false);
    const activeCategory = categoryParam || "all";

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
        const dbValues = (commerceQuery.data || [])
            .map((listing) => listing.category)
            .filter(Boolean)
            .map((category) => String(category));

        const seedValues = KINGSTON_EXPERIENCE_LISTINGS.map((l) => l.category).filter(Boolean) as string[];
        const values = new Set([...dbValues, ...seedValues]);

        return ["All", "Products", "Services", ...Array.from(values).slice(0, 8)];
    }, [commerceQuery.data]);

    const realListings = useMemo(() => {
        const filteredDb = (commerceQuery.data || []).filter((listing) => !isSampleCommerceListing(listing));
        return filteredDb.length > 0 ? filteredDb : KINGSTON_EXPERIENCE_LISTINGS;
    }, [commerceQuery.data]);
    const sampleListings = useMemo(() => (commerceQuery.data || []).filter(isSampleCommerceListing), [commerceQuery.data]);
    const sourceListings = realListings.length || !showSamples ? realListings : sampleListings;

    const listings = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const category = activeCategory.toLowerCase();

        return sourceListings.filter((listing) => {
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
                commerceCategorySlug(listing.category) === category;

            return matchesSearch && matchesCategory;
        });
    }, [sourceListings, searchQuery, activeCategory]);

    const formatPrice = (listing: CommerceListing) => {
        if (typeof listing.price !== "number") return "Open";
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: listing.currency || "USD",
            maximumFractionDigits: 2,
        }).format(listing.price);
    };

    const getListingOutcomes = (listing: CommerceListing): ValueOutcome[] => {
        const outcomes: ValueOutcome[] = [];
        if (listing.is_redeemable_with_points) outcomes.push({ kind: "reward", label: "Points eligible", detail: "This listing can be redeemed using Points when available." });
        if (listing.booking_url || listing.listing_kind === "service") outcomes.push({ kind: "access", label: listing.booking_url ? "Bookable" : "Service access" });
        return outcomes;
    };

    return (
        <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-16 pt-4 animate-in fade-in duration-700 sm:px-6 lg:px-8">
            {/* Search & Filter Header */}
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.2),transparent_32%),linear-gradient(135deg,rgba(10,10,10,0.98),rgba(20,20,20,0.94))] p-5 shadow-2xl md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                            <Store className="h-3.5 w-3.5" />
                            Marketplace · Curated Experience Passes
                        </div>
                        <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-6xl">
                            Curated Passes. Guaranteed Value.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                            Promorang curates group experience packages with local partners and trusted cultural institutions. All customer payments are held in escrow and pre-funded directly with the venue upon arrival or booking.
                        </p>
                    </div>

                    <div className="grid gap-2 text-xs text-white/70 sm:grid-cols-3 md:w-[34rem]">
                        {["Buy or book", "Earn signal", "Unlock more"].map((label) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                                <div className="font-black uppercase tracking-[0.18em] text-primary">{label}</div>
                                <p className="mt-1 leading-5">
                                    {label === "Buy or book" ? "Choose an offer that matches your next move." : label === "Earn signal" ? "Points and receipts strengthen your record." : "Use access and status toward better Moments."}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex w-full gap-3 md:max-w-xl">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search offers, venues, rewards..."
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
            <nav aria-label="Shop categories" className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <Link
                        key={cat}
                        to={cat === "All" ? "/shop" : `/shop/category/${commerceCategorySlug(cat)}`}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black transition ${activeCategory === commerceCategorySlug(cat) || (cat === "All" && activeCategory === "all") ? "border-primary bg-primary text-white" : "border-white/10 bg-white/[0.05] text-white/65 hover:border-primary/50 hover:text-white"}`}
                    >
                        {cat}
                    </Link>
                ))}
            </nav>

            {realListings.length === 0 && !commerceQuery.isLoading ? (
                <section className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-10 text-center">
                    <ShoppingBag className="mx-auto h-10 w-10 text-primary" />
                    <h2 className="mt-4 text-2xl font-black text-white">No live merchant inventory yet</h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">Products must come from an active merchant listing before we present them as purchasable. Samples stay separate.</p>
                    {sampleListings.length ? <Button type="button" variant="outline" className="mt-5" onClick={() => setShowSamples((value) => !value)}>{showSamples ? "Hide sample catalog" : "View sample catalog"}</Button> : null}
                </section>
            ) : null}

            {showSamples && realListings.length === 0 ? <div className="flex items-center justify-between rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100"><span><strong>Sample catalog.</strong> These items demonstrate the shopping experience and cannot be purchased.</span><Button size="sm" variant="ghost" onClick={() => setShowSamples(false)}>Hide</Button></div> : null}

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        <article key={listing.listing_id} className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121212] transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_70px_rgba(0,0,0,.35)]">
                            {/* Product Image */}
                            <Link to={`/shop/${encodeURIComponent(listing.listing_id || "")}`} className="relative block aspect-[4/3] overflow-hidden bg-white/[0.05]">
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
                                    {isSampleCommerceListing(listing) ? "Sample · " : ""}{listing.listing_kind === "service" ? "Service" : "Product"}
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                                        <MapPin className="w-3 h-3" /> {listing.venue_name || listing.merchant_name || "Local merchant"}
                                    </div>
                                    <Link to={`/shop/${encodeURIComponent(listing.listing_id || "")}`}><h3 className="font-serif text-2xl font-bold leading-tight text-white transition-colors group-hover:text-primary">{listing.name}</h3></Link>
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                                    {listing.description || "Available through the Promorang commerce directory."}
                                </p>

                                <ValueOutcomeChips outcomes={getListingOutcomes(listing)} className="mb-3" />

                                <div className="mb-3 flex flex-wrap gap-2">
                                    {listing.category ? <Badge variant="outline" className="capitalize">{listing.category}</Badge> : null}
                                    {listing.fulfillment_mode ? <Badge variant="secondary" className="capitalize">{String(listing.fulfillment_mode).replace(/_/g, " ")}</Badge> : null}
                                </div>

                                <Button className="w-full justify-between rounded-xl" variant="hero" asChild><Link to={`/shop/${encodeURIComponent(listing.listing_id || "")}`}><span className="flex items-center gap-2"><Eye className="h-4 w-4" />View details</span><span className="font-bold">{formatPrice(listing)}</span></Link></Button>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Value Prop Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black uppercase leading-none tracking-[-0.04em] mb-2">Every purchase should move you.</h2>
                    <p className="text-muted-foreground text-sm">Direct purchases from local merchants can earn Access Points, receipts, and eligibility. Marketplace is not just checkout; it is one way your local support becomes visible status inside Promorang.</p>
                    <Button variant="link" className="p-0 text-primary mt-4 h-auto">
                        Learn about Access Ranks <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-10">
                    <Sparkles className="w-32 h-32" />
                </div>
            </div>
        </main>
    );
};

export default Marketplace;
