import React from "react";
import { Link } from "react-router-dom";
import {
  Film,
  Plus,
  PlayCircle,
  Eye,
  Flame,
  Share2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";

interface StoryItem {
  id: string;
  title: string;
  platform: string;
  views: number;
  likes: number;
  conversions: number;
  thumbnail: string;
  momentTitle: string;
  bountyEarned: number;
  timestamp: string;
}

export function CreatorStudioConsole() {
  const { t, formatNumber } = useI18n();
  const stories: StoryItem[] = [
    {
      id: "story-1",
      title: "Kingston Coffee Meetup Single-Origin Tasting Reel",
      platform: "Instagram Reel",
      views: 18400,
      likes: 2150,
      conversions: 48,
      thumbnail: "/assets/moments/coffee-code.jpg",
      momentTitle: "Kingston Coffee & Code",
      bountyEarned: 150,
      timestamp: "2 days ago",
    },
    {
      id: "story-2",
      title: "Water Lane Mural Art & Cultural Rhythm Tour",
      platform: "TikTok",
      views: 32600,
      likes: 4890,
      conversions: 84,
      thumbnail: "/assets/moments/street-art.jpg",
      momentTitle: "Downtown Street Art Walk",
      bountyEarned: 220,
      timestamp: "4 days ago",
    },
    {
      id: "story-3",
      title: "Skyline Sunset Acoustics VIP Experience",
      platform: "Instagram Story",
      views: 9400,
      likes: 1200,
      conversions: 26,
      thumbnail: "/assets/moments/sunset-photo.jpg",
      momentTitle: "Sunset Acoustic Stage",
      bountyEarned: 95,
      timestamp: "1 week ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Studio Identity */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Film className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("creStudio.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-extrabold uppercase">
                {t("creStudio.published", { count: stories.length })}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("creStudio.subtitle")}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20"
        >
          <Link to="/content-share">
            <Plus className="h-4 w-4 mr-1.5" />
            {t("creStudio.submit")}
          </Link>
        </Button>
      </div>

      {/* 2. Media Stories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            className="rounded-3xl border border-white/10 bg-[#0e1015] overflow-hidden group hover:border-purple-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
          >
            {/* Thumbnail Header */}
            <div className="relative h-48 w-full overflow-hidden bg-black">
              <img
                src={story.thumbnail}
                alt={story.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1015] via-black/30 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                  {story.platform}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[10px]">
                  {story.timestamp}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold">
                    <Eye className="h-3.5 w-3.5 text-purple-400" />
                    {formatNumber(story.views)}
                  </span>
                  <span className="flex items-center gap-1 font-bold">
                    <Flame className="h-3.5 w-3.5 text-pink-400" />
                    {formatNumber(story.likes)}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                  {t("creStudio.footfalls", { count: story.conversions })}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition leading-tight line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-[11px] text-white/50 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-purple-400" />
                  {t("creStudio.linkedTo", { title: story.momentTitle })}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40">{t("creStudio.bountyEarned")}</p>
                  <p className="text-sm font-black text-emerald-400">${story.bountyEarned}.00</p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                >
                  <Link to={`/explore/content`}>
                    <span>{t("creStudio.viewLive")}</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreatorStudioConsole;
