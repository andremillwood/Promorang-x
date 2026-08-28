import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WEEKLY_MOMENT_LEAD_DAYS } from "@promorang/shared";

export type WeeklyDropItem = {
  id: string;
  drop_id: string;
  role: "new_this_week" | "horizon";
  week_start: string;
  horizon_ends_on: string;
  drop_title: string;
  announcement: string;
  moment_id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  location: string | null;
  venue_name: string | null;
  starts_at: string;
  ends_at: string | null;
  image_url: string | null;
};

export function useWeeklyMomentDrop() {
  return useQuery({
    queryKey: ["weekly-moment-drop"],
    queryFn: async () => {
      const { data: drops, error: dropError } = await (supabase as any)
        .from("view_public_weekly_moment_drops")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(1);
      if (dropError) throw dropError;

      const drop = drops?.[0] || null;
      if (!drop) return { drop: null, items: [] as WeeklyDropItem[], leadDays: WEEKLY_MOMENT_LEAD_DAYS };

      const { data: items, error } = await (supabase as any)
        .from("view_public_weekly_moment_drop_items")
        .select("*")
        .eq("drop_id", drop.id)
        .order("starts_at", { ascending: true });
      if (error) throw error;

      return {
        drop,
        items: (items || []) as WeeklyDropItem[],
        leadDays: WEEKLY_MOMENT_LEAD_DAYS,
      };
    },
  });
}
