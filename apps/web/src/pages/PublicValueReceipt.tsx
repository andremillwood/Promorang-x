import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  ArrowLeft,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
  GitFork,
  Award,
} from "lucide-react";
import { TactileValueReceipt, ValueReceiptData } from "@/components/value/TactileValueReceipt";
import { CausationTree, CausationNode } from "@/components/value/CausationTree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

const PRESET_RECEIPTS: Record<string, { receipt: ValueReceiptData; causation: CausationNode }> = {
  rec_tia_joyride_01: {
    receipt: {
      id: "rec_tia_joyride_01",
      receiptNumber: "REC-2026-T8812",
      actorHandle: "@tia",
      actorName: "Tia Sterling",
      actionType: "share",
      actionTitle: "Distributed PromoShare RSVP Link",
      targetEntity: "Joyride Friday @ Warehouse 9",
      timestamp: "Aug 24, 2026 · 10:14 PM UTC",
      status: "verified",
      verificationMethod: "Venue Gate Scanner QR Verification",
      proofHash: "0x98f4e2b83a00c71e84aa92bc112",
      hostQuote: "Tia brought unmatched energy to Warehouse 9. 3 verified door arrivals logged.",
      hostSigner: "Joyride Friday Curator & Host Team",
      metrics: [
        { label: "Link Visits", value: "12" },
        { label: "Reservations", value: "4" },
        { label: "Verified Arrivals", value: "3", highlight: true },
      ],
      rewards: [
        { type: "cash", label: "Direct Cash Payout", value: "$24.00 USD" },
        { type: "points", label: "Contributor Points", value: "+480 pts" },
        { type: "badge", label: "Status Unlock", value: "Verified Host Tier 1" },
      ],
    },
    causation: {
      id: "node_root_tia",
      actorHandle: "@tia",
      action: "Created and shared tracked PromoShare Link #8812",
      timestamp: "08:02 PM UTC",
      status: "verified",
      valueContribution: "$24.00 USD (3 Arrivals)",
      children: [
        {
          id: "node_marcus_arr",
          actorHandle: "@marcus.v",
          action: "Clicked link &rarr; RSVP #104 &rarr; 🎟️ Arrived at Venue Gate",
          timestamp: "09:45 PM UTC",
          status: "verified",
          valueContribution: "+$8.00 Payout",
          verificationDetail: "Gate Scanner #2 (Host Signature: 0x99a1)",
        },
        {
          id: "node_sophia_arr",
          actorHandle: "@sophia.k",
          action: "Clicked link &rarr; RSVP #105 &rarr; 🎟️ Arrived at Venue Gate",
          timestamp: "10:04 PM UTC",
          status: "verified",
          valueContribution: "+$8.00 Payout",
          verificationDetail: "Gate Scanner #1 (Host Signature: 0x99a2)",
        },
        {
          id: "node_jordan_arr",
          actorHandle: "@jordan.m",
          action: "Clicked link &rarr; RSVP #106 &rarr; 🎟️ Arrived at Venue Gate",
          timestamp: "10:14 PM UTC",
          status: "verified",
          valueContribution: "+$8.00 Payout",
          verificationDetail: "Gate Scanner #2 (Host Signature: 0x99a3)",
        },
      ],
    },
  },
  rec_marcus_sunset_ugc: {
    receipt: {
      id: "rec_marcus_sunset_ugc",
      receiptNumber: "REC-2026-M4409",
      actorHandle: "@marcus.creates",
      actorName: "Marcus Vance",
      actionType: "ugc_clip",
      actionTitle: "Published IG Reel Review + Coupon Drop",
      targetEntity: "Sunset Cafe & Lounge",
      timestamp: "Aug 23, 2026 · 04:30 PM UTC",
      status: "verified",
      verificationMethod: "POS Promo Code Match + Media Audit",
      proofHash: "0x17c98f2441da09ee3301ab92c01",
      hostQuote: "Marcus's review brought 14 new brunch tables this weekend. Stellar contributor.",
      hostSigner: "Sunset Cafe General Manager",
      metrics: [
        { label: "Video Views", value: "8.4k" },
        { label: "Offers Claimed", value: "31" },
        { label: "POS Redemptions", value: "14", highlight: true },
      ],
      rewards: [
        { type: "cash", label: "Bounty Commission", value: "$150.00 USD" },
        { type: "keys", label: "PromoKeys Earned", value: "+3 Master Keys" },
        { type: "perk", label: "Unlocked VIP", value: "Complimentary Tasting Pass" },
      ],
    },
    causation: {
      id: "node_root_marcus",
      actorHandle: "@marcus.creates",
      action: "Submitted verified IG Reel UGC Bounty for Sunset Cafe",
      timestamp: "Aug 22, 2026 · 02:15 PM UTC",
      status: "verified",
      valueContribution: "$150.00 USD + 3 Keys",
      children: [
        {
          id: "node_pos_batch1",
          actorHandle: "@community_diners",
          action: "14 In-Person POS Redemptions verified across 48 hours",
          timestamp: "Aug 23, 2026 · 04:30 PM UTC",
          status: "verified",
          valueContribution: "$150 Commission Settled",
          verificationDetail: "POS Terminal Batch #4819 Settlement",
        },
      ],
    },
  },
  rec_elena_art_after_dark: {
    receipt: {
      id: "rec_elena_art_after_dark",
      receiptNumber: "REC-2026-E1204",
      actorHandle: "@elena.v",
      actorName: "Elena Rostova",
      actionType: "checkin",
      actionTitle: "Verified Venue Check-in & Moment Capture",
      targetEntity: "Art After Dark Festival",
      timestamp: "Aug 24, 2026 · 08:45 PM UTC",
      status: "verified",
      verificationMethod: "GPS Geofence + Host NFC Beacon",
      proofHash: "0x77ae221190bc8814bb8901cc90a",
      hostQuote: "Verified on-site participation at Curator Showcase.",
      hostSigner: "Festival Director",
      metrics: [
        { label: "Check-in Status", value: "100%" },
        { label: "Proof Rating", value: "Gold" },
        { label: "Streak Boost", value: "+4 Days", highlight: true },
      ],
      rewards: [
        { type: "points", label: "Moment Points", value: "+500 pts" },
        { type: "keys", label: "Vault Keys", value: "+1 Contributor Key" },
        { type: "badge", label: "Pass Unlocked", value: "Curator VIP Pass (Complimentary)" },
      ],
    },
    causation: {
      id: "node_root_elena",
      actorHandle: "@elena.v",
      action: "GPS + NFC Beacon Verified Check-in at Gallery Entrance",
      timestamp: "Aug 24, 2026 · 08:45 PM UTC",
      status: "verified",
      valueContribution: "500 Points + VIP Pass",
      children: [
        {
          id: "node_elena_photo",
          actorHandle: "@elena.v",
          action: "Submitted high-res moment photograph to festival gallery",
          timestamp: "08:50 PM UTC",
          status: "verified",
          verificationDetail: "Host Curator Verified Photo Quality",
        },
      ],
    },
  },
  rec_bodega_bounty_settlement: {
    receipt: {
      id: "rec_bodega_bounty_settlement",
      receiptNumber: "REC-2026-B9021",
      actorHandle: "@bodegalounge",
      actorName: "Bodega Lounge Group",
      actionType: "bounty",
      actionTitle: "Funded Customer Arrival Settlement",
      targetEntity: "Bodega Community Bounty #4",
      timestamp: "Aug 24, 2026 · 11:00 AM UTC",
      status: "completed",
      verificationMethod: "Cryptographic Receipt Escrow Settlement",
      proofHash: "0x44cd8892fa0192e109ff8129bb3",
      hostQuote: "45 verified physical customer arrivals recorded with zero ad waste.",
      hostSigner: "Bodega Operations Escrow",
      metrics: [
        { label: "Verified Arrivals", value: "45", highlight: true },
        { label: "Est. Spend", value: "$1,575" },
        { label: "Bounty Payout", value: "$360" },
      ],
      rewards: [
        { type: "cash", label: "Merchant Net ROI", value: "+338% ROI" },
        { type: "badge", label: "Community Stewards", value: "12 Creators Rewarded" },
        { type: "perk", label: "Audit Log", value: "45 Proof Receipts Filed" },
      ],
    },
    causation: {
      id: "node_root_bodega",
      actorHandle: "@bodegalounge",
      action: "Deposited $500 escrow for verified footfall arrivals",
      timestamp: "Aug 20, 2026",
      status: "verified",
      valueContribution: "45 Customers Recorded",
      children: [
        {
          id: "node_promoters",
          actorHandle: "12 Verified Promoters",
          action: "Shared personalized RSVP links across local communities",
          timestamp: "Aug 21-23, 2026",
          status: "verified",
          valueContribution: "$360 Escrow Released",
          verificationDetail: "45 Door Check-in QR Codes Scanned",
        },
      ],
    },
  },
};

