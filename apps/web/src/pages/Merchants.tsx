import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { OrganizationCard } from "@/components/directory/OrganizationCard";
import { ShoppingBag, MapPin, Tag, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";
import { useEffect } from "react";

const MERCHANT_CATEGORIES = [
    { value: "cafe", label: "Cafes & Coffee" },
    { value: "restaurant", label: "Restaurants" },
    { value: "fitness", label: "Fitness & Gyms" },
    { value: "retail", label: "Retail Stores" },
    { value: "wellness", label: "Beauty & Wellness" },
    { value: "bar", label: "Bars & Nightlife" },
];

const MerchantsDirectory = () => {
    const { roles, user } = useAuth();
    const { startTour, isTourCompleted } = useTour();
    const primaryRole = roles[0] || "participant";
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    // Auto-start merchant directory tour for new users
    useEffect(() => {
        if (user && !isTourCompleted('merchant-directory')) {
            const timer = setTimeout(() => {
                startTour('merchant-directory');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, isTourCompleted, startTour]);

    const { data: merchants, isLoading } = useQuery({
        queryKey: ["merchants-discovery", category, searchTerm],
        queryFn: async () => {
            let query = supabase
                .from("view_merchant_discovery")
                .select("*");

            if (category !== "all") {
                query = query.eq("category", category);
            }

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,location_city.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });

    const clearFilters = () => {
        setSearchTerm("");
        setCategory("all");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <DirectoryHeader
                title="Merchant Directory"
                description="Find local venues, shops, and spaces hosting moments and offering exclusive rewards."
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                category={category}
                setCategory={setCategory}
                categories={MERCHANT_CATEGORIES}
                placeholder="Search by name or city..."
                onClearFilters={clearFilters}
                searchCategory="merchant"
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading merchant directory...</p>
                </div>
            ) : merchants && merchants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchants.map((merchant) => (
                        <OrganizationCard
                            key={merchant.id}
                            id={merchant.id}
                            name={merchant.name}
                            type="merchant"
                            logo={merchant.logo_url}
                            description={merchant.description}
                            category={merchant.category}
                            location={`${merchant.location_city}, ${merchant.location_state}`}
                            verified={merchant.verified_status === "verified"}
                            website={merchant.website_url}
                            stats={[
                                {
                                    label: "Products",
                                    value: merchant.product_count || 0,
                                    icon: <Tag className="w-3 h-3" />
                                },
                                {
                                    label: "Redemptions",
                                    value: merchant.total_redemptions || 0,
                                    icon: <ShoppingBag className="w-3 h-3" />
                                }
                            ]}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No merchants found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                        Try search for a different name or city to find local businesses.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 text-sm font-medium text-primary hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
            <ProductTour tourId="merchant-directory" />
        </div>
    );
};

export default MerchantsDirectory;
