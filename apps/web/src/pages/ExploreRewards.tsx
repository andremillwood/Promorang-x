import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Gift, KeyRound, MapPin, Search, ShieldCheck, Sparkles, Tag } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";

interface PublicRewardRow {
  id: string;
  code: string | null;
  name: string | null;
  description: string | null;
  discount_type: string | null;
  discount_value: number | null;
  max_uses: number | null;
  current_uses: number | null;
  expires_at: string | null;
  is_active: boolean | null;
  source_type: string | null;
  system: string | null;
  campaign_id: string | null;
  drop_id: string | null;
  store_id: string | null;
  advertiser_id: string | null;
  venue_slug: string | null;
  venue_name: string | null;
  city: string | null;
  country: string | null;
  brand_slug: string | null;
  brand_name: string | null;
}

const rewardPaths = [
  {
    title: "Proof-Based Missions",
    description: "Complete a moment, upload proof, and unlock value tied to that verified action.",
    href: "/watch-unlock",
    cta: "Browse missions",
    icon: Sparkles,
  },
  {
    title: "Wallet and Keys",
    description: "Track the points, keys, and unlock state that shape what you can claim next.",
    href: "/wallet",
    cta: "Open wallet",
    icon: KeyRound,
  },
  {
    title: "Rewards Vault",
    description: "Review claimed, earned, and locked rewards once you are inside the participant flow.",
    href: "/dashboard/rewards",
    cta: "Open rewards",
    icon: Gift,
  },
];

const rewardTypes = [
  { value: "all", label: "All reward types" },
  { value: "discount_percentage", label: "Percentage off" },
  { value: "discount_fixed", label: "Fixed discount" },
  { value: "free_item", label: "Free item" },
  { value: "bogo", label: "BOGO" },
];

const rewardSources = [
  { value: "all", label: "All sources" },
  { value: "merchant", label: "Venue rewards" },
  { value: "advertiser", label: "Brand rewards" },
  { value: "platform", label: "Platform rewards" },
];

const isMissingSupabaseRelation = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const relationError = error as { code?: string; message?: string; details?: string };
  return (
    relationError.code === "PGRST205" ||
    relationError.code === "42P01" ||
    relationError.message?.includes("Could not find the table") ||
    relationError.details?.includes("view_public_reward_directory")
  );
};

