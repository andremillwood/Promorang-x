import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
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
import { useAuth } from "@/contexts/AuthContext";
import { usePromoCard } from "@/hooks/usePromoCard";

interface DigitalPromoCardProps {
  onCardUpdate?: (card: PromoCardData) => void;
  isPreviewData?: boolean;
}

export const DigitalPromoCard: React.FC<DigitalPromoCardProps> = ({ onCardUpdate, isPreviewData }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardQuery = usePromoCard(user?.id);
  const previewCard = PromoCardService.getCardSummary(user?.id);
  const card = cardQuery.data || previewCard;
  const isPreview = isPreviewData ?? !cardQuery.data;
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeActions] = useState<RechargeAction[]>(
    PromoCardService.getRechargeActions()
  );

  useEffect(() => {
    if (cardQuery.data && onCardUpdate) onCardUpdate(cardQuery.data);
  }, [cardQuery.data, onCardUpdate]);

  const handleRechargeAction = (action: RechargeAction) => {
    setShowRechargeModal(false);
    if (action.actionUrl) {
      navigate(action.actionUrl);
      return;
    }
    toast({ title: "Action not yet available", description: "This recharge path is being connected to verified completion records." });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      {isPreview ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3.5 py-3 text-xs leading-5 text-amber-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p><strong>Preview card:</strong> {cardQuery.error ? "your live PromoCard could not be loaded." : "your account does not have a live PromoCard record yet."} The balance shown below is demonstration data and cannot be spent.</p>
        </div>
      ) : null}
      {/* 3D Glassmorphism PromoCard Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 text-white shadow-2xl sm:rounded-3xl sm:p-8">
        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex min-h-[245px] flex-col justify-between sm:min-h-[260px]">
          {/* Card Top Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <CreditCard className="h-5 w-5 text-black" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-base font-bold uppercase tracking-wider text-transparent sm:text-lg">
                    PromoCard
                  </h3>
                  <Badge variant="outline" className="border-amber-400/40 text-amber-300 bg-amber-500/10 text-xs uppercase px-2 py-0.5">
                    {card.tier} Tier
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400">Promotional spending balance</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRModal(true)}
              disabled={isPreview}
              className="h-10 shrink-0 gap-1.5 rounded-xl border-white/20 bg-white/10 px-3 text-xs text-white shadow-sm backdrop-blur-md hover:bg-white/20 sm:rounded-full"
            >
              <QrCode className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">{isPreview ? "QR unavailable" : "Use in store"}</span>
            </Button>
          </div>

          {/* Active Balance Section */}
          <div className="my-6">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Available promotional balance
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                ${card.availableBalance.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                of ${card.monthlyLimit.toFixed(2)} available this cycle
              </span>
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Available at {card.acceptedLocationsCount} participating places and online offers
            </p>
          </div>

          {/* Card Bottom Row: Cycle Reset & Recharge Health */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-3 gap-3 text-xs text-zinc-300 sm:flex sm:items-center sm:gap-4">
              <div>
                <span className="text-zinc-500 block">CARD NUMBER</span>
                <span className="font-mono text-zinc-300 tracking-wider">{card.cardNumber}</span>
              </div>
              <div className="hidden h-6 w-px bg-white/10 sm:block" />
              <div>
                <span className="text-zinc-500 block">CYCLE RESETS</span>
                <span className="text-amber-300 font-semibold">{card.cycleDaysRemaining} Days</span>
              </div>
              <div className="hidden h-6 w-px bg-white/10 sm:block" />
              <div>
                <span className="text-zinc-500 block">LIFETIME SAVINGS</span>
                <span className="text-emerald-400 font-semibold">${card.totalSavingsLifetime.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <Button
                disabled
                size="sm"
                variant="outline"
                className="h-11 gap-1 rounded-xl border-amber-400/30 bg-white/10 px-3 text-[11px] text-white hover:bg-white/20 sm:h-9 sm:rounded-full sm:text-xs"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Top up coming soon</span>
              </Button>

              <Button
                onClick={() => setShowRechargeModal(true)}
                size="sm"
                className="h-11 gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 text-[11px] font-semibold text-black shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 sm:h-9 sm:rounded-full sm:text-xs"
              >
                <Zap className="h-3.5 w-3.5 fill-black" />
                <span>Ways to recharge</span>
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
            <h4 className="text-sm font-semibold text-zinc-200">Recharge progress</h4>
          </div>
          <span className="text-xs font-bold text-amber-400">{card.rechargeHealthScore}% Active</span>
        </div>
        <Progress value={card.rechargeHealthScore} className="h-2 bg-zinc-800" />
        <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
          <span>Complete verified actions to restore promotional balance.</span>
          <button
            onClick={() => setShowRechargeModal(true)}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
          >
            View Actions <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* In-Store QR Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">Present to Cashier</DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-xs">
              Show this code at a participating checkout to apply eligible PromoCard balance.
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
            <p>Your eligible PromoCard amount is applied first. Pay the remaining purchase amount normally.</p>
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
              PromoCard is not a loan. Complete eligible verified actions to restore promotional spending balance.
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
                    +${action.rewardAmount.toFixed(2)} promotional balance
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleRechargeAction(action)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-lg"
                >
                    {action.actionUrl ? "View action" : "Soon"}
                </Button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400">
            <strong className="text-zinc-200">How it works:</strong> Participating merchants authorize promotional value for eligible purchases. Promorang actions can restore your available balance when their requirements are verified.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
