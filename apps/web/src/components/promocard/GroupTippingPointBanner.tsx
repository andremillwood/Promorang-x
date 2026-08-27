import React, { useState } from "react";
import {
  Users,
  Flame,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PromoCardService, GroupTippingDrop } from "@/lib/promocard";

export const GroupTippingPointBanner: React.FC = () => {
  const { toast } = useToast();
  const [drops, setDrops] = useState<GroupTippingDrop[]>(PromoCardService.getGroupDrops());

  const handleJoinDrop = (drop: GroupTippingDrop) => {
    const result = PromoCardService.joinGroupDrop(drop.id);
    if (result.success) {
      setDrops(PromoCardService.getGroupDrops());
      toast({
        title: result.drop.isUnlocked ? "🎉 Tipping Point Reached! Perk Unlocked!" : "✨ You Joined the Group Drop!",
        description: result.drop.isUnlocked
          ? `All ${result.drop.targetParticipants} participants just received $${result.drop.unlockedPerkAmount} on their Promorang Card!`
          : `${result.drop.targetParticipants - result.drop.currentParticipants} more claims needed to unlock $${result.drop.unlockedPerkAmount} off.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 text-[10px] uppercase">
              Groupon-Style Collective Drops
            </Badge>
            <span className="text-xs text-zinc-400 font-medium">Tipping Point Engine</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-amber-400 fill-amber-400" />
            Group Unlock Drops (Tipping Points)
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drops.map((drop) => {
          const progressPercent = Math.min(100, Math.round((drop.currentParticipants / drop.targetParticipants) * 100));
          const spotsNeeded = Math.max(0, drop.targetParticipants - drop.currentParticipants);

          return (
            <div
              key={drop.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                drop.isUnlocked
                  ? "bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-950 border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-zinc-400 font-medium">{drop.merchantName}</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {drop.expiresInHours}h left
                </span>
              </div>

              <h4 className="font-bold text-white text-base leading-snug mb-3">
                {drop.headline}
              </h4>

              {/* Progress toward Tipping Point */}
              <div className="space-y-1.5 my-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-amber-400" />
                    {drop.currentParticipants} / {drop.targetParticipants} joined
                  </span>
                  <span className={`font-bold ${drop.isUnlocked ? "text-emerald-400" : "text-amber-400"}`}>
                    {drop.isUnlocked ? "TIPPING POINT MET!" : `${spotsNeeded} spots to trigger`}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-zinc-800" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-xs">
                  <span className="text-zinc-400 block">Reward</span>
                  <span className="text-emerald-400 font-bold">${drop.unlockedPerkAmount} Off (Orders ${drop.minSpend}+)</span>
                </div>

                <Button
                  size="sm"
                  disabled={drop.userJoined}
                  onClick={() => handleJoinDrop(drop)}
                  className={`text-xs font-bold rounded-xl h-9 px-4 ${
                    drop.userJoined
                      ? "bg-zinc-800 text-zinc-400"
                      : drop.isUnlocked
                      ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                      : "bg-amber-500 hover:bg-amber-600 text-black"
                  }`}
                >
                  {drop.userJoined ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Joined
                    </span>
                  ) : drop.isUnlocked ? (
                    <span className="flex items-center gap-1">
                      <Unlock className="h-3.5 w-3.5" /> Claim Perk
                    </span>
                  ) : (
                    "Join Group Drop"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
