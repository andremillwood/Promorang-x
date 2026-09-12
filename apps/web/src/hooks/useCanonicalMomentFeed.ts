import { useQuery } from "@tanstack/react-query";
import { getCanonicalMomentFeed } from "@/services/moment-feed";

export function useCanonicalMomentFeed() {
  return useQuery({
    queryKey: ["canonical-moment-feed"],
    queryFn: getCanonicalMomentFeed,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
}
