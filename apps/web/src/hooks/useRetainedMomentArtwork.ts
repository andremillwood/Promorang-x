import { useQueries } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import type { RetainedMemory } from "@/lib/participant-memory";

type MomentArtwork = {id:string; image_url?:string | null};
/** Older Pieces can outlive the live feed. Resolve their actual source artwork. */
export function useRetainedMomentArtwork(memories: RetainedMemory[]) {
 const feed = useCanonicalMomentFeed();
 const live = feed.data?.moments || [];
 const ids = [...new Set(memories.map((memory) => memory.moment_id).filter((id): id is string => Boolean(id)))];
 const missing = ids.filter((id) => !live.some((moment) => moment.id === id && moment.image_url));
 const sources = useQueries({queries:missing.map((id) => ({
  queryKey:["retained-moment-artwork",id], staleTime:300_000, retry:false,
  queryFn:async (): Promise<MomentArtwork | null> => {
   const response = await fetch(`${API_BASE_URL}/moments/${encodeURIComponent(id)}`);
   if (!response.ok) return null;
   const payload = await response.json();
   const moment = payload?.moment || payload?.data || payload;
   return moment?.id === id && typeof moment.image_url === "string" ? {id,image_url:moment.image_url} : null;
  },
 }))});
 return [...live,...sources.flatMap((source) => source.data ? [source.data] : [])];
}
