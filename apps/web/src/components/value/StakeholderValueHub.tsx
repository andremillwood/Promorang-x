import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Store,
  Gem,
  Ticket,
  Building2,
  Users,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { GuestPerkSimulator } from "./GuestPerkSimulator";
import { MerchantRoiSimulator } from "./MerchantRoiSimulator";
import { CreatorEarningsSimulator } from "./CreatorEarningsSimulator";
import { HostSyndicateSimulator } from "./HostSyndicateSimulator";
import { BrandCampaignSimulator } from "./BrandCampaignSimulator";

export type StakeholderRole = "guest" | "merchant" | "creator" | "host" | "brand";

interface StakeholderTab {
  id: StakeholderRole;
  labelKey: TranslationKey;
  icon: React.ElementType;
  color: string;
  badgeKey: TranslationKey;
}

const TABS: StakeholderTab[] = [
  {
    id: "guest",
    labelKey: "valueHub.guest",
    icon: Sparkles,
    color: "amber",
    badgeKey: "valueHub.guestBadge",
  },
  {
    id: "merchant",
    labelKey: "valueHub.merchant",
    icon: Store,
    color: "emerald",
    badgeKey: "valueHub.merchantBadge",
  },
  {
    id: "creator",
    labelKey: "valueHub.creator",
    icon: Gem,
    color: "purple",
    badgeKey: "valueHub.creatorBadge",
  },
  {
    id: "host",
    labelKey: "valueHub.host",
    icon: Ticket,
    color: "cyan",
    badgeKey: "valueHub.hostBadge",
  },
  {
    id: "brand",
    labelKey: "valueHub.brand",
    icon: Building2,
    color: "blue",
    badgeKey: "valueHub.brandBadge",
  },
];

interface StakeholderValueHubProps {
  initialRole?: StakeholderRole;
  showHeroBanner?: boolean;
}

export const StakeholderValueHub: React.FC<StakeholderValueHubProps> = ({
  initialRole = "guest",
  showHeroBanner = true,
}) => {
  const { t } = useI18n();
  const [activeRole, setActiveRole] = useState<StakeholderRole>(initialRole);

  return (
    <section className="w-full py-12 md:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Section Header */}
        {showHeroBanner && (
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-white/15 text-white/90 text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-md">
              <Compass className="w-4 h-4 text-amber-400" />
              {t("valueHub.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {t("valueHub.title")}
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
              {t("valueHub.copy")}
            </p>
          </div>
        )}

        {/* Stakeholder Role Switcher Bar */}
        <div className="flex items-center justify-start md:justify-center overflow-x-auto pb-4 mb-8 gap-2.5 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveRole(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all shrink-0 text-left cursor-pointer ${
                  isActive
                    ? "bg-white/10 border-white/30 text-white shadow-2xl scale-[1.02]"
                    : "bg-zinc-900/60 border-white/5 text-white/60 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive
                      ? tab.id === "guest"
                        ? "bg-amber-500/20 text-amber-400"
                        : tab.id === "merchant"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : tab.id === "creator"
                        ? "bg-purple-500/20 text-purple-400"
                        : tab.id === "host"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "bg-blue-500/20 text-blue-400"
                      : "bg-white/5 text-white/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black tracking-tight">{t(tab.labelKey)}</div>
                  <div className="text-[10px] text-white/50">{t(tab.badgeKey)}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Simulator Container */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeRole === "guest" && <GuestPerkSimulator />}
              {activeRole === "merchant" && <MerchantRoiSimulator />}
              {activeRole === "creator" && <CreatorEarningsSimulator />}
              {activeRole === "host" && <HostSyndicateSimulator />}
              {activeRole === "brand" && <BrandCampaignSimulator />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
