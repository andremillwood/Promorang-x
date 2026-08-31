import React, { useState } from "react";
import {
  Users,
  Video,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  Flame,
  Star,
  MessageSquare,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";

interface CreatorSubmission {
  id: string;
  creatorName: string;
  avatar: string;
  tier: string;
  mediaType: "reel" | "photo" | "tiktok";
  thumbnail: string;
  caption: string;
  views: number;
  likes: number;
  bountyEarned: number;
  status: "pending" | "approved";
}

export function BrandCreatorBureau() {
  const { t, formatNumber } = useI18n();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<CreatorSubmission[]>([
    {
      id: "sub-1",
      creatorName: "Kofi 'Vibes' Campbell",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      tier: "Lead Kingston Creator (L3)",
      mediaType: "reel",
      thumbnail: "/assets/moments/coffee-code.jpg",
      caption: "Tasting single-origin pour-overs at the Kingston Cafe meetup! @promorang #KingstonCoffee",
      views: 18400,
      likes: 2150,
      bountyEarned: 150,
      status: "pending",
    },
    {
      id: "sub-2",
      creatorName: "Aaliyah Brooks",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      tier: "Art & Culture Vanguard",
      mediaType: "reel",
      thumbnail: "/assets/moments/street-art.jpg",
      caption: "Water Lane street mural walk with the creative community! Best vibe in town 🔥",
      views: 24200,
      likes: 3890,
      bountyEarned: 200,
      status: "approved",
    },
    {
      id: "sub-3",
      creatorName: "Tariq Edwards",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      tier: "Sound & Stage Scout",
      mediaType: "photo",
      thumbnail: "/assets/moments/sunset-photo.jpg",
      caption: "Golden hour acoustic session on Skyline Drive. Check in with Promorang to unlock backstage pass!",
      views: 11200,
      likes: 1420,
      bountyEarned: 100,
      status: "approved",
    },
  ]);

  const handleApprove = (id: string, name: string, bounty: number) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: "approved" } : sub))
    );
    toast({
      title: t("creBureau.toastOk"),
      description: t("creBureau.toastOkBody", { bounty, name }),
    });
  };

  const handleCreateBounty = () => {
    toast({
      title: t("creBureau.toastNew"),
      description: t("creBureau.toastNewBody"),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Creator Bureau HUD */}
      <div className="p-6 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 shrink-0">
            <Users className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("creBureau.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-extrabold uppercase">
                {t("creBureau.badge", { count: 32 })}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("creBureau.copy")}
            </p>
          </div>
        </div>

        <Button
          onClick={handleCreateBounty}
          className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(255,106,0,0.35)]"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("creBureau.dispatch")}
        </Button>
      </div>

      {/* 2. Submissions Grid & Review Station */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.map((sub) => {
          const isPending = sub.status === "pending";

          return (
            <div
              key={sub.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl ${
                isPending
                  ? "border-amber-500/40 bg-[#161208]"
                  : "border-white/10 bg-[#0e1015]"
              }`}
            >
              {/* Creator Profile Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={sub.avatar}
                    alt={sub.creatorName}
                    className="h-10 w-10 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{sub.creatorName}</h4>
                    <p className="text-[11px] text-primary font-semibold">{sub.tier}</p>
                  </div>
                </div>

                <Badge
                  className={`text-[10px] font-black uppercase ${
                    isPending ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                  }`}
                >
                  {isPending ? t("creBureau.needsReview") : t("creBureau.approved")}
                </Badge>
              </div>

              {/* Media Thumbnail & Meta */}
              <div className="relative rounded-2xl overflow-hidden h-48 bg-black border border-white/5">
                <img
                  src={sub.thumbnail}
                  alt={t("creBureau.ugcAlt")}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      {formatNumber(sub.views)}
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      {formatNumber(sub.likes)}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono uppercase">
                    {sub.mediaType}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <p className="text-xs text-white/70 italic line-clamp-2">
                "{sub.caption}"
              </p>

              {/* Bounty Reward & Action */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40">{t("creBureau.payout")}</p>
                  <p className="text-sm font-black text-emerald-400">${sub.bountyEarned}.00</p>
                </div>

                {isPending ? (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(sub.id, sub.creatorName, sub.bountyEarned)}
                    className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs shadow-md"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    {t("creBureau.approve")}
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("creBureau.paid")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrandCreatorBureau;
