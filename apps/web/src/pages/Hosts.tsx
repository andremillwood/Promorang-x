import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { DirectoryHeader } from "@/components/directory/DirectoryHeader";
import { OrganizationCard } from "@/components/directory/OrganizationCard";
import { Users, Calendar, Star, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useTour } from "@/contexts/TourContext";
import ProductTour from "@/components/tours/ProductTour";
import { useEffect } from "react";
import { useI18n } from "@/i18n/I18nContext";

const HostsDirectory = () => {
    const { t } = useI18n();
    const { roles, user } = useAuth();
    const { startTour, isTourCompleted } = useTour();
    const primaryRole = roles[0] || "participant";
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

    const hostCategories = [
        { value: "creator", label: t("hosts.catCreators") },
        { value: "operator", label: t("hosts.catOperators") },
        { value: "curator", label: t("hosts.catCurators") },
        { value: "community_leader", label: t("hosts.catCommunityLeaders") },
    ];

    // Auto-start host directory tour for new users
    useEffect(() => {
        if (user && !isTourCompleted('host-directory')) {
            const timer = setTimeout(() => {
                startTour('host-directory');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user, isTourCompleted, startTour]);

    const { data: hosts, isLoading } = useQuery({
        queryKey: ["hosts-discovery", category, searchTerm],
        queryFn: async () => {
            let query = supabase
                .from("view_host_discovery")
                .select("*");

            // Filter by category if we had a role-based field in the view, 
            // for now we'll just handle role filtering if needed or search.
            if (searchTerm) {
                query = query.or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
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
                title={t("hosts.title")}
                description={t("hosts.copy")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                category={category}
                setCategory={setCategory}
                categories={hostCategories}
                placeholder={t("hosts.search")}
                onClearFilters={clearFilters}
                searchCategory="host"
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">{t("hosts.loading")}</p>
                </div>
            ) : hosts && hosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hosts.map((host) => (
                        <OrganizationCard
                            key={host.id}
                            id={host.id}
                            name={host.display_name || host.username}
                            type="host"
                            logo={host.profile_image}
                            description={host.bio}
                            verified={host.reliability_score >= 95}
                            stats={[
                                {
                                    label: t("hosts.moments"),
                                    value: host.hosted_moments_count || 0,
                                    icon: <Calendar className="w-3 h-3" />
                                },
                                {
                                    label: t("hosts.reputation"),
                                    value: `${host.reliability_score}%`,
                                    icon: <Star className="w-3 h-3" />
                                }
                            ]}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">{t("hosts.empty")}</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                        {t("hosts.emptyCopy")}
                    </p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 text-sm font-medium text-primary hover:underline"
                    >
                        {t("directory.clear")}
                    </button>
                </div>
            )}
            <ProductTour tourId="host-directory" />
        </div>
    );
};

export default HostsDirectory;
