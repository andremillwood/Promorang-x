import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance } from "@/hooks/useEconomy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  Coins,
  Copy,
  Gift,
  KeyRound,
  MapPin,
  Search,
  Sparkles,
  Store,
  Tag,
  Ticket,
  Zap,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { CURATED_REWARDS, CuratedReward } from "@/data/rewardsData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const categoryFilters = [
  { id: "all", label: "All Perks & Deals", icon: Sparkles },
  { id: "food", label: "Food & Drinks 🍹", icon: Gift },
  { id: "nightlife", label: "Nightlife & VIP 🎟️", icon: Ticket },
  { id: "retail", label: "Retail & Gear 🛍️", icon: Tag },
];

export function ExploreRewards() {
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const { t } = useI18n();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedReward, setSelectedReward] = useState<CuratedReward | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const rewardsQuery = useQuery({
    queryKey: ["explore-rewards-v2"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("view_public_reward_directory" as never)
          .select("*")
          .limit(30);

        if (error || !data) return CURATED_REWARDS;

        const dbRewards: CuratedReward[] = (data as any[]).map((r, i) => ({
          id: r.id || `db-reward-${i}`,
          code: r.code || "PROMOVIP",
          name: r.name || "Special Partner Offer",
          description: r.description || "Exclusive discount for Promorang members.",
          discount_type: r.discount_type || "discount_percentage",
          discount_value: r.discount_value || 10,
          discount_display: r.discount_value ? `${r.discount_value}% OFF` : "SPECIAL PERK",
          category: (r.category as any) || "food",
          category_label: r.category === "nightlife" ? "Nightlife & VIP" : "Food & Drinks",
          source_type: (r.source_type as any) || "merchant",
          brand_name: r.brand_name || r.venue_name || "Partner",
          venue_name: r.venue_name || "Kingston Venue",
          location: [r.city, r.country].filter(Boolean).join(", ") || "Kingston, Jamaica",
          image_url: r.image_url || CURATED_REWARDS[i % CURATED_REWARDS.length].image_url,
          cost_type: "points",
          cost_amount: 50,
          expires_in: "Valid this week",
          claimed_count: 45,
        }));

        const seenCodes = new Set(dbRewards.map((r) => r.code));
        const filteredCurated = CURATED_REWARDS.filter((cr) => !seenCodes.has(cr.code));
        return [...dbRewards, ...filteredCurated];
      } catch {
        return CURATED_REWARDS;
      }
    },
    initialData: CURATED_REWARDS,
  });

  const rewards = rewardsQuery.data || CURATED_REWARDS;

  const filteredRewards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rewards.filter((r) => {
      const matchesCategory = activeCategory === "all" || r.category === activeCategory;
      const matchesSearch =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.brand_name.toLowerCase().includes(query) ||
        r.venue_name.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [rewards, activeCategory, searchQuery]);

  const featuredReward = useMemo(() => {
    return rewards.find((r) => r.is_featured) || rewards[0];
  }, [rewards]);

  const handleClaimReward = (reward: CuratedReward) => {
    setSelectedReward(reward);
    setCopiedCode(false);
  };

  const handleCopyCode = () => {
    if (!selectedReward?.code) return;
    navigator.clipboard.writeText(selectedReward.code);
    setCopiedCode(true);
    toast({
      title: "Voucher Code Copied!",
      description: `Use code ${selectedReward.code} at ${selectedReward.venue_name}.`,
    });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white">
      <SEO
        title="Rewards & Deals — Exclusive Member Perks & Tasting Keys | Promorang"
        description="Unlock exclusive discounts, complimentary cocktails, VIP tasting passes, and brand perks across Kingston."
        url={getSiteUrl("/rewards")}
      />

      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title & Balance Row */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary text-white font-bold text-[10px] uppercase tracking-wider border-none">
                Exclusive Deals & Perks
              </Badge>
              <span className="text-xs text-white/50 font-semibold">{rewards.length} live partner perks</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Rewards & Member Perks
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl">
              Turn your proof points, access keys, and event check-ins into real-world dining, VIP passes, and merchant discounts.
            </p>
          </div>

          {/* Search Bar & User Wallet Capsule */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search deals by venue, item, or food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Quick Balance Hub */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 shrink-0">
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-xs font-bold text-white"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span>{balance?.promokeys || 0} Keys</span>
              </Link>
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition text-xs font-bold text-white"
              >
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span>{balance?.points || 0} Pts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Hero Deal Card */}
        {featuredReward && !searchQuery && activeCategory === "all" && (
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl min-h-[320px] flex items-end p-6 sm:p-10">
            <img
              src={featuredReward.image_url}
              alt={featuredReward.name}
              className="absolute inset-0 h-full w-full object-cover opacity-40 scale-105 filter blur-[0.5px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary text-black font-black text-xs uppercase tracking-wider shadow-lg">
                  {featuredReward.discount_display}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-xs">
                  {featuredReward.brand_name}
                </span>
                <span className="text-xs text-white/60 font-medium">
                  {featuredReward.claimed_count} members claimed
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {featuredReward.name}
              </h2>

              <p className="text-white/80 text-xs sm:text-sm font-normal line-clamp-2">
                {featuredReward.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => handleClaimReward(featuredReward)}
                  className="h-11 px-7 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-lg shadow-primary/25"
                >
                  <span>Claim Partner Perk</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
                <span className="text-xs text-white/60 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{featuredReward.venue_name} • {featuredReward.location}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryFilters.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Rewards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-white">Available Deals & Vouchers</h3>
            <span className="text-xs font-semibold text-white/50">{filteredRewards.length} deals available</span>
          </div>

          {filteredRewards.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 space-y-3">
              <Gift className="h-10 w-10 text-white/30 mx-auto" />
              <h4 className="text-lg font-bold text-white">No Deals Matched</h4>
              <p className="text-xs text-white/50">Try clearing your search query or switching categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/[0.08] transition-all hover:shadow-xl duration-200"
                >
                  {/* Image & Discount Badge */}
                  <div className="relative h-44 w-full overflow-hidden bg-black">
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-primary text-black font-black text-[11px] shadow-md">
                      {reward.discount_display}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 text-[10px] font-bold">
                      {reward.category_label}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {reward.brand_name}
                      </p>
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition line-clamp-2 leading-snug">
                        {reward.name}
                      </h4>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50 flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{reward.venue_name}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          {reward.cost_type === "promokeys" ? `${reward.cost_amount} Key` : `${reward.cost_amount} Pts`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 pt-0">
                    <Button
                      onClick={() => handleClaimReward(reward)}
                      variant="outline"
                      className="w-full rounded-2xl border-white/15 bg-white/5 hover:bg-primary hover:border-primary text-white font-bold text-xs transition-all h-9"
                    >
                      <span>Claim Perk</span>
                      <ArrowRight className="h-3 w-3 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Claim Voucher Modal */}
      <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <DialogContent className="sm:max-w-md bg-[#111216] border-white/15 text-white rounded-3xl p-6">
          {selectedReward && (
            <div className="space-y-5">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase">
                    {selectedReward.discount_display}
                  </span>
                  <span className="text-xs text-white/60 font-semibold">{selectedReward.brand_name}</span>
                </div>
                <DialogTitle className="text-xl font-black text-white leading-tight">
                  {selectedReward.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-white/60">
                  Present this voucher code to staff or enter it at checkout at {selectedReward.venue_name}.
                </DialogDescription>
              </DialogHeader>

              {/* Code Box */}
              <div className="p-4 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Voucher Pass Code</p>
                  <p className="text-xl font-mono font-black text-white tracking-widest mt-0.5">
                    {selectedReward.code}
                  </p>
                </div>
                <Button
                  onClick={handleCopyCode}
                  size="sm"
                  className="rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-xs"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Terms & Location Info */}
              <div className="text-xs text-white/60 space-y-1.5 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5 text-white/80 font-bold">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  <span>{selectedReward.venue_name}</span>
                </div>
                <p className="text-[11px] text-white/50">{selectedReward.location}</p>
                <p className="text-[11px] text-amber-400 font-semibold pt-1">{selectedReward.expires_in}</p>
              </div>

              <Button
                onClick={() => setSelectedReward(null)}
                variant="outline"
                className="w-full rounded-2xl border-white/10 text-white font-bold text-xs"
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExploreRewards;
