import { useMemo, useState } from "react";
import { Compass, MapPin, MoonStar, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForYouFeed } from "@/hooks/useFeed";
import { FeedIntent, logFeedInteraction } from "@/services/feed";
import { FeedStream } from "@/components/feed/FeedStream";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const intentOptions: Array<{
  value: FeedIntent | null;
  label: string;
  icon: typeof Compass;
  description: string;
}> = [
  { value: null, label: "For You", icon: Compass, description: "A mixed stream of moments, proofs, and rewards." },
  { value: "nearby", label: "Near You", icon: MapPin, description: "Local movement worth acting on soon." },
  { value: "tonight", label: "Tonight", icon: MoonStar, description: "Experiences and prompts with immediate urgency." },
  { value: "earn", label: "Earn", icon: Coins, description: "Proof-based actions and rewards with value attached." },
];

const ForYou = () => {
  const { user } = useAuth();
  const [activeIntent, setActiveIntent] = useState<FeedIntent | null>(null);
  const feedQuery = useForYouFeed(activeIntent);

  const feedItems = useMemo(() => feedQuery.data?.feed || [], [feedQuery.data]);
  const rankingProfile = feedQuery.data?.meta.ranking_profile || "participant";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-3 rounded-full px-3 py-1">
              Personalized Discovery
            </Badge>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              For You
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Scroll a ranked stream of moments, proof loops, and reward opportunities instead of forcing discovery through a listing every time.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground shadow-soft">
            <p className="font-semibold text-foreground">
              {user?.user_metadata?.full_name?.split(" ")[0] || "You"} are viewing the <span className="capitalize">{rankingProfile}</span> profile.
            </p>
            <p className="mt-1">Change intent to reweight what rises to the top.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Intent</h2>
            <p className="text-sm text-muted-foreground">Choose the lens that should bias the feed.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {intentOptions.map((option) => {
            const isActive = activeIntent === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setActiveIntent(option.value)}
                className={`flex min-w-[180px] flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <div className={`rounded-xl p-2 ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  <option.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-serif text-2xl font-bold">Ranked Stream</h2>
          {feedQuery.data?.meta.active_intent ? (
            <Badge variant="outline" className="rounded-full">
              Intent: {feedQuery.data.meta.active_intent}
            </Badge>
          ) : null}
        </div>
        <FeedStream items={feedItems} isLoading={feedQuery.isLoading} />
      </section>

      {!feedQuery.isLoading && feedItems.length > 0 ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              if (feedItems[0]) {
                void logFeedInteraction({
                  itemType: feedItems[0].object_type,
                  itemId: feedItems[0].entity_id,
                  interactionType: "click",
                  metaData: {
                    source: "for_you_refresh",
                    intent: activeIntent,
                  },
                });
              }
              void feedQuery.refetch();
            }}
          >
            Refresh ranking
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ForYou;
