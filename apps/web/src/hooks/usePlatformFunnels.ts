import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { funnelRequest, type FunnelKind, type FunnelProgress } from "@/lib/platform-funnels";

export function usePlatformFunnels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["platform-funnels", user?.id],
    enabled: Boolean(user),
    queryFn: () => funnelRequest<Record<FunnelKind, FunnelProgress>>("/funnels/me"),
    staleTime: 15000,
  });
}
