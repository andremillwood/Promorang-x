import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  DollarSign,
  Gift,
  Target,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  Flame,
  Award,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { CreatorMissionPublisher } from "@/components/creator/CreatorMissionPublisher";

export function CreatorMissionsHub() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [claimedBounties, setClaimedBounties] = useState<string[]>([]);

  const handleClaim = (bountyTitle: string, bountyId: string) => {
    setClaimedBounties((prev) => [...prev, bountyId]);
    toast({
      title: t("creBounty.toastTitle"),
      description: t("creBounty.toastBody", { title: bountyTitle }),
    });
  };

  const bounties = [
    {
      id: "bounty-1",
      title: "Water Lane Mural Festival Highlight Reel",
      brand: "Downtown Kingston Arts",
      rewardCash: 150,
      rewardPoints: 300,
      format: "Instagram Reel (30-60s)",
      deadline: "3 days left",
      requirements: "Tag @promorang and feature 3 local street artists.",
      claimedCount: 8,
      slotsAvailable: 15,
      image: "/assets/moments/street-art.jpg",
    },
    {
      id: "bounty-2",
      title: "Artisan Coffee Tasting Experience Walkthrough",
      brand: "Blue Mountain Coffee Co.",
      rewardCash: 100,
      rewardPoints: 200,
      format: "TikTok or Reel",
      deadline: "5 days left",
      requirements: "Show PromoKey QR scan at counter + taste review.",
      claimedCount: 12,
      slotsAvailable: 20,
      image: "/assets/moments/coffee-code.jpg",
    },
    {
      id: "bounty-3",
      title: "Skyline Sunset Acoustic Golden Hour Showcase",
      brand: "Midas Kingston",
      rewardCash: 250,
      rewardPoints: 500,
      format: "Cinematic Reel / Photo Carousel",
      deadline: "6 days left",
      requirements: "Capture crowd vibe, sunset skyline view, and live acoustic performance.",
      claimedCount: 4,
      slotsAvailable: 10,
      image: "/assets/moments/sunset-photo.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Target className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("creBounty.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                {t("creBounty.pool")}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("creBounty.subtitle")}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-[10px] uppercase font-bold text-white/50">{t("creBounty.avg")}</p>
          <p className="text-base font-black text-purple-400">{t("creBounty.avgVal")}</p>
        </div>
      </div>

      {/* 2. Bounties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bounties.map((bounty) => {
          const isClaimed = claimedBounties.includes(bounty.id);

          return (
            <div
              key={bounty.id}
              className="rounded-3xl border border-white/10 bg-[#0e1015] overflow-hidden group hover:border-purple-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              {/* Photo & Bounty Header */}
              <div className="relative h-44 w-full overflow-hidden bg-black">
                <img
                  src={bounty.image}
                  alt={bounty.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-black/40 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-400 text-black font-black text-xs shadow-md">
                    {t("creBounty.cash", { amount: `${bounty.rewardCash}.00` })}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px]">
                    {t("creBounty.pts", { count: bounty.rewardPoints })}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-[10px] text-white/70">{bounty.format}</span>
                  <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {bounty.deadline}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-400">
                    {bounty.brand}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 leading-tight line-clamp-2">
                    {bounty.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">
                    {bounty.requirements}
                  </p>
                </div>

                {/* Claim Slots & CTA */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-white/50">
                    {t("creBounty.claimedSlots", { claimed: bounty.claimedCount, slots: bounty.slotsAvailable })}
                  </span>

                  {isClaimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("creBounty.inProgress")}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(bounty.title, bounty.id)}
                      className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      {t("creBounty.claim")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publisher Tool */}
      <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
        <CreatorMissionPublisher />
      </div>
    </div>
  );
}

export default CreatorMissionsHub;