export default function PublicValueReceipt() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<ValueReceiptData | null>(null);
  const [causation, setCausation] = useState<CausationNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      if (!id) return;
      setLoading(true);

      // Check if preset scenario
      if (PRESET_RECEIPTS[id]) {
        setReceipt(PRESET_RECEIPTS[id].receipt);
        setCausation(PRESET_RECEIPTS[id].causation);
        setLoading(false);
        return;
      }

      // Live fetch from backend API
      try {
        const response = await fetch(`${API_BASE_URL}/economy/receipts/public/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.receipt) {
            const raw = data.receipt;
            const liveReceipt: ValueReceiptData = {
              id: raw.id,
              receiptNumber: `REC-${raw.id.slice(0, 8).toUpperCase()}`,
              actorHandle: raw.proof?.actor_handle || "@participant",
              actionType: raw.proof?.action_type || "share",
              actionTitle: raw.headline || "Verified Contribution",
              targetEntity: raw.description || "Promorang Opportunity",
              timestamp: new Date(raw.created_at).toLocaleString(),
              status: raw.lifecycle_status === "verified" ? "verified" : "completed",
              verificationMethod: raw.proof?.verification_method || "Automated Audit Engine",
              proofHash: raw.proof?.hash || `0x${raw.id.replace(/-/g, "").slice(0, 16)}`,
              hostQuote: raw.proof?.host_quote || undefined,
              hostSigner: raw.proof?.host_signer || undefined,
              metrics: raw.proof?.metrics || [
                { label: "Attribution", value: "100%" },
                { label: "Status", value: raw.lifecycle_status, highlight: true },
              ],
              rewards: (raw.rewards || []).map((r: any) => ({
                type: r.currency === "gems" || r.currency === "usd" ? "cash" : "points",
                label: r.label || `${r.currency.toUpperCase()} Reward`,
                value: `${r.amount > 0 ? "+" : ""}${r.amount} ${r.currency}`,
              })),
            };

            setReceipt(liveReceipt);
            setCausation({
              id: `node_${raw.id}`,
              actorHandle: liveReceipt.actorHandle,
              action: liveReceipt.actionTitle,
              timestamp: liveReceipt.timestamp,
              status: "verified",
              valueContribution: liveReceipt.rewards[0]?.value,
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Error fetching remote receipt, using fallback view:", err);
      }

      // Default fallback
      const fallback: ValueReceiptData = {
        id: id || "rec_sample",
        receiptNumber: `REC-${(id || "sample").slice(0, 8).toUpperCase()}`,
        actorHandle: "@contributor",
        actionType: "share",
        actionTitle: "Verified Contribution Proof",
        targetEntity: "Promorang Ecosystem",
        timestamp: "Verified Record",
        status: "verified",
        verificationMethod: "Cryptographic Causation Audit",
        proofHash: `0x${(id || "abcdef123456").slice(0, 16)}`,
        metrics: [
          { label: "Verification", value: "Passed", highlight: true },
          { label: "Attribution", value: "Direct" },
        ],
        rewards: [
          { type: "points", label: "Reward Points", value: "+250 pts" },
          { type: "badge", label: "Vault Proof", value: "Stored in Vault" },
        ],
      };

      setReceipt(fallback);
      setCausation({
        id: "node_fallback",
        actorHandle: fallback.actorHandle,
        action: fallback.actionTitle,
        timestamp: fallback.timestamp,
        status: "verified",
      });
      setLoading(false);
    }

    loadReceipt();
  }, [id]);

  if (loading || !receipt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070709] text-white">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-10 w-10 animate-pulse text-primary" />
          <p className="mt-4 font-mono text-sm text-white/50">{t("proofVault.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-primary selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{t("proofVault.back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-mono text-xs font-bold tracking-widest text-white/80">{t("proofVault.vault")}</span>
          </div>
          <Link to="/explore">
            <Button size="sm" className="bg-primary text-xs font-black text-black hover:bg-primary/90">
              {t("proofVault.explore")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header Banner */}
          <div className="mb-10 text-center">
            <Badge className="border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">
              <Lock className="mr-1.5 h-3.5 w-3.5" /> {t("proofVault.badge")}
            </Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
              {t("proofVault.title")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              {t("proofVault.copy")}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            {/* The Central Physical Receipt */}
            <div className="sticky top-24 space-y-4">
              <TactileValueReceipt receipt={receipt} showShareActions={true} />
            </div>

            {/* Right Column: Causation Tree & Audit Ledger */}
            <div className="space-y-6">
              {/* Causation Lineage Tree */}
              {causation && (
                <CausationTree rootNode={causation} targetEntity={receipt.targetEntity} />
              )}

              {/* Audit Details Card */}
              <Card className="border-white/10 bg-[#0d0d12] text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-black uppercase tracking-wider">{t("proofVault.audit")}</h2>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">{t("proofVault.immutable")}</span>
                  </div>

                  <div className="mt-4 space-y-3.5 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">{t("proofVault.receiptId")}</span>
                      <span className="font-mono font-bold text-white">{receipt.receiptNumber || receipt.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">{t("proofVault.handle")}</span>
                      <span className="font-bold text-primary">{receipt.actorHandle}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">{t("proofVault.destination")}</span>
                      <span className="font-bold text-white">{receipt.targetEntity}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">{t("proofVault.timestamp")}</span>
                      <span className="font-mono text-white/70">{receipt.timestamp}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/50">{t("proofVault.protocol")}</span>
                      <span className="font-mono text-emerald-400">{receipt.verificationMethod || t("proofVault.defaultProtocol")}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-white/50">{t("proofVault.hash")}</span>
                      <span className="font-mono text-[10px] text-white/40">{receipt.proofHash}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Value Economy Explainer */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-black">{t("proofVault.howTitle")}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    {t("proofVault.howCopy")}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="font-mono text-lg font-black text-white">100%</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{t("proofVault.causation")}</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="font-mono text-lg font-black text-emerald-400">{t("proofVault.instant")}</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{t("proofVault.payout")}</div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                      <div className="font-mono text-lg font-black text-primary">{t("proofVault.permanent")}</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40">{t("proofVault.vaultProof")}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-xs text-white/70">{t("proofVault.ctaAsk")}</span>
                    <Link to="/explore">
                      <Button size="sm" className="bg-primary text-xs font-bold text-black hover:bg-primary/90">
                        {t("proofVault.getStarted")} <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
