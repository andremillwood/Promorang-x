import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DiscoverableMoment {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  venue_name: string | null;
  starts_at: string;
  ends_at: string | null;
  max_participants: number | null;
  reward: string | null;
  image_url: string | null;
  is_active: boolean;
  status: string;
  visibility: string;
  participant_count?: number;
  host_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface DiscoverFilters {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  minParticipants?: number;
}

// Fetch public moments for brand discovery (to sponsor)
export function useDiscoverMoments(filters?: DiscoverFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["discover-moments", filters],
    queryFn: async () => {
      let query = supabase
        .from("moments")
        .select("*")
        .eq("is_active", true)
        .eq("visibility", "open")
        .in("status", ["scheduled", "joinable", "active"]);

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte("starts_at", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("starts_at", filters.dateTo);
      }

      const { data, error } = await query.order("starts_at", { ascending: true });

      if (error) throw error;

      // Extract unique host IDs to fetch profiles in one go
      const hostIds = [...new Set((data || []).map(m => m.host_id))];
      const { data: profiles } = hostIds.length > 0
        ? await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", hostIds)
        : { data: [] };

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Fetch participant counts for each moment
      const momentsWithCounts = await Promise.all(
        (data || []).map(async (moment) => {
          const { count } = await supabase
            .from("moment_participants")
            .select("*", { count: "exact", head: true })
            .eq("moment_id", moment.id);

          return {
            ...moment,
            participant_count: count || 0,
            host_profile: profileMap[moment.host_id] || null,
          };
        })
      );

      // Filter by min participants if specified
      if (filters?.minParticipants) {
        return momentsWithCounts.filter(
          (m) => (m.participant_count || 0) >= (filters.minParticipants || 0)
        );
      }

      return momentsWithCounts as DiscoverableMoment[];
    },
    enabled: !!user,
  });
}

// Get unique categories from moments
export function useMomentCategories() {
  return useQuery({
    queryKey: ["moment-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("category")
        .eq("is_active", true);

      if (error) throw error;

      const categories = [...new Set(data?.map((m) => m.category) || [])];
      return categories.sort();
    },
  });
}
