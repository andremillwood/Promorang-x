import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, RefreshCw } from "lucide-react";
import type { FeedItem } from "@/services/feed";
import { logFeedInteraction } from "@/services/feed";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorialFeedCard } from "@/components/feed/EditorialFeedCard";
import { cn } from "@/lib/utils";

function TrackedFeedItem({ item, children, className }: { item: FeedItem; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const logged = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || logged.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || logged.current) return;
      logged.current = true;
      void logFeedInteraction({
        itemType: item.object_type,
        itemId: item.entity_id,
        interactionType: "impression",
        metaData: {
          source: "for_you_feed",
          feed_item_id: item.id,
          reason_labels: item.reason_labels,
        },
      });
      observer.disconnect();
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [item]);

  return (
    <div
      ref={ref}
      className={className}
      onClickCapture={() => {
        void logFeedInteraction({
          itemType: item.object_type,
          itemId: item.entity_id,
          interactionType: "click",
          metaData: { source: "for_you_feed", feed_item_id: item.id },
        });
      }}
    >
      {children}
    </div>
  );
}

export function FeedStream({
  items,
  isLoading,
  onRefresh,
  isRefreshing = false,
}: {
  items: FeedItem[];
  isLoading: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-5 lg:grid-cols-2" aria-label="Loading your feed">
        <Skeleton className="min-h-[520px] rounded-[1.75rem] bg-white/[0.06] lg:col-span-2" />
        <Skeleton className="min-h-[420px] rounded-[1.75rem] bg-white/[0.06]" />
        <Skeleton className="min-h-[420px] rounded-[1.75rem] bg-white/[0.06]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center text-white">
        <Compass className="mx-auto h-9 w-9 text-primary" />
        <h3 className="mt-5 font-serif text-3xl font-bold">Your next signal is still forming.</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45">Follow a scene, join a Moment, or explore what is live. Your feed will learn from what you choose.</p>
        <Link to="/discover" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-black">Explore what’s moving <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-x-5 gap-y-8 lg:grid-cols-2">
        {items.map((item, index) => {
          const featured = index === 0;
          const wide = !featured && (item.object_type === "piece" || index === items.length - 1);
          const spansGrid = featured || wide;
          return (
            <TrackedFeedItem key={item.id} item={item} className={cn(spansGrid && "lg:col-span-2")}>
              <EditorialFeedCard item={item} featured={featured} wide={wide} />
            </TrackedFeedItem>
          );
        })}
      </div>
      {onRefresh ? (
        <div className="mt-12 flex justify-center border-t border-white/10 pt-8">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold text-white/60 transition hover:border-primary hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh your mix
          </button>
        </div>
      ) : null}
    </>
  );
}
