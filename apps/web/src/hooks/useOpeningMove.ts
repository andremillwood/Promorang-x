import { useQuery } from "@tanstack/react-query";
import { getOpeningMove, shouldShowOpeningMove, type OpeningPathChoice } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PATH_KEY = "promorang_opening_path";

export function readOpeningPathChoice(): OpeningPathChoice | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(PATH_KEY);
  return value === "place" || value === "out" ? value : null;
}

export function writeOpeningPathChoice(choice: OpeningPathChoice) {
  sessionStorage.setItem(PATH_KEY, choice);
}

export function useOpeningMove() {
  const { user, activeRole } = useAuth();
  const pathChoice = readOpeningPathChoice();

  const inventory = useQuery({
    queryKey: ["opening-move-inventory", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    queryFn: async () => {
      const [{ count: hostedMomentCount }, { count: joinedMomentCount }] = await Promise.all([
        supabase.from("moments").select("id", { count: "exact", head: true }).eq("host_id", user!.id),
        supabase.from("moment_participants").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return {
        hostedMomentCount: hostedMomentCount || 0,
        joinedMomentCount: joinedMomentCount || 0,
      };
    },
  });

  const input = {
    role: activeRole,
    hostedMomentCount: inventory.data?.hostedMomentCount,
    joinedMomentCount: inventory.data?.joinedMomentCount,
    pathChoice,
  };

  return {
    loading: Boolean(user) && inventory.isLoading,
    show: Boolean(user) && !inventory.isLoading && shouldShowOpeningMove(input),
    move: getOpeningMove(input),
    input,
    refresh: inventory.refetch,
  };
}
