import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Zap, ShieldCheck, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/i18n/I18nContext";

const TIERS = [
  { nameKey: "brandEst.tier.seeker" as const, multiplier: 1, baseCost: 5, reach: 50 },
  { nameKey: "brandEst.tier.herald" as const, multiplier: 1.25, baseCost: 8, reach: 500 },
  { nameKey: "brandEst.tier.luminary" as const, multiplier: 1.5, baseCost: 15, reach: 5000 },
  { nameKey: "brandEst.tier.eminence" as const, multiplier: 2.0, baseCost: 40, reach: 50000 },
];

export const BrandEstimator = () => {
  const { t, formatNumber } = useI18n();
  const [targetActions, setTargetActions] = useState(50);
  const [selectedTier, setSelectedTier] = useState(1); // Default to Herald

  const tier = TIERS[selectedTier];
  const platformFeeRate = 0.15;
  
  const subtotal = targetActions * tier.baseCost;
  const platformFee = subtotal * platformFeeRate;
  const totalFunding = subtotal + platformFee;
  const totalReach = targetActions * tier.reach;
  const cpva = totalFunding / targetActions;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
              <Calculator className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("brandEst.badge")}</span>
            </div>
            <h2 className="mb-6 font-serif text-4xl font-semibold leading-[.98] tracking-[-.04em] md:text-5xl">
              {t("brandEst.title")}
            </h2>
            <p className="mb-8 text-base leading-7 text-muted-foreground">
              {t("brandEst.copy")}
            </p>
            
            <div className="space-y-8">
              {/* Target Actions Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    {t("brandEst.actions")}
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
                <label className="text-sm font-bold text-foreground">{t("brandEst.level")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TIERS.map((tierOpt, i) => (
                    <button
                      key={tierOpt.nameKey}
                      onClick={() => setSelectedTier(i)}
                      className={`p-3 rounded-xl border text-left transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                        selectedTier === i 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className={`text-[10px] font-black uppercase tracking-tighter mb-1 ${selectedTier === i ? "text-primary" : "text-muted-foreground"}`}>
                        {t(tierOpt.nameKey)}
                      </p>
                      <p className="text-xs font-bold text-foreground">{t("brandEst.gemsPer", { count: tierOpt.baseCost })}</p>
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
                <h4 className="font-serif text-xl text-white">{t("brandEst.reserve")}</h4>
                <div className="text-right">
                  <p className="text-primary text-3xl font-serif font-bold italic">
                    {t("brandEst.gemsAmt", { count: formatNumber(totalFunding, { maximumFractionDigits: 0 }) })}
                  </p>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{t("brandEst.usdVal", { amount: formatNumber(totalFunding, { maximumFractionDigits: 0 }) })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("brandEst.perAction")}</span>
                  </div>
                  <p className="text-white text-xl font-bold">{t("brandEst.gemsAmt", { count: cpva.toFixed(2) })}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("brandEst.reach")}</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={totalReach}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary text-xl font-bold"
                    >
                      {formatNumber(totalReach)}+
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">{t("brandEst.partValue")}</span>
                  <span className="text-white font-medium">{t("brandEst.gemsAmt", { count: formatNumber(subtotal) })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">{t("brandEst.fee")}</span>
                  <span className="text-primary font-medium">{t("brandEst.gemsAmt", { count: formatNumber(platformFee) })}</span>
                </div>
              </div>

              <div className="mt-10">
                <Button variant="hero" className="w-full" size="xl">
                  {t("brandEst.continue")}
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-center text-[10px] text-white/20 mt-4 uppercase font-black tracking-widest">
                  {t("brandEst.disclaimer")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
