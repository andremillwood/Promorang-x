import React, { useState } from "react";
import {
  Activity,
  Radio,
  Users,
  Sparkles,
  Zap,
  Flame,
  Clock,
  MapPin,
  Megaphone,
  CheckCircle2,
  Share2,
  Volume2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { HostPulseControlPanel } from "@/components/host/HostPulseControlPanel";

export function HostLivePulseConsole() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [announcementText, setAnnouncementText] = useState("");
  const [pulseActive, setPulseActive] = useState(true);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    toast({
      title: t("hostPulse.toastTitle"),
      description: t("hostPulse.toastBody", { count: 68, text: announcementText }),
    });
    setAnnouncementText("");
  };

  const sampleAttendees = [
    { name: "Andre M.", tier: "Scout L2", time: "3 mins ago", avatar: "☕" },
    { name: "Camille Watson", tier: "Explorer", time: "8 mins ago", avatar: "✨" },
    { name: "Marcus Chen", tier: "Scout L1", time: "14 mins ago", avatar: "🎨" },
    { name: "Sherise Bell", tier: "Creator Vanguard", time: "22 mins ago", avatar: "🔥" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Room Pulse */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Radio className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">{t("hostPulse.title")}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />
                {t("hostPulse.beacon")}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              {t("hostPulse.subtitle")}
            </p>
          </div>
        </div>

        {/* Live Attendance Pills */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-white/50">{t("hostPulse.checkedIn")}</p>
            <p className="text-base font-black text-amber-400">{t("hostPulse.guests", { count: 68 })}</p>
          </div>
          <div className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-center">
            <p className="text-[10px] uppercase font-bold text-white/50">{t("hostPulse.vibe")}</p>
            <p className="text-base font-black text-emerald-400">{t("hostPulse.vibeHigh")}</p>
          </div>
        </div>
      </div>

      {/* 2. Main Pulse Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stage Broadcast Transmitter (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">{t("hostPulse.broadcastTitle")}</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold uppercase">
                {t("hostPulse.pushBeacon")}
              </span>
            </div>

            <p className="text-xs text-white/60">
              {t("hostPulse.broadcastHint")}
            </p>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <Input
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder={t("hostPulse.announcePh")}
                className="h-12 rounded-2xl border-white/15 bg-white/5 text-white text-xs focus:border-amber-400"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex gap-2">
                  {[
                    { key: "tasting" as const, emoji: "🍹", label: t("hostPulse.tagTasting") },
                    { key: "set" as const, emoji: "🎵", label: t("hostPulse.tagSet") },
                    { key: "photo" as const, emoji: "📸", label: t("hostPulse.tagPhoto") },
                  ].map((tag) => (
                    <button
                      key={tag.key}
                      type="button"
                      onClick={() => setAnnouncementText(t("hostPulse.tagFill", { tag: `${tag.emoji} ${tag.label}` }))}
                      className="px-2.5 py-1 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white text-[11px] font-semibold transition"
                    >
                      {tag.emoji} {tag.label}
                    </button>
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={!announcementText.trim()}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-extrabold text-xs shadow-md"
                >
                  <Volume2 className="h-4 w-4 mr-1.5" />
                  {t("hostPulse.push")}
                </Button>
              </div>
            </form>
          </div>

          {/* Deep Pulse Controls */}
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-6 space-y-4 shadow-xl">
            <HostPulseControlPanel moments={[]} />
          </div>
        </div>

        {/* Right: Live Room Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">{t("hostPulse.attendees")}</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                {t("hostPulse.sync")}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {sampleAttendees.map((att, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-amber-400/30 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-sm">
                      {att.avatar}
                    </span>
                    <div>
                      <p className="font-bold text-xs text-white">{att.name}</p>
                      <p className="text-[10px] text-amber-300 font-medium">{att.tier}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/40">{att.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostLivePulseConsole;
