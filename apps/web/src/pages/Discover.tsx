import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  Compass,
  Gift,
  Heart,
  LayoutGrid,
  Map,
  MapPin,
  Radio,
  Search,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { SubmitDiscoveryModal } from "@/components/discovery/SubmitDiscoveryModal";
import { PromorangMap } from "@/components/PromorangMap";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SocialGraphFacepile } from "@/components/SocialGraphFacepile";

import { CURATED_KINGSTON_MOMENTS } from "@/lib/curated-radar";
import { DiscoveryWidget, DiscoveryProps } from "@/components/radar/DiscoveryWidget";
import { AskQuestionModal } from "@/components/discovery/AskQuestionModal";
import { HelpCircle, MessageSquare } from "lucide-react";

type PublicMoment = Tables<"view_public_moment_directory">;

const categoryFilters = [
  { id: "all", label: "All Events", icon: Sparkles },
  { id: "questions", label: "Discovery Polls 🔥", icon: HelpCircle },
  { id: "music", label: "Music & Parties", icon: Radio },
  { id: "food", label: "Food & Drinks", icon: Gift },
  { id: "community", label: "Gatherings & Culture", icon: Users },
];

const DISCOVERY_QUESTIONS_FEED: DiscoveryProps[] = [
  {
    id: 'disc-arla-tasteoff-001',
    question: 'Rasta Pasta or Chocolate Chip Mousse: Which one wins the PriceSmart Taste-Off?',
    category: 'Arla Taste-Off 🍝🍫',
    authorName: 'Arla Pro × Promorang Scout',
    totalVotes: 184,
    thresholdForMoment: 200,
    options: [
      { id: 'opt-arla-pasta', text: '🍝 Team Rasta Pasta (Hot & Savoury)', votes: 98 },
      { id: 'opt-arla-mousse', text: '🍫 Team Chocolate Chip Mousse (Cold & Whipped)', votes: 86 }
    ]
  },
  {
    id: 'disc-arla-mode-002',
    question: 'Whip It, Cook It, or Drink It: If you get one carton of Arla Whip & Cook right now, what happens first?',
    category: 'Product Mode 🍳🍰🥤',
    authorName: 'Taste Collective Jamaica',
    totalVotes: 126,
    thresholdForMoment: 150,
    options: [
      { id: 'opt-arla-cook', text: '🍳 Cook It (Alfredo, creamy chicken, seafood pasta)', votes: 58 },
      { id: 'opt-arla-whip', text: '🍰 Whip It (Mousse, cheesecake, cake toppings)', votes: 46 },
      { id: 'opt-arla-drink', text: '🥤 Drink It (Strong Back punch, specialty coffee)', votes: 22 }
    ]
  },
  {
    id: 'disc-arla-price-003',
    question: 'What would you expect to pay for a 1L cream designed for both cooking AND whipping?',
    category: 'Price Perception 💡',
    authorName: 'Retail Intelligence Scout',
    totalVotes: 158,
    thresholdForMoment: 160,
    options: [
      { id: 'opt-p1', text: 'Under J$1,000', votes: 14 },
      { id: 'opt-p2', text: 'J$1,000 – J$1,499 (Roadshow Price approx. J$1,200)', votes: 48 },
      { id: 'opt-p3', text: 'J$1,500 – J$1,999', votes: 52 },
      { id: 'opt-p4', text: 'J$2,000 – J$2,499', votes: 28 },
      { id: 'opt-p5', text: 'J$2,500+ (Stated Regular approx. J$2,700)', votes: 16 }
    ]
  },
  {
    id: 'disc-summer-end-001',
    question: 'How are you ending summer 2026 in Jamaica?',
    category: 'Summer Finale ☀️',
    authorName: 'Promorang Culture Guild',
    totalVotes: 142,
    thresholdForMoment: 150,
    options: [
      { id: 'opt-se1', text: 'Beach party & oceanfront vibes', votes: 68 },
      { id: 'opt-se2', text: 'Live concert & conscious stage show', votes: 42 },
      { id: 'opt-se3', text: 'Club night & high-energy indoor party', votes: 19 },
      { id: 'opt-se4', text: 'Something chill & food/lounge lyme', votes: 9 },
      { id: 'opt-se5', text: 'Haven’t decided yet', votes: 4 }
    ]
  },
  {
    id: 'disc-live-music-002',
    question: 'What gets you out for a live experience?',
    category: 'Live Culture 🎤',
    authorName: 'Midas Live Scout',
    totalVotes: 98,
    thresholdForMoment: 100,
    options: [
      { id: 'opt-lm1', text: 'Reggae & conscious roots vibration', votes: 44 },
      { id: 'opt-lm2', text: 'Dancehall energy & top selectors', votes: 29 },
      { id: 'opt-lm3', text: 'Afrobeats & crossover rhythm', votes: 12 },
      { id: 'opt-lm4', text: 'Hip Hop & sound clashes', votes: 7 },
      { id: 'opt-lm5', text: 'Depends strictly on who is performing', votes: 6 }
    ]
  },
  {
    id: 'disc-debate-001',
    question: 'Which Kingston jerk spot is undisputed King on a Friday evening?',
    category: 'Cultural Debate 🔥',
    authorName: 'Food Scout Jules (@KingstonFoodies)',
    totalVotes: 112,
    thresholdForMoment: 120,
    options: [
      { id: 'opt-j1', text: 'Sweetwood Jerk Joint (Liguanea)', votes: 48 },
      { id: 'opt-j2', text: 'Scotchies Jerk Center (Chelsea Ave)', votes: 39 },
      { id: 'opt-j3', text: 'Boston Jerk Table (Downtown Waterfront)', votes: 16 },
      { id: 'opt-j4', text: 'Pepperwood Jerk Center (New Kingston)', votes: 9 }
    ]
  },
  {
    id: 'disc-demand-002',
    question: 'What should Promorang fund and unlock in Kingston next?',
    category: 'Demand-to-Supply 🎯',
    authorName: 'Promorang Kingston Guild',
    totalVotes: 46,
    thresholdForMoment: 50,
    options: [
      { id: 'opt-1', text: 'Secret Jamaican Food Crawl (Barbican)', votes: 23 },
      { id: 'opt-2', text: 'Clay & Sip Pottery Workshop (New Kingston)', votes: 12 },
      { id: 'opt-3', text: 'Sunset Vinyl & High Tea (Strawberry Hill)', votes: 7 },
      { id: 'opt-4', text: 'Beginner Boxing & Coffee Morning', votes: 4 }
    ]
  },
  {
    id: 'disc-nightlife-004',
    question: 'Which Wednesday after-work hangout spot needs exclusive table perks?',
    category: 'Kingston After Dark 🍸',
    authorName: 'Fiction Resident DJ & Host',
    totalVotes: 58,
    thresholdForMoment: 60,
    options: [
      { id: 'opt-n1', text: 'FAT Wednesdays at Tracks & Records', votes: 27 },
      { id: 'opt-n2', text: 'Tacbar Courtyard Margaritas (Devon House)', votes: 18 },
      { id: 'opt-n3', text: 'AC Lounge Mixology & Tapas Bar', votes: 13 }
    ]
  }
];

