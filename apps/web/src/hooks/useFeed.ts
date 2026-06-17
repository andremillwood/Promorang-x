import { useQuery } from "@tanstack/react-query";
import { FeedIntent, getForYouFeed } from "@/services/feed";
import { useAuth } from "@/contexts/AuthContext";

export const useForYouFeed = (intent: FeedIntent | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["for-you-feed", user?.id, intent],
    queryFn: () => getForYouFeed({ intent }),
    enabled: !!user,
  });
};
