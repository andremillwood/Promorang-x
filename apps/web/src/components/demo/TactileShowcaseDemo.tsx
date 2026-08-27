import React, { useState } from "react";
import { TactileButton } from "@/components/ui/TactileButton";
import { StreakPulseBadge } from "@/components/ui/StreakPulseBadge";
import { MilestoneTrail, MilestoneNode } from "@/components/ui/MilestoneTrail";
import { LivingSceneAuraCard } from "@/components/ui/LivingSceneAuraCard";
import { ProofStampCard } from "@/components/ui/ProofStampCard";
import { NextMoveRadarDock, NextMoveData } from "@/components/ui/NextMoveRadarDock";
import { VaultCrackingModal } from "@/components/ui/VaultCrackingModal";
import { RewardCelebration } from "@/components/ui/RewardCelebration";
import { Sparkles, Gem, Play } from "lucide-react";

export function TactileShowcaseDemo() {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [streak, setStreak] = useState(4);

  const sampleNodes: MilestoneNode[] = [
    { id: "1", title: "Join Scene", rewardText: "10 Gems", status: "completed" },
    { id: "2", title: "Check-in Live", rewardText: "25 Gems", status: "completed" },
    { id: "3", title: "Share Drop", rewardText: "50 Gems", status: "available" },
    { id: "4", title: "VIP Vault", rewardText: "Mystery Chest", status: "locked", type: "chest" },
  ];

  const currentMoveData: NextMoveData = {
    id: "move-1",
    type: "claim_boost",
    title: "Weekend 3x Gem Multiplier",
    subtitle: "Active for Kingston Dub Club drop until midnight",
    rewardPill: "3x Active",
    actionLabel: "Claim Now",
    onAction: () => setIsVaultOpen(true),
  };

  return (
    <div className="min-h-screen bg-[#0D0D0E] text-white p-6 sm:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-orange-400">
              <Sparkles className="size-3.5" /> Promorang Interactive Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
              Tactile & Novel UI Playground
            </h1>
          </div>
          <StreakPulseBadge
            streakCount={streak}
            multiplier="2.5x"
            onClick={() => setStreak((s) => s + 1)}
          />
        </div>

        {/* Section 1: Tactile Button System */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white/90">1. Extruded Tactile Buttons (Zero Latency Haptic Sound)</h2>
          <div className="flex flex-wrap items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/10">
            <TactileButton variant="primary" size="default">
              Primary Orange
            </TactileButton>
            <TactileButton variant="vault" size="default" onClick={() => setIsVaultOpen(true)}>
              <Gem className="size-4" /> Crack Vault
            </TactileButton>
            <TactileButton variant="success" size="default">
              Check In Verified
            </TactileButton>
            <TactileButton variant="cyber" size="default">
              Live Stream Drop
            </TactileButton>
            <TactileButton variant="obsidian" size="default">
              Obsidian Glass
            </TactileButton>
          </div>
        </div>

        {/* Section 2: Cards & Visual Heatmap */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white/90">2. Living Scene Aura & Proof Memory Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LivingSceneAuraCard
              title="Kingston Dub Club: Vinyl Night"
              location="Skyline Drive, Kingston"
              imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60"
              checkInCount={142}
              energyLevel="peak"
              perkText="3x Boost Active"
              onJoin={() => setIsCelebrationOpen(true)}
            />
            <ProofStampCard
              momentTitle="Midnight Reggae Check-In"
              sceneName="Kingston Dub Scene"
              verifiedAt="Verified 12m ago"
              gemsEarned={75}
              isVerified={true}
              mediaUrl="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60"
            />
          </div>
        </div>

        {/* Section 3: Gamified Milestone Trail */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white/90">3. Gamified Milestone Trail</h2>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <MilestoneTrail
              nodes={sampleNodes}
              onNodeClick={(node) => {
                if (node.status === "available") {
                  setIsVaultOpen(true);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Next Move Radar Dock */}
      <NextMoveRadarDock currentMove={currentMoveData} />

      {/* Interactive Modals */}
      <VaultCrackingModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        gemsReward={50}
      />

      <RewardCelebration
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        gemsEarned={75}
      />
    </div>
  );
}
