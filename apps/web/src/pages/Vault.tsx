import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gift,
  Ticket,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  Calendar,
  Clock,
  Zap,
  Gem,
  Bookmark,
  Share2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LiquidityVaultDashboard } from "@/components/LiquidityVaultDashboard";
import { DigitalPromoCard } from "@/components/promocard/DigitalPromoCard";
import { TicketPass } from "@/components/promorang/SignatureObjects";
import { useI18n } from "@/i18n/I18nContext";
import { usePerks } from "@/hooks/usePerks";
import { usePromoShareRail } from "@/hooks/usePromoShareRail";
import { PerkCard } from "@/components/perks/PerkCard";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type VaultTab = "perks" | "tickets" | "memories" | "liquidity";

const Vault = () => {
  const { t, formatNumber } = useI18n();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<VaultTab>("perks");

  const { perks, isLoading: perksLoading } = usePerks();
  const { balances } = usePromoShareRail();

  const claimedPerks = perks.filter((p) => p.userState?.isClaimed);
  const savedPerks = perks.filter((p) => p.userState?.isSaved);

  const vaultQuery = useQuery({
    queryKey: ["vault-data", user?.id],
    enabled: Boolean(user && session),
    queryFn: async () => {
      if (!session?.access_token) return null;
      try {
        const response = await fetch(`${API_URL}/api/vault`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error("Error fetching vault:", error);
        return null;
      }
    },
  });

  const vaultData = vaultQuery.data || {};
  const memories = vaultData?.memories || [
    {
      id: "demo-m1",
      title: "I LUV HIP HOP — VIP Pass",
      moment_title: "I LUV HIP HOP",
      verified_date: "Aug 4, 2026",
      rarity: "Verified Guest",
    },
    {
      id: "demo-m2",
      title: "Kingston Dub Club — Sunday Sound",
      moment_title: "Dub Club Gathering",
      verified_date: "Aug 18, 2026",
      rarity: "Sound Regular",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white pb-16">
      <SEO title="My Retained Value & Vault — Promorang" description="Your unlocked perks, claimed vouchers, PromoShare draw tickets, and event memory badges." />

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Header Title & Stat Summary */}
        <div className="space-y-6 border-b border-white/10 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Badge className="rounded-full bg-[#ff5500] text-white font-bold text-xs px-3.5 py-1 uppercase tracking-wider border-none">
                {t("vaultPage.homeEyebrow")}
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {t("vaultPage.title")}
              </h1>
              <p className="text-white/60 text-sm max-w-xl">
                {t("vaultPage.homeCopy")}
              </p>
            </div>

            <GlobalTicketBalancePill />
          </div>

          <DigitalPromoCard />

          <Link to="/today" className="block group">
            <TicketPass
              kicker={t("vaultPage.todayCarryTitle")}
              title={t("vaultPage.todayCarryCopy")}
              detail={t("vaultPage.promoGemsHint")}
              stub={t("vaultPage.todayCarryCta")}
              stubLabel="Today"
              className="transition group-hover:brightness-110"
            />
          </Link>

          {/* 4 Economic Dimensions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* PromoPoints: Progress */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-bold uppercase tracking-wider">PromoPoints</span>
                <Zap className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-2xl font-black text-orange-400">{balances.promoPoints} pts</p>
              <span className="text-[10px] text-zinc-500 block">Progress &amp; Rank Tier</span>
            </div>

            {/* Perks: Utility */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Active Perks</span>
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">{claimedPerks.length || balances.claimedPerksCount}</p>
              <span className="text-[10px] text-zinc-500 block">Ready to redeem</span>
            </div>

            {/* PromoShare Tickets: Possibility */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Draw Tickets</span>
                <Ticket className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-300">{balances.promoShareTickets} 🎟️</p>
              <span className="text-[10px] text-purple-400 block">Draw: {balances.nextDrawDate}</span>
            </div>

            {/* Gems: Economic Value */}
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Platform Gems</span>
                <Gem className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-blue-400">{balances.gems} Gems</p>
              <span className="text-[10px] text-zinc-500 block">1 Gem = US$1 Value</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("perks")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "perks"
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Gift className="h-4 w-4" />
            <span>Claimed &amp; Saved Perks</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {claimedPerks.length + savedPerks.length || 4}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tickets")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "tickets"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>PromoShare Tickets &amp; Draw</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-[10px]">
              {balances.promoShareTickets}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("memories")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "memories"
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Memory Badges &amp; Proof</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">
              {memories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("liquidity")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "liquidity"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Community Backing &amp; Reserves</span>
          </button>
        </div>

        {/* TAB 1: CLAIMED & SAVED PERKS */}
        {activeTab === "perks" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Your Unlocked Utility Passes</h3>
                <p className="text-xs text-white/60">Show your redemption QR code at partner merchants or venues.</p>
              </div>
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-xs rounded-xl font-bold">
                <Link to="/discover?tab=perks">Explore More Perks →</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(claimedPerks.length > 0 ? claimedPerks : perks.slice(0, 3)).map((perk) => (
                <PerkCard key={perk.id} perk={perk} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROMOSHARE TICKETS & DRAW */}
        {activeTab === "tickets" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-[#121214] to-zinc-950 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs uppercase">
                    Possibility Layer
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {balances.promoShareTickets} PromoShare Draw Tickets Active
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-lg">
                    Tickets are entered into the weekly jackpot draw every Friday. Earn more tickets by sharing discoveries, perks, and moments.
                  </p>
                </div>

                <Button asChild className="bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs px-6 py-6 shadow-lg shadow-purple-600/20">
                  <Link to="/promoshare">Open Live Draw Arena →</Link>
                </Button>
              </div>

              {/* How downstream actions reward you */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white block">Referral Signs Up</span>
                  <span className="text-xs font-mono text-purple-300 font-bold">+1 Draw Ticket · +100 Pts</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white block">Referral Claims/Redeems Perk</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">+3 Draw Tickets · +50 Pts</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white block">Referral Checks In</span>
                  <span className="text-xs font-mono text-amber-400 font-bold">+2 Draw Tickets · +75 Pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEMORIES & PROOF */}
        {activeTab === "memories" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {memories.map((mem: any, idx: number) => (
                <div key={mem.id || idx} className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5500]/15 text-[#ff5500]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <Badge className="bg-white/10 text-white border-white/10 text-[10px] font-bold uppercase">
                        {mem.rarity || "Verified Memory"}
                      </Badge>
                      <h4 className="font-bold text-white text-lg mt-1">{mem.title || mem.moment_title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">{mem.verified_date || "Verified Attendance"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIQUIDITY */}
        {activeTab === "liquidity" && (
          <div className="animate-in fade-in duration-300">
            <LiquidityVaultDashboard />
          </div>
        )}

      </div>
    </div>
  );
};

export default Vault;
