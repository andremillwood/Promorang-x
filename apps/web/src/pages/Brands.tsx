import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
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
import { getSiteUrl } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";

const BRAND_CATEGORIES = [
    { value: "lifestyle", label: "Lifestyle" },
    { value: "technology", label: "Technology" },
    { value: "f&b", label: "Food & Beverage" },
    { value: "fashion", label: "Fashion" },
    { value: "entertainment", label: "Entertainment" },
    { value: "health", label: "Health & Wellness" },
];

const BrandsDirectory = () => {
    const { t } = useI18n();
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            <SEO
                title={t("brandsPage.seoTitle")}
                description={t("brandsPage.seoDesc")}
                url={getSiteUrl("/brands")}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": t("brandsPage.seoTitle"),
                    "description": t("brandsPage.seoDesc"),
                }}
            />

            <DirectoryHeader
                title={t("brandsPage.title")}
                description={t("brandsPage.subtitle")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                category={category}
                setCategory={setCategory}
                categories={BRAND_CATEGORIES}
                placeholder={t("brandsPage.searchPlaceholder")}
                onClearFilters={clearFilters}
                searchCategory="brand"
            />

            <div className="mb-8 rounded-[1.5rem] border border-border bg-card/80 p-5 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("brandsPage.connectedDirectory")}</p>
                        <h2 className="mt-2 font-serif text-xl font-bold text-foreground">{t("brandsPage.connectedTitle")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t("brandsPage.connectedDesc")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="link" className="rounded-full border border-border px-4 py-2" onClick={() => window.location.assign("/explore/moments")}>
                            {t("brandsPage.browseMoments")}
                        </Button>
                        <Button variant="link" className="rounded-full border border-border px-4 py-2" onClick={() => window.location.assign("/watch-unlock")}>
                            {t("brandsPage.watchUnlock")}
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">{t("brandsPage.loading")}</p>
                </div>
            ) : brands && brands.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                        <OrganizationCard
                            key={brand.id}
                            id={brand.id}
                            slug={brand.slug}
                            name={brand.name}
                            type="brand"
                            logo={brand.logo_url}
                            description={brand.description}
                            category={brand.industry}
                            verified={brand.verified_status === "verified"}
                            website={brand.website_url}
                            stats={[
                                {
                                    label: t("brandsPage.campaignsStat"),
                                    value: brand.active_campaigns_count || 0,
                                    icon: <Megaphone className="w-3 h-3" />
                                },
                                {
                                    label: t("brandsPage.sponsoredStat"),
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
                    <h3 className="text-lg font-medium">{t("brandsPage.noBrandsFound")}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                        {t("brandsPage.noBrandsDesc")}
                    </p>
                    <Button variant="link" onClick={clearFilters} className="mt-4">
                        {t("brandsPage.clearAllFilters")}
                    </Button>
                </div>
            )}
            <ProductTour tourId="brand-directory" />
        </div>
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
