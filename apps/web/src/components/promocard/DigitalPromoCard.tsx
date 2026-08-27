import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Sparkles,
  QrCode,
  ArrowUpRight,
  RefreshCw,
  Gift,
  ShieldCheck,
  Zap,
  MapPin,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { PromoCardService, PromoCardData, RechargeAction } from "@/lib/promocard";
import { CardTopUpModal } from "./CardTopUpModal";
import { GroupTippingPointBanner } from "./GroupTippingPointBanner";

interface DigitalPromoCardProps {
  onCardUpdate?: (card: PromoCardData) => void;
}

export const DigitalPromoCard: React.FC<DigitalPromoCardProps> = ({ onCardUpdate }) => {
  const { toast } = useToast();
  const [card, setCard] = useState<PromoCardData>(PromoCardService.getCardSummary());
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [rechargeActions, setRechargeActions] = useState<RechargeAction[]>(
    PromoCardService.getRechargeActions()
  );

  const refreshCard = () => {
    const updated = PromoCardService.getCardSummary();
    setCard(updated);
    if (onCardUpdate) onCardUpdate(updated);
  };

  const handleSimulateRecharge = (action: RechargeAction) => {
    const result = PromoCardService.rechargeCard(card.userId, action.type, action.rewardAmount);
    refreshCard();
    toast({
      title: "⚡ PromoCard Recharged!",
      description: `Added +$${action.rewardAmount.toFixed(2)} to your spending balance via ${action.title}.`,
    });
    setShowRechargeModal(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 3D Glassmorphism PromoCard Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 text-white shadow-2xl border border-white/10">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between min-h-[260px]">
          {/* Card Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <CreditCard className="h-5 w-5 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold tracking-wider text-lg uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    Promorang Card
                  </h3>
                  <Badge variant="outline" className="border-amber-400/40 text-amber-300 bg-amber-500/10 text-xs uppercase px-2 py-0.5">
                    {card.tier} Tier
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">Zero-Cash Promotional Credit Line</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5 text-xs backdrop-blur-md rounded-full shadow-sm"
            >
              <QrCode className="h-4 w-4 text-amber-400" />
              <span>In-Store QR</span>
            </Button>
          </div>

          {/* Active Balance Section */}
          <div className="my-6">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Active Purchasing Power
            </p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                ${card.availableBalance.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                of ${card.monthlyLimit.toFixed(2)} monthly limit
              </span>
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Accepted at {card.acceptedLocationsCount} partner venues & online drops
            </p>
          </div>

          {/* Card Bottom Row: Cycle Reset & Recharge Health */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-4 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 block">CARD NUMBER</span>
                <span className="font-mono text-zinc-300 tracking-wider">{card.cardNumber}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-500 block">CYCLE RESETS</span>
                <span className="text-amber-300 font-semibold">{card.cycleDaysRemaining} Days</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-zinc-500 block">LIFETIME SAVINGS</span>
                <span className="text-emerald-400 font-semibold">${card.totalSavingsLifetime.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowTopUpModal(true)}
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-amber-400/30 text-xs rounded-full gap-1"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Top-Up (+15% Free)</span>
              </Button>

              <Button
                onClick={() => setShowRechargeModal(true)}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-full shadow-lg shadow-amber-500/20 text-xs gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 fill-black" />
                <span>Recharge Balance</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Attention Recharge Progress Bar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-zinc-200">Attention Recharge Health</h4>
          </div>
          <span className="text-xs font-bold text-amber-400">{card.rechargeHealthScore}% Active</span>
        </div>
        <Progress value={card.rechargeHealthScore} className="h-2 bg-zinc-800" />
        <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
          <span>Post verified Moments or review visits to unlock higher monthly limits</span>
          <button
            onClick={() => setShowRechargeModal(true)}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
          >
            View Actions <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Promorang Collective Tipping Drops */}
      <div className="pt-2">
        <GroupTippingPointBanner />
      </div>

      {/* Stored-Value Cash Top-Up Modal */}
      <CardTopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => refreshCard()}
      />

      {/* In-Store QR Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Present to Cashier</DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-xs">
              Show this dynamic code at participating partner checkouts to deduct up to your available PromoCredit.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 p-6 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner">
            <QrCode className="h-44 w-44 text-black" />
            <p className="mt-2 text-xs font-mono text-zinc-600 font-bold tracking-wider">
              {card.cardNumber}
            </p>
          </div>

          <div className="text-xs text-zinc-400 space-y-1">
            <p className="font-semibold text-white">Available Balance: ${card.availableBalance.toFixed(2)}</p>
            <p>Cashier will apply discount and settle remaining balance via standard terminal.</p>
          </div>

          <Button
            onClick={() => setShowQRModal(false)}
            variant="outline"
            className="mt-4 w-full border-zinc-800 text-zinc-300"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Recharge Modal */}
      <Dialog open={showRechargeModal} onOpenChange={setShowRechargeModal}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Recharge Your PromoCard
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              You don't repay in cash. Settle and reload your purchasing power by providing verified attention and social proof!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-4">
            {rechargeActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-white">{action.title}</p>
                  <p className="text-xs text-emerald-400 font-semibold">
                    +${action.rewardAmount.toFixed(2)} Card Credit
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleSimulateRecharge(action)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-lg"
                >
                  Complete
                </Button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400">
            💡 <strong className="text-zinc-200">How it works:</strong> Merchants fund your credit margin in exchange for real foot traffic and authentic Moments.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
