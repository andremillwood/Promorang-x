import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Share2,
  Video,
  MapPin,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Flame,
  Zap,
} from "lucide-react";
import { TactileValueReceipt, ValueReceiptData } from "./TactileValueReceipt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

type ScenarioKey = "promoshare" | "ugc_creator" | "irl_checkin" | "brand_bounty";

interface ScenarioConfig {
  key: ScenarioKey;
  tabKey: TranslationKey;
  tabIcon: React.ElementType;
  badgeKey: TranslationKey;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  defaultSliderValue: number;
  sliderKey: TranslationKey;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  calculateReceipt: (sliderVal: number) => ValueReceiptData;
  pipeline: {
    notice: TranslationKey;
    move: TranslationKey;
    prove: TranslationKey;
    keep: TranslationKey;
  };
}

const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  promoshare: {
    key: "promoshare",
    tabKey: "recStudio.psTab",
    tabIcon: Share2,
    badgeKey: "recStudio.psBadge",
    titleKey: "recStudio.psTitle",
    descKey: "recStudio.psDesc",
    defaultSliderValue: 12,
    sliderKey: "recStudio.psSlider",
    sliderMin: 6,
    sliderMax: 60,
    sliderStep: 2,
    calculateReceipt: (clicks) => {
      const reservations = Math.max(1, Math.round(clicks * 0.33));
      const arrivals = Math.max(1, Math.round(reservations * 0.75));
      const cashReward = arrivals * 8;
      const pointsReward = clicks * 15 + arrivals * 100;
      return {
        id: "rec_tia_joyride_01",
        receiptNumber: "REC-2026-T8812",
        actorHandle: "@tia",
        actionType: "share",
        actionTitle: "Distributed PromoShare RSVP Link",
        targetEntity: "Joyride Friday",
        timestamp: "Verified 2 hrs ago",
        status: "verified",
        verificationMethod: "Venue Gate QR Scan + Timestamp Verification",
        proofHash: "0x98f4e2b83a00c71e",
        metrics: [
          { label: "Link Visits", value: clicks },
          { label: "Reservations", value: reservations },
          { label: "Verified Arrivals", value: arrivals, highlight: true },
        ],
        hostQuote: "Tia brought unmatched energy to Warehouse 9. 3 verified door arrivals logged.",
        hostSigner: "Joyride Friday Curator & Host Team",
        rewards: [
          { type: "cash", label: "Direct Cash Payout", value: `$${cashReward}.00 USD` },
          { type: "points", label: "Contributor Points", value: `+${pointsReward} pts` },
          { type: "badge", label: "Status Unlock", value: "Verified Host Tier 1" },
        ],
      };
    },
    pipeline: {
      notice: "recStudio.psNotice",
      move: "recStudio.psMove",
      prove: "recStudio.psProve",
      keep: "recStudio.psKeep",
    },
  },
  ugc_creator: {
    key: "ugc_creator",
    tabKey: "recStudio.ugcTab",
    tabIcon: Video,
    badgeKey: "recStudio.ugcBadge",
    titleKey: "recStudio.ugcTitle",
    descKey: "recStudio.ugcDesc",
    defaultSliderValue: 8400,
    sliderKey: "recStudio.ugcSlider",
    sliderMin: 2000,
    sliderMax: 30000,
    sliderStep: 1000,
    calculateReceipt: (views) => {
      const redemptions = Math.max(2, Math.round(views / 600));
      const cash = redemptions * 12 + 50;
      return {
        id: "rec_marcus_sunset_ugc",
        receiptNumber: "REC-2026-M4409",
        actorHandle: "@marcus.creates",
        actionType: "ugc_clip",
        actionTitle: "Published IG Reel Review + Coupon Drop",
        targetEntity: "Sunset Cafe & Lounge",
        timestamp: "Verified Yesterday",
        status: "verified",
        verificationMethod: "POS Promo Code Match + Media Audit",
        proofHash: "0x17c98f2441da09ee",
        metrics: [
          { label: "Video Views", value: views > 999 ? `${(views / 1000).toFixed(1)}k` : views },
          { label: "Offers Claimed", value: Math.round(redemptions * 2.2) },
          { label: "POS Redemptions", value: redemptions, highlight: true },
        ],
        hostQuote: "Marcus's review brought 14 new brunch tables this weekend. Stellar contributor.",
        hostSigner: "Sunset Cafe General Manager",
        rewards: [
          { type: "cash", label: "Bounty Commission", value: `$${cash}.00 USD` },
          { type: "keys", label: "PromoKeys Earned", value: "+3 Master Keys" },
          { type: "perk", label: "Unlocked VIP", value: "Complimentary Tasting Pass" },
        ],
      };
    },
    pipeline: {
      notice: "recStudio.ugcNotice",
      move: "recStudio.ugcMove",
      prove: "recStudio.ugcProve",
      keep: "recStudio.ugcKeep",
    },
  },
  irl_checkin: {
    key: "irl_checkin",
    tabKey: "recStudio.irlTab",
    tabIcon: MapPin,
    badgeKey: "recStudio.irlBadge",
    titleKey: "recStudio.irlTitle",
    descKey: "recStudio.irlDesc",
    defaultSliderValue: 1,
    sliderKey: "recStudio.irlSlider",
    sliderMin: 1,
    sliderMax: 3,
    sliderStep: 1,
    calculateReceipt: (level) => {
      const points = level === 1 ? 250 : level === 2 ? 500 : 1000;
      return {
        id: "rec_elena_art_after_dark",
        receiptNumber: "REC-2026-E1204",
        actorHandle: "@elena.v",
        actionType: "checkin",
        actionTitle: "Verified Venue Check-in & Moment Capture",
        targetEntity: "Art After Dark Festival",
        timestamp: "Verified Today",
        status: "verified",
        verificationMethod: "GPS Geofence + Host NFC Beacon",
        proofHash: "0x77ae221190bc8814",
        metrics: [
          { label: "Check-in Status", value: "100%" },
          { label: "Proof Rating", value: level === 3 ? "Gold" : level === 2 ? "Silver" : "Verified" },
          { label: "Streak Boost", value: "+4 Days", highlight: true },
        ],
        hostQuote: "Verified on-site participation at Curator Showcase.",
        hostSigner: "Festival Director",
        rewards: [
          { type: "points", label: "Moment Points", value: `+${points} pts` },
          { type: "keys", label: "Vault Keys", value: "+1 Contributor Key" },
          { type: "badge", label: "Pass Unlocked", value: "Curator VIP Pass (Complimentary)" },
        ],
      };
    },
    pipeline: {
      notice: "recStudio.irlNotice",
      move: "recStudio.irlMove",
      prove: "recStudio.irlProve",
      keep: "recStudio.irlKeep",
    },
  },
  brand_bounty: {
    key: "brand_bounty",
    tabKey: "recStudio.brandTab",
    tabIcon: Building2,
    badgeKey: "recStudio.brandBadge",
    titleKey: "recStudio.brandTitle",
    descKey: "recStudio.brandDesc",
    defaultSliderValue: 45,
    sliderKey: "recStudio.brandSlider",
    sliderMin: 10,
    sliderMax: 100,
    sliderStep: 5,
    calculateReceipt: (arrivals) => {
      const revenue = arrivals * 35;
      const spent = arrivals * 8;
      return {
        id: "rec_bodega_bounty_settlement",
        receiptNumber: "REC-2026-B9021",
        actorHandle: "@bodegalounge",
        actionType: "bounty",
        actionTitle: "Funded Customer Arrival Settlement",
        targetEntity: "Bodega Community Bounty #4",
        timestamp: "Settled 30m ago",
        status: "completed",
        verificationMethod: "Cryptographic Receipt Escrow Settlement",
        proofHash: "0x44cd8892fa0192e1",
        metrics: [
          { label: "Verified Arrivals", value: arrivals, highlight: true },
          { label: "Est. Spend", value: `$${revenue.toLocaleString()}` },
          { label: "Bounty Payout", value: `$${spent}` },
        ],
        hostQuote: "45 verified physical customer arrivals recorded with zero ad waste.",
        hostSigner: "Bodega Operations Escrow",
        rewards: [
          { type: "cash", label: "Merchant Net ROI", value: `+${Math.round((revenue / (spent || 1)) * 100)}% ROI` },
          { type: "badge", label: "Community Stewards", value: "12 Creators Rewarded" },
          { type: "perk", label: "Audit Log", value: "45 Proof Receipts Filed" },
        ],
      };
    },
    pipeline: {
      notice: "recStudio.brandNotice",
      move: "recStudio.brandMove",
      prove: "recStudio.brandProve",
      keep: "recStudio.brandKeep",
    },
  },
};

