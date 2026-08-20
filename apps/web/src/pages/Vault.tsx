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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { LiquidityVaultDashboard } from "@/components/LiquidityVaultDashboard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type VaultTab = "perks" | "memories" | "liquidity";

const Vault = () => {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<VaultTab>("perks");


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
  const activePerks = vaultData?.active_perks || [
    {
      id: "demo-p1",
      benefit_label: "Complimentary Tequila Shots",
      venue_name: "I LUV HIP HOP @ Fiction Nightclub",
      expires_at: "Valid Tonight",
      status: "ready",
    },
  ];
  const memories = vaultData?.memories || [
    {
      id: "demo-m1",
      title: "I LUV HIP HOP — VIP Pass",
      moment_title: "I LUV HIP HOP",
      verified_date: "Aug 4, 2026",
      rarity: "Verified Guest",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-extrabold">Sign in to View Your Vault</h1>
          <p className="text-white/60 text-sm">Your unlocked perks, drinks, free items, and event badges stay here.</p>
          <Button asChild className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-8 py-6">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff5500] selection:text-white">
      <SEO title="My Rewards & Vault — Promorang" description="Your unlocked perks, free vouchers, and event memory badges." />

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Header Title & Stat Summary */}
        <div className="space-y-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <Badge className="rounded-full bg-[#ff5500] text-white font-bold text-xs px-3.5 py-1 uppercase tracking-wider border-none">
              Digital Rewards Wallet
            </Badge>
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
              My Perk Vault
            </h1>
            <p className="text-white/60 text-base max-w-xl">
              All your verified event attendance badges, free drink vouchers, and unlocked perks in one place.
            </p>
          </div>

          {/* Stat Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Active Perks</span>
              <p className="text-2xl font-black text-amber-400">{activePerks.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Events Attended</span>
              <p className="text-2xl font-black text-white">{memories.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Culture Score</span>
              <p className="text-2xl font-black text-[#a855f7]">
                {vaultData?.summary?.total_legacy_score || (memories.length * 75 || 150)} pts
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#121214] p-4 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Culture Rank</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ff5500] animate-pulse" />
                <p className="text-xl font-black text-[#ff5500]">
                  {(vaultData?.summary?.total_legacy_score || 150) >= 700
                    ? "Tier 4: VIP Icon"
                    : (vaultData?.summary?.total_legacy_score || 150) >= 300
                    ? "Tier 3: Culture Insider"
                    : (vaultData?.summary?.total_legacy_score || 150) >= 100
                    ? "Tier 2: Scene Regular"
                    : "Tier 1: Scout"}
                </p>
              </div>
            </div>
          </div>

          {/* Culture Rank Ladder & Privilege Card */}
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#141218] to-[#121214] p-6 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs uppercase">
                    ⭐ Prestige Loyalty Status
                  </Badge>
                  <span className="text-xs font-mono text-white/40">Verified On-Chain & In-App</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Tier 2: Scene Regular — Unlocking VIP Doors
                </h2>
                <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                  Every verified event check-in and Moment Piece in your Vault increases your status across all Promorang hosts, unlocking presales, free drinks, and backstage upgrades.
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0 bg-black/40 p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Next Rank Progression</span>
                <strong className="text-sm font-mono text-purple-300">150 / 300 Pts to Tier 3</strong>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-[#ff5500] to-purple-500 h-full rounded-full w-[50%] transition-all duration-500 shadow-[0_0_12px_#a855f7]" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/50">
                <span>Tier 1: Scout (0 pts)</span>
                <span className="text-amber-400 font-bold">Tier 2: Regular (100 pts) ✓ Current</span>
                <span>Tier 3: Insider (300 pts)</span>
                <span>Tier 4: VIP Icon (700+ pts)</span>
              </div>
            </div>

            {/* Cross-Event Token-Gated Perks Teaser */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <strong className="text-white font-bold block">Unlocked: Midas Summer Piece Perks</strong>
                  <p className="text-stone-300">
                    Holding your verified attendance piece gives you <span className="text-emerald-400 font-bold">20% Early-Bird Presale & Express Gate Line</span> for Midas December 2026.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <strong className="text-white font-bold block">Next Unlock at Tier 3 (150 pts away)</strong>
                  <p className="text-stone-300">
                    Complimentary VIP Lounge Access & Backstage Soundcheck Double Passes for Easter Weekend Festival.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("perks")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
              activeTab === "perks"
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Gift className="h-4 w-4" /> Active Perks & Vouchers ({activePerks.length})
          </button>
          <button
            onClick={() => setActiveTab("memories")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
              activeTab === "memories"
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Trophy className="h-4 w-4" /> Attendance Badges ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab("liquidity")}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
              activeTab === "liquidity"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-400" /> Protocol Liquidity Pools
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "liquidity" && (
          <div className="animate-in fade-in duration-300">
            <LiquidityVaultDashboard />
          </div>
        )}


        {/* Tab Content */}
        {activeTab === "perks" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {vaultQuery.isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-48 rounded-3xl bg-white/5" />
                <Skeleton className="h-48 rounded-3xl bg-white/5" />
              </div>
            ) : activePerks.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-12 text-center space-y-4">
                <Gift className="h-12 w-12 text-white/20 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Active Perks Yet</h3>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  RSVP for upcoming events or complete check-ins to unlock free items, drink passes, and discount vouchers.
                </p>
                <Button asChild className="rounded-full bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold px-6">
                  <Link to="/discover">Browse Events & Perks</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {activePerks.map((perk: any, idx: number) => (
                  <div
                    key={perk.id || idx}
                    className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#121214] to-[#121214] p-6 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-amber-500 text-black font-bold text-xs uppercase border-none">
                          Ready to Redeem
                        </Badge>
                        <span className="text-xs text-white/50 font-medium">{perk.expires_at || "Active"}</span>
                      </div>

                      <h3 className="text-2xl font-extrabold text-white">
                        {perk.benefit_label || perk.benefit_type || "Complimentary Perk"}
                      </h3>

                      <p className="text-xs text-white/70 font-medium">
                        {perk.venue_name || "Event Venue"}
                      </p>
                    </div>

                    <Button className="w-full rounded-2xl bg-amber-500 text-black hover:bg-amber-400 font-bold py-6 shadow-lg shadow-amber-500/20">
                      <QrCode className="mr-2 h-5 w-5" /> Show Voucher to Door Manager
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "memories" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {memories.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#121214] p-12 text-center space-y-4">
                <Trophy className="h-12 w-12 text-white/20 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Verified Badges Yet</h3>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  Check in at your first event to start collecting verified attendance badges.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {memories.map((mem: any, idx: number) => (
                  <div key={mem.id || idx} className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-4">
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
