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

const HOST_CATEGORIES = [
    { value: "creator", label: "Creators" },
    { value: "operator", label: "Operators" },
    { value: "curator", label: "Curators" },
    { value: "community_leader", label: "Community Leaders" },
];

const HostsDirectory = () => {
    const { roles, user } = useAuth();
    const { startTour, isTourCompleted } = useTour();
    const primaryRole = roles[0] || "participant";
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");

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
        <DashboardLayout currentRole={primaryRole}>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <DirectoryHeader
                    title="Host Directory"
                    description="Find community leaders and organizers creating unique experiences and moments."
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    category={category}
                    setCategory={setCategory}
                    categories={HOST_CATEGORIES}
                    placeholder="Search by name or username..."
                    onClearFilters={clearFilters}
                    searchCategory="host"
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading host directory...</p>
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
                                        label: "Moments",
                                        value: host.hosted_moments_count || 0,
                                        icon: <Calendar className="w-3 h-3" />
                                    },
                                    {
                                        label: "Reputation",
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
                        <h3 className="text-lg font-medium">No hosts found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                            Connect with community leaders by searching for their name or expertise.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
            <ProductTour tourId="host-directory" />
        </DashboardLayout>
    );
};

export default HostsDirectory;