export const InteractiveReceiptStudio: React.FC = () => {
  const { t, formatNumber } = useI18n();
  const [activeKey, setActiveKey] = useState<ScenarioKey>("promoshare");
  const [sliderValue, setSliderValue] = useState<number>(
    SCENARIOS.promoshare.defaultSliderValue
  );

  const scenario = SCENARIOS[activeKey];
  const receiptData = scenario.calculateReceipt(sliderValue);

  const handleTabChange = (key: ScenarioKey) => {
    setActiveKey(key);
    setSliderValue(SCENARIOS[key].defaultSliderValue);
  };

  return (
    <div className="w-full">
      {/* Scenario Selector Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
          const s = SCENARIOS[key];
          const Icon = s.tabIcon;
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105"
                  : "border border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(s.tabKey)}</span>
            </button>
          );
        })}
      </div>

      {/* 4-Step Pipeline Bar */}
      <div className="mb-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { num: "01", step: t("recStudio.notice"), text: t(scenario.pipeline.notice) },
          { num: "02", step: t("recStudio.move"), text: t(scenario.pipeline.move) },
          { num: "03", step: t("recStudio.prove"), text: t(scenario.pipeline.prove) },
          { num: "04", step: t("recStudio.keep"), text: t(scenario.pipeline.keep), highlight: true },
        ].map((item, idx) => (
          <div
            key={item.num}
            className={`relative bg-[#0c0c0f] p-5 transition-colors ${
              item.highlight ? "bg-gradient-to-br from-[#0c0c0f] to-primary/10" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black font-mono ${item.highlight ? "text-primary" : "text-white/40"}`}>
                {item.num}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{item.step}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/80">{item.text}</p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/40" />
          </div>
        ))}
      </div>

      {/* Main Interactive Stage: Left Story & Controls + Right Live Tactile Receipt */}
      <div className="grid items-center gap-8 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.14] via-black/60 to-black/90 p-6 md:p-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Context & Interactive Simulator Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge className="border-primary/40 bg-primary/15 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
              <Zap className="mr-1 h-3 w-3" /> {t(scenario.badgeKey)}
            </Badge>
            <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
              {t(scenario.titleKey)}
            </h3>
            <p className="text-sm leading-relaxed text-white/60 sm:text-base">
              {t(scenario.descKey)}
            </p>
          </div>

          {/* Dynamic Slider Control */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-white/80">
                <Sliders className="h-3.5 w-3.5 text-primary" /> {t(scenario.sliderKey)}
              </span>
              <span className="font-mono text-sm font-black text-primary">
                {formatNumber(sliderValue)}
              </span>
            </div>
            <input
              type="range"
              min={scenario.sliderMin}
              max={scenario.sliderMax}
              step={scenario.sliderStep}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-primary"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-white/30">
              <span>{t("recStudio.min", { count: formatNumber(scenario.sliderMin) })}</span>
              <span>{t("recStudio.drag")}</span>
              <span>{t("recStudio.max", { count: formatNumber(scenario.sliderMax) })}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={`/r/${receiptData.id}`}>
              <Button className="bg-primary text-xs font-black text-black hover:bg-primary/90">
                {t("recStudio.inspect")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/wallet">
              <Button variant="outline" className="border-white/15 bg-white/[0.03] text-xs font-bold text-white hover:bg-white/10">
                {t("recStudio.viewReceipts")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: High-Fidelity Tactile Value Receipt */}
        <div className="relative flex items-center justify-center">
          <TactileValueReceipt
            receipt={receiptData}
            onInspectProof={() => {
              window.location.href = `/r/${receiptData.id}`;
            }}
          />
        </div>
      </div>
    </div>
  );
};
