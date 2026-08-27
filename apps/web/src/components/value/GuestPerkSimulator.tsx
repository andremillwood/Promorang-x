import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  KeyRound,
  QrCode,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Gift,
  Flame,
  RotateCw,
  Share2,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PerkPreset {
  id: string;
  category: string;
  title: string;
  venue: string;
  location: string;
  valueString: string;
  secretDescription: string;
  badge: string;
  code: string;
}

const PRESETS: PerkPreset[] = [
  {
    id: "perk-1",
    category: "Secret Tasting Key",
    title: "Signature Smoked Old Fashioned + Chef Canape",
    venue: "The Obsidian Lounge",
    location: "Kingston Arts District",
    valueString: "$38 Compliments of Venue",
    secretDescription: "Show this obsidian key to your bartender before ordering to unlock off-menu pairings.",
    badge: "VIP TASTING KEY",
    code: "OBSIDIAN-9821-VIP",
  },
  {
    id: "perk-2",
    category: "All-Access Pass",
    title: "Backstage Green Room Access + Line-Skip",
    venue: "Neon Garden Soundstage",
    location: "Downtown Cultural Strip",
    valueString: "Priceless VIP Privilege",
    secretDescription: "Direct entry at the west VIP door. Includes 2 complimentary craft cocktails.",
    badge: "PRODUCER PASS",
    code: "NEON-PASS-4412",
  },
  {
    id: "perk-3",
    category: "Culinary Vault",
    title: "Omakase Reserve Priority Table + Welcome Truffle Sake",
    venue: "Kura Modern Japanese",
    location: "Harbor Promenade",
    valueString: "$45 Member Value",
    secretDescription: "Exclusive 15-minute hold on peak weekend tables with complimentary ceremonial sake toast.",
    badge: "MEMBER PERK",
    code: "KURA-GOLD-7731",
  },
];

export const GuestPerkSimulator: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<PerkPreset>(PRESETS[0]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedPreset.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full rounded-3xl bg-zinc-950/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Zero-Signup Experience
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Interactive VIP Perk Simulator
          </h3>
          <p className="text-sm text-white/60 mt-1 max-w-xl">
            Experience how luxury member privileges feel in hand at the register or door. Never coupons—always high status.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPreset(preset);
                setIsUnlocked(false);
                setIsFlipped(false);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                selectedPreset.id === preset.id
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/10"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {preset.venue}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Pass Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Pass Visualizer Card (Left 6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm">
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full aspect-[1/1.4] rounded-3xl p-6 shadow-2xl border cursor-pointer select-none"
              style={{
                background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
                borderColor: isUnlocked ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.15)",
                boxShadow: isUnlocked
                  ? "0 25px 50px -12px rgba(245, 158, 11, 0.25)"
                  : "0 20px 40px -15px rgba(0,0,0,0.7)",
              }}
              onClick={() => isUnlocked && setIsFlipped(!isFlipped)}
            >
              {/* FRONT OF PASS */}
              {!isFlipped && (
                <div className="h-full flex flex-col justify-between relative z-10">
                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold uppercase tracking-widest text-[10px] px-2.5 py-1"
                    >
                      {selectedPreset.badge}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      VERIFIED PASS
                    </div>
                  </div>

                  {/* Pass Body */}
                  <div className="my-auto py-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
                      {selectedPreset.venue} • {selectedPreset.location}
                    </div>
                    <h4 className="text-xl font-black text-white leading-snug mb-3">
                      {selectedPreset.title}
                    </h4>
                    <div className="inline-block px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-amber-300 font-black text-sm">
                      {selectedPreset.valueString}
                    </div>
                  </div>

                  {/* Bottom / Unlock State */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Status</div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                        {isUnlocked ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400">UNLOCKED IN SIMULATOR</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-amber-400">READY TO REVEAL</span>
                          </>
                        )}
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="flex items-center gap-1 text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded-md">
                        <RotateCw className="w-3 h-3" /> Tap to flip QR
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BACK OF PASS (QR & SECRET REDEMPTION) */}
              {isFlipped && (
                <div
                  className="h-full flex flex-col justify-between relative z-10 [transform:rotateY(180deg)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                      Redemption Terminal
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/60 bg-white/5 px-2 py-1 rounded-md">
                      <RotateCw className="w-3 h-3" /> Flip back
                    </div>
                  </div>

                  {/* QR Simulator */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl my-auto text-center shadow-lg">
                    <QrCode className="w-28 h-28 text-gray-950 mb-1" />
                    <div className="text-[10px] font-mono font-bold text-gray-800 tracking-wider">
                      {selectedPreset.code}
                    </div>
                  </div>

                  {/* Secret Instruction */}
                  <div className="text-center">
                    <p className="text-[11px] text-white/70 leading-relaxed italic">
                      "{selectedPreset.secretDescription}"
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Interactive Controls & Experience Details (Right 6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-white">
              Instant Dignity & High-Status Redemptions
            </h4>
            <p className="text-sm text-white/70 leading-relaxed">
              When guests redeem at the register or door, they never present a coupon or plead for a discount. Promorang passes render like luxury obsidian black-cards with high-contrast typography, haptics, and instant proof of status.
            </p>
          </div>

          {/* Interactive Actions */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-white/80">
              <span>Interactive Step-Through</span>
              <span className="text-amber-400">Zero Signup Required</span>
            </div>

            {!isUnlocked ? (
              <Button
                onClick={handleUnlock}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Unlock className="w-4 h-4" />
                Tap to Reveal Secret Pass Details
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => setIsFlipped(!isFlipped)}
                  variant="outline"
                  className="w-full h-11 border-white/20 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  {isFlipped ? "View Pass Front" : "Flip Pass to View QR Code"}
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  className="w-full h-9 text-white/60 hover:text-white text-xs flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3 h-3" />
                  {copiedCode ? "Secret Key Copied!" : "Copy Test Secret Key"}
                </Button>
              </div>
            )}
          </div>

          {/* Soft-Gate Intent Callout */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-white/60">
              Ready to find live secret keys in your city?
            </div>
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black text-xs h-10 px-5 shadow-lg shadow-emerald-500/20"
            >
              <Link to={`/discover?perkPreview=${encodeURIComponent(selectedPreset.title)}`}>
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Save to My Free Wallet
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
