import { useQuery } from "@tanstack/react-query";
import { distributeMoments, tasteProfileFromPreferences } from "@promorang/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ExploreMoment {
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
  recurrence_enabled?: boolean | null;
  recurrence_frequency?: "daily" | "weekly" | "monthly" | null;
  recurrence_interval?: number | null;
  recurrence_by_weekday?: number[] | null;
  recurrence_day_of_month?: number | null;
  recurrence_until?: string | null;
  recurrence_count?: number | null;
  host_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ExploreMomentFilters {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  minParticipants?: number;
}

export function useExploreMoments(filters?: ExploreMomentFilters) {
  const { user, activeRole } = useAuth();

  return useQuery({
    queryKey: ["explore-moments-sponsorable", user?.id, activeRole, filters],
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

      const hostIds = [...new Set((data || []).map((moment) => moment.host_id).filter(Boolean))];
      const { data: profiles } = hostIds.length > 0
        ? await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", hostIds)
        : { data: [] };

      const profileMap = Object.fromEntries(
        (profiles || []).map((profile) => [profile.user_id, profile])
      );

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

      const eligible = filters?.minParticipants
        ? momentsWithCounts.filter(
          (moment) => (moment.participant_count || 0) >= (filters.minParticipants || 0)
        )
        : momentsWithCounts;

      const { data: preferences } = user
        ? await supabase
          .from("user_preferences")
          .select("preferred_categories, lifestyle_tags, age_range, preferred_times, city, country, latitude, longitude")
          .eq("user_id", user.id)
          .maybeSingle()
        : { data: null };

      return distributeMoments(
        eligible as ExploreMoment[],
        tasteProfileFromPreferences({ role: activeRole, ...preferences }),
      );
    },
    enabled: !!user,
  });
}

export function useMomentCategories() {
  return useQuery({
    queryKey: ["moment-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moments")
        .select("category")
        .eq("is_active", true);

      if (error) throw error;

      const categories = [...new Set(data?.map((moment) => moment.category) || [])];
      return categories.sort();
    },
  });
}