const ExploreRewards = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRewardType, setActiveRewardType] = useState("all");
  const [activeSource, setActiveSource] = useState("all");

  const rewardsQuery = useQuery({
    queryKey: ["explore-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_reward_directory" as never)
        .select("*")
        .order("expires_at", { ascending: true, nullsFirst: false })
        .limit(60);

      if (error && !isMissingSupabaseRelation(error)) throw error;
      return {
        rewards: (data || []) as PublicRewardRow[],
        unavailable: Boolean(error && isMissingSupabaseRelation(error)),
      };
    },
  });

  const filteredRewards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (rewardsQuery.data?.rewards || []).filter((reward) => {
      const matchesType = activeRewardType === "all" || reward.discount_type === activeRewardType;
      const matchesSource = activeSource === "all" || reward.source_type === activeSource;
      const matchesSearch =
        !query ||
        [
          reward.name,
          reward.description,
          reward.code,
          reward.brand_name,
          reward.venue_name,
          reward.city,
          reward.country,
          reward.discount_type,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesType && matchesSource && matchesSearch;
    });
  }, [rewardsQuery.data, searchQuery, activeRewardType, activeSource]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Explore Rewards"
        description="See how reward loops work across proofs, offers, points, keys, and participant claims on Promorang."
        url={getSiteUrl("/explore/rewards")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Explore Rewards",
          description: "See how reward loops work across proofs, offers, points, keys, and participant claims on Promorang.",
        }}
      />

      <section className="px-4 pb-12 pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 via-background to-amber-500/10 p-6 shadow-soft sm:p-8">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
              Reward Discovery
            </Badge>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Explore the reward economy behind the moments.
                </h1>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  Promorang rewards are not a generic coupon list. They sit inside proof loops, keys, points, and eligibility rules that connect action to value.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/15 bg-background/80 p-4 text-sm text-muted-foreground shadow-soft">
                <p className="font-semibold text-foreground">{user ? "Signed in" : "Guest mode"}</p>
                <p className="mt-1">
                  {user
                    ? "You can move from discovery into wallet and reward surfaces immediately."
                    : "You can browse the reward model here, then sign in when you want claims and balances."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {rewardPaths.map((path) => (
              <Card key={path.title} className="shadow-soft">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <path.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="font-serif text-2xl">{path.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">{path.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={path.href}>{path.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card className="shadow-soft">
              <CardContent className="p-5">
                <Coins className="mb-3 h-5 w-5 text-amber-500" />
                <p className="font-semibold text-foreground">Points</p>
                <p className="mt-2 text-sm text-muted-foreground">Activity can earn points. Those points contribute to access and progression rather than acting like raw cash.</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-5">
                <KeyRound className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Keys</p>
                <p className="mt-2 text-sm text-muted-foreground">Keys gate higher-value opportunities and turn participation history into selective access.</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-5">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" />
                <p className="font-semibold text-foreground">Proof and Eligibility</p>
                <p className="mt-2 text-sm text-muted-foreground">Some rewards are instant, some depend on proof review, and some depend on longer maturity or redemption controls.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-soft">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search rewards by title, code, brand, venue, or city..."
                className="h-12 pl-11"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {rewardTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setActiveRewardType(type.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeRewardType === type.value
                      ? "bg-emerald-600 text-white"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {rewardSources.map((source) => (
                <button
                  key={source.value}
                  type="button"
                  onClick={() => setActiveSource(source.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeSource === source.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">Browseable rewards</h2>
              <p className="text-sm text-muted-foreground">Public reward offers and discount mechanics connected to brands and venues.</p>
            </div>
            {!rewardsQuery.isLoading ? (
              <Badge variant="outline" className="rounded-full">
                {filteredRewards.length} rewards
              </Badge>
            ) : null}
          </div>
          {rewardsQuery.data?.unavailable ? (
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
              Public reward browsing is temporarily unavailable in this environment because the reward discovery view has not been provisioned yet.
            </div>
          ) : null}

          {rewardsQuery.isLoading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : filteredRewards.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRewards.map((reward) => {
                const usageRemaining =
                  typeof reward.max_uses === "number"
                    ? Math.max(reward.max_uses - (reward.current_uses || 0), 0)
                    : null;

                return (
                  <Card key={reward.id} className="overflow-hidden shadow-soft">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                          <Gift className="h-5 w-5" />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {reward.source_type ? (
                            <Badge variant="secondary" className="rounded-full capitalize">
                              {reward.source_type}
                            </Badge>
                          ) : null}
                          {reward.discount_type ? (
                            <Badge variant="outline" className="rounded-full capitalize">
                              {reward.discount_type.replace(/_/g, " ")}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <CardTitle className="font-serif text-2xl">
                          {reward.name || "Untitled reward"}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-3">
                          {reward.description || "Public reward offer available in the Promorang discovery layer."}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Offer value</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                          {typeof reward.discount_value === "number"
                            ? reward.discount_type?.includes("percentage")
                              ? `${reward.discount_value}%`
                              : `$${reward.discount_value}`
                            : "Open reward"}
                        </p>
                        {reward.code ? (
                          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Tag className="h-4 w-4 text-primary" />
                            Code: {reward.code}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {reward.venue_name ? (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {reward.venue_slug ? <Link to={`/venues/${reward.venue_slug}`} className="text-foreground hover:text-primary">{reward.venue_name}</Link> : reward.venue_name}
                          </p>
                        ) : null}
                        {reward.brand_name ? (
                          <p>
                            Brand:{" "}
                            {reward.brand_slug ? (
                              <Link to={`/brands/${reward.brand_slug}`} className="text-foreground hover:text-primary">
                                {reward.brand_name}
                              </Link>
                            ) : (
                              <span className="text-foreground">{reward.brand_name}</span>
                            )}
                          </p>
                        ) : null}
                        {reward.expires_at ? (
                          <p>Expires {new Date(reward.expires_at).toLocaleDateString()}</p>
                        ) : (
                          <p>No stated expiry</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-muted/40 p-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">System</p>
                          <p className="mt-2 text-sm font-semibold text-foreground capitalize">{reward.system || "public"}</p>
                        </div>
                        <div className="rounded-2xl bg-muted/40 p-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Remaining</p>
                          <p className="mt-2 text-sm font-semibold text-foreground">
                            {usageRemaining === null ? "Open" : usageRemaining}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {reward.drop_id ? (
                          <Button asChild variant="outline" className="flex-1">
                            <Link to="/watch-unlock">Related mission</Link>
                          </Button>
                        ) : null}
                        <Button asChild className="flex-1">
                          <Link to={user ? "/dashboard/rewards" : "/auth"}>
                            {user ? "Open rewards" : "Sign in to claim"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <h3 className="font-serif text-2xl font-bold">No rewards matched</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a broader search or switch reward type and source filters to scan a different slice of available value.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExploreRewards;
