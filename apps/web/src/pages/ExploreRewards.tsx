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
  Compass,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { useToast } from "@/hooks/use-toast";
import { INITIAL_DEAL_REQUESTS, CommunityDealRequest } from "@/data/rewardsData";
import { VERIFIED_VENUES, VenueItem } from "@/data/venuesData";
import { SmartVenuePicker } from "@/components/venues/SmartVenuePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const POPULAR_PERK_PILLS = [
  "🍹 Free Welcome Rum Punch with Meal",
  "🏷️ 15% VIP Member Discount",
  "🍻 2-for-1 Happy Hour Drafts",
  "🔑 Skip-the-Line VIP Key & Balcony Access",
  "🍽️ Free Chips & Guac / Tasting Bite",
  "☕ Free Size Upgrade on Blue Mountain Coffee",
];

const VENUE_IMAGE_FALLBACKS: Record<string, string> = {
  "Tacbar": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
  "Dulce Lounge": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
  "PriceSmart": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
  "Devon House": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
  "Tracks & Records": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80",
  "Janga's": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
  "Chilitos": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
};

const getVenueImage = (venueName?: string | null, customUrl?: string | null) => {
  if (customUrl && customUrl.startsWith("http")) return customUrl;
  if (!venueName) return VERIFIED_VENUES[0].image_url;
  for (const [key, url] of Object.entries(VENUE_IMAGE_FALLBACKS)) {
    if (venueName.toLowerCase().includes(key.toLowerCase())) return url;
  }
  const match = VERIFIED_VENUES.find((v) => v.name.toLowerCase().includes(venueName.toLowerCase()));
  return match ? match.image_url : VERIFIED_VENUES[0].image_url;
};

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
    queryKey: ["verified-moment-rewards-v2"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("moments")
          .select("id, title, venue_name, location, reward, image_url, starts_at, category")
          .not("reward", "is", null)
          .order("starts_at", { ascending: true })
          .limit(12);

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
      category_label:
        newCategory === "nightlife"
          ? "Nightlife & Music"
          : newCategory === "retail"
          ? "Retail & Fashion"
          : "Food & Dining",
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
        description="Vote on community deal requests and signal demand to local venues and brands to unlock exclusive perks in Kingston."
        url={getSiteUrl("/rewards")}
      />

      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 space-y-10">
        {/* Header Title, Actions & Balance Hub */}
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-primary text-white font-bold text-[10px] uppercase tracking-wider border-none shadow-md shadow-primary/20">
                Demand-Driven Perks & Vouchers
              </Badge>
              <span className="text-xs text-white/50 font-semibold">Kingston Ecosystem</span>
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
              className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-lg shadow-primary/30 h-11 px-5 gap-1.5"
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

        {/* 1. VISUAL VERIFIED PERKS IN UPCOMING MOMENTS */}
        {verifiedMoments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20">
                    Live Door Perks
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Verified Perks in Upcoming Moments</span>
                </h2>
                <p className="text-xs text-white/50">
                  Guaranteed rewards, drink tokens, and points waiting for you when you RSVP and check in.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {verifiedMoments.map((m) => {
                const coverImage = getVenueImage(m.venue_name || m.location, m.image_url);

                return (
                  <Link
                    key={m.id}
                    to={`/moments/${m.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#111216] hover:border-primary/50 hover:bg-white/[0.04] transition-all hover:shadow-2xl duration-200"
                  >
                    {/* Top Image with Glowing Perk Badge */}
                    <div className="relative h-40 w-full overflow-hidden bg-black">
                      <img
                        src={coverImage}
                        alt={m.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      
                      {/* Neon Perk Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-primary text-black font-black text-[11px] shadow-lg flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        <span>{m.reward}</span>
                      </span>

                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90">
                        {m.category || "Live Moment"}
                      </span>
                    </div>

                    {/* Body Details */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-primary transition line-clamp-2 leading-snug">
                          {m.title}
                        </h3>
                        <p className="text-xs text-white/50 flex items-center gap-1 truncate pt-0.5">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{m.venue_name || m.location}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>Included with Pass</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. COMMUNITY DEMAND SIGNALS GRID */}
        <div className="space-y-5 pt-2">
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

          {/* Demand Requests Grid with Venue Photography & Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map((req) => {
              const progressPercent = Math.min(
                100,
                Math.round((req.votes_count / req.votes_threshold) * 100)
              );
              const isClose = progressPercent >= 75;
              const backdrop = getVenueImage(req.venue_name);

              return (
                <div
                  key={req.id}
                  className="group relative rounded-3xl border border-white/15 bg-[#111216] overflow-hidden hover:border-primary/40 transition duration-200 flex flex-col justify-between shadow-2xl"
                >
                  {/* Subtle Venue Backdrop Header */}
                  <div className="relative h-28 w-full overflow-hidden bg-black">
                    <img
                      src={backdrop}
                      alt={req.venue_name}
                      className="h-full w-full object-cover opacity-40 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111216] via-[#111216]/60 to-transparent" />

                    <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-wider text-primary">
                        {req.brand_interest}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/70">
                        {req.category_label}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-4">
                      <h3 className="text-lg font-black text-white leading-tight">
                        {req.venue_name}
                      </h3>
                      <p className="text-xs text-white/60 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span>{req.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body with Requested Perk & Progress Meter */}
                  <div className="p-5 space-y-4">
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                        Requested Perk Deal:
                      </span>
                      <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Gift className="h-3.5 w-3.5 shrink-0" />
                        <span>{req.requested_perk}</span>
                      </p>
                    </div>

                    {/* Progress Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/60 font-medium">Merchant Unlock Threshold</span>
                        <span className={`font-black ${isClose ? "text-emerald-400" : "text-amber-400"}`}>
                          {req.votes_count} / {req.votes_threshold} Votes ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-white/40 pt-0.5">
                        <span>Rallied by {req.requester_name}</span>
                        <span>{req.votes_threshold - req.votes_count} more votes to pitch merchant</span>
                      </div>
                    </div>

                    {/* Action Row */}
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

                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" />
                        <span>{req.votes_count} Scouts Rallied</span>
                      </span>
                    </div>
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

      {/* Interactive "Request a Perk" Modal with Smart Venue Picker & 1-Click Perk Pills */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#111216] border-white/15 text-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-wider">
                Demand Signal Generator
              </span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-tight">
              Request a Perk at Your Favorite Spot
            </DialogTitle>
            <DialogDescription className="text-xs text-white/60">
              Pick a local spot and select what perk would get you to go. When 50 members rally behind it, Promorang pitches the venue with guaranteed customer foot traffic!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRequest} className="space-y-6 pt-2">
            {/* 1. Pick Venue or Spot */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-white/90 flex items-center justify-between">
                <span>1. Where do you want a perk? *</span>
                <span className="text-[10px] text-primary font-semibold">Verified Kingston Spots</span>
              </Label>

              {/* Instant Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Type any spot (e.g. Sweetwood, Dub Club, Chilitos, PriceSmart)..."
                  value={newVenue}
                  onChange={(e) => {
                    setNewVenue(e.target.value);
                    const match = VERIFIED_VENUES.find((v) =>
                      v.name.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    if (match) {
                      setNewLocation(match.location);
                      setNewCategory(
                        match.venue_type === "soundstage" || match.venue_type === "lounge"
                          ? "nightlife"
                          : "food"
                      );
                      setNewBrand(match.name);
                    }
                  }}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-primary transition h-11"
                  required
                />
              </div>

              {/* 1-Tap Popular Kingston Spots */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                  Or tap a popular spot:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {VERIFIED_VENUES.slice(0, 6).map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setNewVenue(v.name);
                        setNewLocation(v.location);
                        setNewCategory(
                          v.venue_type === "soundstage" || v.venue_type === "lounge"
                            ? "nightlife"
                            : "food"
                        );
                        setNewBrand(v.name);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition text-left flex items-center gap-1.5 ${
                        newVenue === v.name
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. What Perk Would Get You to Go */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <Label className="text-xs font-bold text-white/90 flex items-center justify-between">
                <span>2. What perk would get you to go? *</span>
                <span className="text-[10px] text-primary font-semibold">1-Click Suggestions</span>
              </Label>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PERK_PILLS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setNewPerk(pill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition text-left ${
                      newPerk === pill
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Or type your custom desired perk..."
                value={newPerk}
                onChange={(e) => setNewPerk(e.target.value)}
                className="rounded-2xl bg-white/5 border-white/10 text-white placeholder-white/40 text-xs h-11 mt-2"
                required
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
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
                className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs px-7 h-11 shadow-lg shadow-primary/25"
              >
                Rally Demand & Earn +25 Pts
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExploreRewards;
