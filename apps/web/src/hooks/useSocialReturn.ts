import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SocialReturnSummary = {
  scenes: number;
  moments: number;
  returns: number;
  people_brought: number;
  connections: number;
  invitations: number;
  open_doors: number;
  memories: number;
  recent_openings: Array<{ id: string; type: string; title: string; status: string; destination_url?: string | null; opened_at: string }>;
};

const emptySummary: SocialReturnSummary = { scenes: 0, moments: 0, returns: 0, people_brought: 0, connections: 0, invitations: 0, open_doors: 0, memories: 0, recent_openings: [] };

export function useSocialReturn(enabled = true) {
  return useQuery({
    queryKey: ["human-social-return"],
    enabled,
    queryFn: async (): Promise<SocialReturnSummary> => {
      const rpcClient = supabase as unknown as {
        rpc: (name: string) => Promise<{ data: Partial<SocialReturnSummary> | null; error: { message: string } | null }>;
      };
      const { data, error } = await rpcClient.rpc("get_my_social_return");
      if (error) throw error;
      return { ...emptySummary, ...(data || {}) };
    },
    staleTime: 30_000,
  });
}
