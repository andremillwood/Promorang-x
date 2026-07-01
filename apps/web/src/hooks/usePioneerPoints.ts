import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL } from "@/lib/api";

export type PioneerRole = {
  contributor_type: string;
  verified_points: number;
  pending_points: number;
  verified_actions?: number;
};

export type PioneerDashboard = {
  season: null | {
    name: string;
    slug: string;
    status: string;
    ends_at: string;
    reward_pool_amount: number | null;
  };
  totals: null | {
    verified_points: number;
    pending_points: number;
    verified_actions: number;
    rank?: number;
    participant_count?: number;
  };
  roles: PioneerRole[];
  recent: Array<{
    id: string;
    event_type: string;
    contributor_type: string;
    points: number;
    status: string;
    occurred_at: string;
  }>;
  venues?: Array<{
    id: string;
    name: string;
    address: string;
    image_url?: string | null;
    events: Array<{
      id: string;
      event_type: string;
      points: number;
      status: string;
      occurred_at: string;
      reason?: string | null;
    }>;
  }>;
  notifications?: Array<{
    id: string;
    notification_type: string;
    title: string;
    body: string;
    read_at?: string | null;
    created_at: string;
  }>;
};

export function usePioneerPoints() {
  return useQuery({
    queryKey: ["pioneer-points", "dashboard"],
    queryFn: async (): Promise<PioneerDashboard> => {
      const { data } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/pioneer-points/dashboard`, {
        headers: data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {},
      });
      if (!response.ok) throw new Error("Unable to load Pioneer Points");
      return response.json();
    },
  });
}
