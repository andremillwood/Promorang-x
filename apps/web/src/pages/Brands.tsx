import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { OrganizationCard } from "@/components/directory/OrganizationCard";
import { Layout, Users, Megaphone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const BRAND_CATEGORIES = [
    { value: "lifestyle", label: "Lifestyle" },
    { value: "technology", label: "Technology" },
    { value: "f&b", label: "Food & Beverage" },
    { value: "fashion", label: "Fashion" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health", label: "Health & Wellness" },
];

const BrandsDirectory = () => {
    const { roles, user } = useAuth();
    const { startTour, isTourCompleted } = useTour();
    const primaryRole = roles[0] || "participant";
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    // Auto-start brand directory tour for new users
    useEffect(() => {
        if (user && !isTourCompleted('brand-directory')) {
            const timer = setTimeout(() => {
                startTour('brand-directory');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, isTourCompleted, startTour]);

    const { data: brands, isLoading } = useQuery({
        queryKey: ["brands-discovery", category, searchTerm],
        queryFn: async () => {
            let query = supabase
                .from("view_brand_discovery")
                .select("*");

            if (category !== "all") {
                query = query.eq("industry", category);
            }

            if (searchTerm) {
                query = query.ilike("name", `%${searchTerm}%`);
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
        <DashboardLayout currentRole={primaryRole}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <DirectoryHeader
                    title="Brand Directory"
                    description="Discover brands powering activations and moments across the platform."
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    category={category}
                    setCategory={setCategory}
                    categories={BRAND_CATEGORIES}
                    placeholder="Search brands by name..."
                    onClearFilters={clearFilters}
                    searchCategory="brand"
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading brand directory...</p>
                    </div>
                ) : brands && brands.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brands.map((brand) => (
                            <OrganizationCard
                                key={brand.id}
                                id={brand.id}
                                name={brand.name}
                                type="brand"
                                logo={brand.logo_url}
                                description={brand.description}
                                category={brand.industry}
                                verified={brand.verified_status === "verified"}
                                website={brand.website_url}
                                stats={[
                                    {
                                        label: "Campaigns",
                                        value: brand.active_campaigns_count || 0,
                                        icon: <Megaphone className="w-3 h-3" />
                                    },
                                    {
                                        label: "Sponsored",
                                        value: brand.successfully_sponsored_moments || 0,
                                        icon: <Layout className="w-3 h-3" />
                                    }
                                ]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No brands found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                            Try adjusting your search or category filters to find what you're looking for.
                        </p>
                        <Button variant="link" onClick={clearFilters} className="mt-4">
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
            <ProductTour tourId="brand-directory" />
        </DashboardLayout>
    );
};

// Internal Button component for the empty state link
const Button = ({ children, variant, onClick, className }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "text-sm font-medium transition-colors",
            variant === "link" && "text-primary hover:underline",
            className
        )}
    >
        {children}
    </button>
);

export default BrandsDirectory;
