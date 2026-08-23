import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance } from "@/hooks/useEconomy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Check,
  Coins,
  Flame,
  Gift,
  KeyRound,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Store,
  Tag,
  ThumbsUp,
  Ticket,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_DEAL_REQUESTS, CommunityDealRequest } from "@/data/rewardsData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ExploreRewards() {
  const { user } = useAuth();
  const { data: balance } = useUserBalance();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dealRequests, setDealRequests] = useState<CommunityDealRequest[]>(INITIAL_DEAL_REQUESTS);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // New Request Form State
  const [newVenue, setNewVenue] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newPerk, setNewPerk] = useState("");
  const [newCategory, setNewCategory] = useState<"food" | "nightlife" | "retail" | "experience">("food");

  // Query real database moments that have active rewards attached
  const verifiedMomentsQuery = useQuery({
    queryKey: ["verified-moment-rewards"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("moments")
          .select("id, title, venue_name, location, reward, image_url, starts_at, category")
          .not("reward", "is", null)
          .order("starts_at", { ascending: true })
          .limit(10);

        if (error || !data) return [];
        return data.filter((m) => Boolean(m.reward));
      } catch {
        return [];
      }
    },
  });

  const verifiedMoments = verifiedMomentsQuery.data || [];

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return dealRequests.filter((req) => {
      const matchesCategory = activeCategory === "all" || req.category === activeCategory;
      const matchesSearch =
        !query ||
        req.venue_name.toLowerCase().includes(query) ||
        req.requested_perk.toLowerCase().includes(query) ||
        req.brand_interest.toLowerCase().includes(query) ||
        req.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [dealRequests, activeCategory, searchQuery]);

  const handleVote = (id: string) => {
    setDealRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const nextVoted = !req.has_voted;
          return {
            ...req,
            has_voted: nextVoted,
            votes_count: nextVoted ? req.votes_count + 1 : req.votes_count - 1,
          };
        }
        return req;
      })
    );

    toast({
      title: "Demand Signal Recorded! 🔥",
      description: "Your vote was added to the merchant notification threshold. You earned +10 Proof Points!",
    });
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenue.trim() || !newPerk.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter at least a venue name and the desired perk.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: CommunityDealRequest = {
      id: `req-${Date.now()}`,
      venue_name: newVenue.trim(),
      location: newLocation.trim() || "Kingston, Jamaica",
      brand_interest: newBrand.trim() || "Local Merchant",
      requested_perk: newPerk.trim(),
      category: newCategory,
      category_label: newCategory === "nightlife" ? "Nightlife & Music" : newCategory === "retail" ? "Retail & Fashion" : "Food & Dining",
      votes_count: 1,
      votes_threshold: 50,
      has_voted: true,
      requester_name: user?.user_metadata?.full_name || "You",
      created_at: new Date().toISOString(),
    };

    setDealRequests((prev) => [newEntry, ...prev]);
    setRequestModalOpen(false);

    // Reset Form
    setNewVenue("");
    setNewLocation("");
    setNewBrand("");
    setNewPerk("");

    toast({
      title: "Perk Request Published! 🚀",
      description: "Your deal demand signal is now live for the community to rally behind. (+25 Points)",
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white">
      <SEO
        title="Rewards & Demand Hub — Request & Unlock Member Perks | Promorang"
        description="Vote on community deal requests and signal demand to local venues and brands to unlock exclusive perks."
        url={getSiteUrl("/rewards")}
      />

      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title, Actions & Balance Hub */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary text-white font-bold text-[10px] uppercase tracking-wider border-none">
                Demand-Driven Perks & Quests
              </Badge>
              <span className="text-xs text-white/50 font-semibold">Community Powered</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Rewards & Member Perks
            </h1>
            <p className="text-white/60 text-xs sm:text-sm max-w-xl">
              Signal demand for perks at your favorite spots. When enough members vote, Promorang partners with the venue to unlock guaranteed deals.
            </p>
          </div>

          {/* Action Hub & Balance */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button
              onClick={() => setRequestModalOpen(true)}
              className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/25 h-11 px-5 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Request a Perk at a Spot</span>
            </Button>

            {/* User Points & Keys Capsule */}
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

        {/* 1. Real Verified Live Moment Perks (If Any in Database) */}
        {verifiedMoments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Verified Perks in Upcoming Moments</span>
                </h2>
                <p className="text-xs text-white/50">Guaranteed rewards included when you RSVP and check in.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {verifiedMoments.map((m) => (
                <Link
                  key={m.id}
                  to={`/moments/${m.id}`}
                  className="p-5 rounded-3xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/[0.08] transition flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      Included with RSVP
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition line-clamp-1">
                      {m.title}
                    </h3>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span className="truncate">{m.venue_name || m.location}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300">
                      🎁 {m.reward}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. Community Perk Demand Engine Header & Search */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  Live Community Demand Signals
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                Top Requested Deals in Kingston
              </h2>
              <p className="text-xs text-white/60">
                Vote to charge the unlock meter. Once a request reaches its threshold, Promorang presents the guaranteed customer headcount to the merchant!
              </p>
            </div>

            {/* Filter Search Bar */}
            <div className="relative w-full sm:min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search requested spots or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Requests", icon: Sparkles },
              { id: "food", label: "Food & Dining 🍽️", icon: Gift },
              { id: "nightlife", label: "Nightlife & VIP 🍹", icon: Ticket },
            ].map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
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

          {/* Demand Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map((req) => {
              const progressPercent = Math.min(100, Math.round((req.votes_count / req.votes_threshold) * 100));
              const isClose = progressPercent >= 75;

              return (
                <div
                  key={req.id}
                  className="p-6 rounded-3xl border border-white/10 bg-[#111216] hover:border-primary/40 transition duration-200 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                          {req.brand_interest}
                        </span>
                        <h3 className="text-lg font-black text-white leading-tight">
                          {req.venue_name}
                        </h3>
                        <p className="text-xs text-white/50 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span>{req.location}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 shrink-0">
                        {req.category_label}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5 shrink-0" />
                        <span>Requested: {req.requested_perk}</span>
                      </p>
                    </div>

                    {/* Unlock Threshold Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60 font-medium">Merchant Unlock Threshold</span>
                        <span className={`font-black ${isClose ? "text-emerald-400" : "text-amber-400"}`}>
                          {req.votes_count} / {req.votes_threshold} Votes ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/40">
                        Requested by {req.requester_name}
                      </p>
                    </div>
                  </div>

                  {/* Vote / Boost Action */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <Button
                      onClick={() => handleVote(req.id)}
                      className={`rounded-2xl font-bold text-xs h-10 px-5 gap-1.5 transition ${
                        req.has_voted
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{req.has_voted ? "Demand Backed (+10 Pts)" : "Boost Demand (+10 Pts)"}</span>
                    </Button>

                    <span className="text-[11px] text-white/50 font-medium">
                      {req.votes_threshold - req.votes_count} more to pitch merchant
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. For Merchants & Brand Partners Conversion Callout */}
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-[#121316] to-black p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                For Venues, Merchants & Brands
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Own a Venue or Represent a Product in Jamaica?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Activate verified customer demand. Launch a tasting pass, happy hour perk, or sponsored reward with guaranteed attendee attribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              asChild
              className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs h-11 px-6 shadow-lg shadow-primary/25"
            >
              <Link to="/create/moment">Offer a Member Perk</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 font-bold text-xs h-11 px-5"
            >
              <Link to="/for-brands">Brand Co-Op Info</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive "Request a Perk" Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-lg bg-[#111216] border-white/15 text-white rounded-3xl p-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase">
                New Demand Signal
              </span>
            </div>
            <DialogTitle className="text-xl font-black text-white leading-tight">
              Request a Perk at Your Favorite Spot
            </DialogTitle>
            <DialogDescription className="text-xs text-white/60">
              Tell the community what spot you want to rally around. When 50 members vote, Promorang pitches the venue with guaranteed customer foot traffic!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80">Venue or Spot Name</Label>
              <Input
                placeholder="e.g. Chilitos Jamexican, Usain Bolt Tracks & Records"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-white/80">Location / Neighborhood</Label>
                <Input
                  placeholder="e.g. New Kingston, Hope Rd"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-white/80">Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-primary h-10"
                >
                  <option value="food" className="bg-[#111216] text-white">Food & Dining</option>
                  <option value="nightlife" className="bg-[#111216] text-white">Nightlife & Music</option>
                  <option value="retail" className="bg-[#111216] text-white">Retail & Merch</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80">Brand / Product Interest (Optional)</Label>
              <Input
                placeholder="e.g. Arla Foods, Red Stripe, Local Craft Beer"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-white/80">What Perk or Deal Would Get You to Go?</Label>
              <Input
                placeholder="e.g. Free Rum Punch with Platter, 15% VIP discount, BOGO Drafts"
                value={newPerk}
                onChange={(e) => setNewPerk(e.target.value)}
                className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-10"
                required
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRequestModalOpen(false)}
                className="text-xs text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs px-6 h-10 shadow-lg shadow-primary/25"
              >
                Publish Request & Earn +25 Pts
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExploreRewards;