const formatMomentDate = (value?: string | null) => {
  if (!value) return "TBA";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "TBA";
  }
};

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const discoveryQuery = useQuery({
    queryKey: ["discover-public-feed-v2"],
    queryFn: async () => {
      const { data: momentsData } = await supabase
        .from("moments")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(20);

      const dbMoments = momentsData || [];
      const curatedAsMoments = CURATED_KINGSTON_MOMENTS.map((cm) => ({
        id: cm.id,
        host_id: "editorial",
        title: cm.title,
        description: cm.description,
        category: cm.intentType === "ATTEND" ? "Music & Parties" : cm.intentType === "TRY" ? "Food & Drinks" : "Gatherings & Culture",
        location: cm.location,
        venue_name: cm.venueName,
        starts_at: new Date(Date.now() + 86400000).toISOString(),
        ends_at: null,
        max_participants: 50,
        reward: `${cm.pointsReward} Points + PromoKey`,
        image_url: cm.image,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Combine curated Kingston moments with any user-hosted DB moments
      const seenTitles = new Set(dbMoments.map(m => m.title.toLowerCase()));
      const filteredCurated = curatedAsMoments.filter(cm => !seenTitles.has(cm.title.toLowerCase()));

      return [...filteredCurated, ...dbMoments];
    },
  });

  const moments = discoveryQuery.data || [];
  const filteredMoments = moments.filter((m) => {
    const matchesCategory = activeCategory === "all" || (m.category || "").toLowerCase().includes(activeCategory);
    const matchesSearch = !searchQuery || (m.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (m.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredMoment = moments[0] || null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white">
      <SEO
        title="Discover Local Events & Perks — Promorang"
        description="Browse upcoming events, venue perks, and live community gatherings near you."
        url={getSiteUrl("/discover")}
      />

      {/* Main Container */}
      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8 space-y-10">

        {/* Header Title & Search Row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-8">
          <div className="space-y-2">
            <Badge className="rounded-full bg-[#ff5500] text-white font-bold text-xs px-3.5 py-1 uppercase tracking-wider border-none">
              Explore Culture & Events
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Discover What's Happening
            </h1>
            <p className="text-white/60 text-base max-w-xl font-normal">
              Find upcoming moments, reserve your spot, and unlock exclusive attendee perks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search events or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#ff5500] transition"
              />
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "grid" ? "bg-[#ff5500] text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  viewMode === "map" ? "bg-[#ff5500] text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                <Map className="h-4 w-4" /> Map View
              </button>
            </div>

            <SubmitDiscoveryModal />
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-2xl border border-[#ff5500]/25 bg-[#ff5500]/[0.07] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8a50]">Moment</p>
            <p className="mt-1 text-sm font-bold text-white">Something happening at a set time.</p>
            <p className="mt-1 text-xs text-white/50">Reserve a spot, attend, complete missions, and unlock perks.</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Discovery</p>
            <p className="mt-1 text-sm font-bold text-white">A place or cultural find worth knowing.</p>
            <p className="mt-1 text-xs text-white/50">Save it, visit it, log your check-in—or submit a find of your own.</p>
          </div>
        </div>

        {/* Top Story & Daily Gamification Rail */}
        <StoryGamificationRail
          onOpenWheel={() => setWheelOpen(true)}
          onOpenStreak={() => setStreakOpen(true)}
        />

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoryFilters.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Layout with 3-Column Desktop Right Rail */}
        <div className="flex gap-8 items-start">
          <div className="flex-1 space-y-10 min-w-0">
            {/* Featured Hero Event Card */}
            {featuredMoment && !searchQuery && activeCategory === "all" && (
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black min-h-[440px] flex items-end p-6 sm:p-10 lg:p-12">
                {featuredMoment.image_url || featuredMoment.banner_image_url ? (
                  <img
                    src={featuredMoment.banner_image_url || featuredMoment.image_url}
                    alt={featuredMoment.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-50 filter blur-[1px] scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff5500]/20 via-[#121214] to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />

                <div className="relative z-10 space-y-4 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#ff5500] text-white font-bold text-xs px-3 py-1">Featured Event</Badge>
                    <Badge variant="outline" className="border-white/20 text-white/80 bg-black/40">
                      {formatMomentDate(featuredMoment.starts_at)}
                    </Badge>
                  </div>

                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl leading-tight">
                    {featuredMoment.title}
                  </h2>

                  <p className="text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl font-medium">
                    {featuredMoment.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Button asChild className="rounded-2xl bg-[#ff5500] hover:bg-[#e04b00] text-white font-bold px-7 py-3 shadow-lg shadow-[#ff5500]/25">
                      <Link to={`/moments/${featuredMoment.id}`}>
                        RSVP & Reserve Spot <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <span className="text-xs text-white/60 flex items-center gap-1.5 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-[#ff5500]" /> {featuredMoment.venue_name || featuredMoment.location}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Discovery Questions & Debate Polls Grid */}
            {(activeCategory === "all" || activeCategory === "questions") && !searchQuery && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Demand Construction
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mt-1">Live Discovery Debates</h3>
                    <p className="text-xs text-white/50">Vote to influence which venue unlocks 15 limited Tasting Keys this week.</p>
                  </div>
                  <AskQuestionModal
                    trigger={
                      <Button className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20">
                        Ask Question
                      </Button>
                    }
                    onQuestionCreated={(newQ) => {
                      DISCOVERY_QUESTIONS_FEED.unshift(newQ);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DISCOVERY_QUESTIONS_FEED.map((q) => (
                    <DiscoveryWidget
                      key={q.id}
                      {...q}
                      onVote={(qId, optId) => {
                        console.log('Voted on discover page:', qId, optId);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Events Content View */}
            {activeCategory !== "questions" && (viewMode === "map" ? (
              <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-white/10">
                <PromorangMap />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-2xl font-bold text-white">Upcoming Events</h3>
                  <span className="text-xs font-semibold text-white/50">{filteredMoments.length} events found</span>
                </div>

                {discoveryQuery.isLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} className="h-80 w-full rounded-3xl bg-white/5" />
                    ))}
                  </div>
                ) : filteredMoments.length === 0 ? (
                  <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                    <Compass className="h-10 w-10 text-white/30 mx-auto" />
                    <h4 className="text-lg font-bold text-white">No events found</h4>
                    <p className="text-xs text-white/50">Try broadening your search or switching categories.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {filteredMoments.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all hover:border-[#ff5500]/40 hover:bg-white/10 hover:shadow-2xl hover:shadow-[#ff5500]/10"
                      >
                        {/* Event Card Header Image */}
                        <div className="relative h-48 w-full overflow-hidden bg-black">
                          {item.image_url || item.banner_image_url ? (
                            <img
                              src={item.image_url || item.banner_image_url}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-tr from-[#ff5500]/20 via-[#121214] to-black" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold uppercase">
                            {item.category || "Social"}
                          </Badge>
                        </div>

                        {/* Event Details Body */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5500]">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatMomentDate(item.starts_at)}</span>
                            </div>

                            <h3 className="text-xl font-bold text-white group-hover:text-[#ff5500] transition-colors line-clamp-1">
                              {item.title}
                            </h3>

                            <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1">
                              <MapPin className="h-3.5 w-3.5 text-white/40" />
                              {item.venue_name || item.location}
                            </p>

                            {item.reward && (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                                <Gift className="h-3.5 w-3.5" /> {item.reward}
                              </div>
                            )}

                            {/* Friend Facepile Social Proof */}
                            <SocialGraphFacepile claimedCount={18} />
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="p-5 pt-0">
                          <Button asChild variant="outline" className="w-full rounded-2xl border-white/15 bg-white/5 text-white hover:bg-[#ff5500] hover:border-[#ff5500] font-bold transition-all">
                            <Link to={`/moments/${item.id}`}>View Event & RSVP</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Utility Rail */}
          <RightUtilityRail
            onOpenSlashModal={() => setSlashOpen(true)}
            onOpenStreakModal={() => setStreakOpen(true)}
          />
        </div>

        {/* Gamification & Viral Modals */}
        <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
        <TeamSlashModal isOpen={slashOpen} onClose={() => setSlashOpen(false)} />
        <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
      </div>
    </div>
  );
};

export default Discover;
