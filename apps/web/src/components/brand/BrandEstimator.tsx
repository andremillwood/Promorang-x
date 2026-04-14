import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Zap, Users, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  { name: "Seeker", multiplier: 1, baseCost: 5, reach: 50 },
  { name: "Herald", multiplier: 1.25, baseCost: 8, reach: 500 },
  { name: "Luminary", multiplier: 1.5, baseCost: 15, reach: 5000 },
  { name: "Eminence", multiplier: 2.0, baseCost: 40, reach: 50000 },
];

export const BrandEstimator = () => {
  const [targetActions, setTargetActions] = useState(50);
  const [selectedTier, setSelectedTier] = useState(1); // Default to Herald
  const [includeFee, setIncludeFee] = useState(true);

  const tier = TIERS[selectedTier];
  const platformFeeRate = 0.15;
  
  const subtotal = targetActions * tier.baseCost;
  const platformFee = includeFee ? subtotal * platformFeeRate : 0;
  const totalFunding = subtotal + platformFee;
  const totalReach = targetActions * tier.reach;
  const cpva = totalFunding / targetActions;

  return (
    <section className="py-24 bg-background relative border-y border-border/40 overflow-hidden">
      <div className="container px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
              <Calculator className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Outcome Estimator</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 italic">
              Project Your <span className="text-primary">Impact.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sponsorship is no longer a guessing game. Estimate your funding reservoir 
              based on the number of verified stories you want to trigger and the prestige 
              of the storytellers you want to attract.
            </p>
            
            <div className="space-y-8">
              {/* Target Actions Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    Target Verified Stories
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </label>
                  <span className="text-2xl font-serif font-bold text-primary italic">{targetActions}</span>
                </div>
                <Slider 
                  value={[targetActions]} 
                  onValueChange={(val) => setTargetActions(val[0])} 
                  max={500} 
                  min={10} 
                  step={10}
                  className="py-4"
                />
              </div>

              {/* Tier Selection */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-foreground">Target Participant Standing</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TIERS.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTier(i)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedTier === i 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${selectedTier === i ? "text-primary" : "text-muted-foreground"}`}>
                        {t.name}
                      </p>
                      <p className="text-xs font-bold text-foreground">{t.multiplier}x Multiplier</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl" />
            <motion.div 
              layout
              className="relative bg-charcoal rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                <h4 className="text-white font-serif text-xl italic">Funding Reservoir</h4>
                <div className="text-right">
                  <p className="text-primary text-3xl font-serif font-bold italic">
                    ${totalFunding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Est. Requirement</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">CPV (Cost Per Verification)</span>
                  </div>
                  <p className="text-white text-xl font-bold">${cpva.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Est. Echo Reach</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={totalReach}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary text-xl font-bold"
                    >
                      {totalReach.toLocaleString()}+
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Verified Reward Allocation</span>
                  <span className="text-white font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Network Transparency Fee (15%)</span>
                  <span className="text-primary font-medium">${platformFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-10">
                <Button variant="hero" className="w-full" size="xl">
                  Initialize This Reservoir
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-center text-[10px] text-white/20 mt-4 uppercase font-black tracking-widest">
                  Funds stay in escrow until verification is complete
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
