import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  Coins,
  KeyRound,
} from "lucide-react";
import { describePromoCardLoop } from "@promorang/shared";
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
import { useUserBalance } from "@/hooks/useEconomy";
import { useI18n } from "@/i18n/I18nContext";
import { useMembershipStanding } from "@/hooks/useMembershipStanding";
import { useTonightPartner } from "@/hooks/useTonightPartner";
import { PromoCardNextMove } from "./PromoCardNextMove";

interface DigitalPromoCardProps {
  onCardUpdate?: (card: PromoCardData) => void;
  isPreviewData?: boolean;
  variant?: "full" | "hero";
  points?: number;
  promoKeys?: number;
  onConvertKeys?: () => void;
  onOpenPackage?: () => void;
}

export const DigitalPromoCard: React.FC<DigitalPromoCardProps> = ({
  onCardUpdate,
  isPreviewData,
  variant = "full",
  points,
  promoKeys,
  onConvertKeys,
  onOpenPackage,
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const cardQuery = usePromoCard(user?.id);
  const balanceQuery = useUserBalance();
  const previewCard = PromoCardService.getCardSummary(user?.id);
  const card = cardQuery.data || previewCard;
  const isPreview = isPreviewData ?? !cardQuery.data;
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeActions] = useState<RechargeAction[]>(
    PromoCardService.getRechargeActions()
  );

  const { standing } = useMembershipStanding();
  const tonightPlace = useTonightPartner();
  const nextRechargeAmount = rechargeActions.find((action) => !action.completed)?.rewardAmount ?? 15;
  const resolvedPoints = points ?? Number(balanceQuery.data?.points || 0);
  const resolvedKeys = promoKeys ?? Number(balanceQuery.data?.promokeys || 0);
  const loop = useMemo(
    () =>
      describePromoCardLoop({
        hasLiveCard: !isPreview,
        monthlyLimit: card.monthlyLimit,
        availableBalance: card.availableBalance,
        spentThisCycle: card.spentThisCycle,
        nextRechargeAmount,
        points: resolvedPoints,
        promoKeys: resolvedKeys,
        hasSealedPackage: Boolean(standing.nextPackage),
        pendingReferrals: standing.pot.pendingReferrals,
        tonightPlace,
      }),
    [isPreview, card.monthlyLimit, card.availableBalance, card.spentThisCycle, nextRechargeAmount, resolvedPoints, resolvedKeys, standing.nextPackage, standing.pot.pendingReferrals, tonightPlace]
  );

  useEffect(() => {
    if (cardQuery.data && onCardUpdate) onCardUpdate(cardQuery.data);
  }, [cardQuery.data, onCardUpdate]);

  useEffect(() => {
    if (location.hash === "#recharge") setShowRechargeModal(true);
  }, [location.hash]);

  const handleRechargeAction = (action: RechargeAction) => {
    setShowRechargeModal(false);
    if (action.actionUrl) {
      navigate(action.actionUrl);
      return;
    }
    toast({ title: "Action not yet available", description: "This recharge path is being connected to verified completion records." });
  };

  const handleNextMove = () => {
    if (loop.next.id === "convert_key" && onConvertKeys) {
      onConvertKeys();
      return;
    }
    if (loop.next.id === "recharge") {
      setShowRechargeModal(true);
      return;
    }
    if (loop.next.id === "open_package" && onOpenPackage) {
      onOpenPackage();
      return;
    }
    navigate(loop.next.href);
  };

  const heroAmount = isPreview ? loop.credit.networkCapacity : loop.credit.readyToSpend;
  const heroLabel = isPreview ? t("promoCardLoop.prospectiveLabel") : t("promoCardLoop.readyLabel");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      {isPreview ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3.5 py-3 text-xs leading-5 text-amber-100">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>{t("promoCardLoop.previewNote")}</p>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-5 text-white shadow-2xl sm:rounded-3xl sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex min-h-[245px] flex-col justify-between sm:min-h-[260px]">
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
                <p className="text-xs text-zinc-400">{t("promoCardLoop.cardSubtitle")}</p>
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
              <span className="hidden sm:inline">{isPreview ? t("promoCardLoop.qrUnavailable") : t("promoCardLoop.useInStore")}</span>
            </Button>
          </div>

          <div className="my-6">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              {heroLabel}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                ${heroAmount.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                {isPreview
                  ? t("promoCardLoop.firstReady", { amount: `$${loop.credit.cycleCredit.toFixed(0)}` })
                  : t("promoCardLoop.ofCapacity", {
                      ready: `$${loop.credit.cycleCredit.toFixed(0)}`,
                      capacity: `$${loop.credit.networkCapacity.toFixed(0)}`,
                    })}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/50">{t("promoCardLoop.whoFunds")}</p>
            {loop.credit.stillRestorable > 0 ? (
              <p className="mt-1 text-xs font-medium text-amber-200">
                {t("promoCardLoop.stillRestore", { amount: `$${loop.credit.stillRestorable.toFixed(2)}` })}
              </p>
            ) : null}
            {loop.credit.nextRechargeAmount > 0 ? (
              <p className="mt-1 text-xs text-emerald-300">
                {t("promoCardLoop.nextRecharge", { amount: `$${loop.credit.nextRechargeAmount.toFixed(2)}` })}
              </p>
            ) : null}
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("promoCardLoop.acceptedAt", { count: String(card.acceptedLocationsCount) })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/35 p-3 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-300">
                <Coins className="h-3 w-3" /> {t("promoCardLoop.points")}
              </p>
              <p className="mt-0.5 text-lg font-black">{loop.instruments.points.toLocaleString()}</p>
              <p className="text-[10px] text-white/45">
                {loop.instruments.canConvertKey
                  ? t("promoCardLoop.canConvert")
                  : t("promoCardLoop.toNextKey", { count: String(loop.instruments.pointsToNextKey) })}
              </p>
            </div>
            <div className="border-l border-white/10 pl-3">
              <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-300">
                <KeyRound className="h-3 w-3" /> {t("promoCardLoop.keys")}
              </p>
              <p className="mt-0.5 text-lg font-black">{loop.instruments.promoKeys.toLocaleString()}</p>
              <p className="text-[10px] text-white/45">
                {loop.instruments.promoKeys > 0 ? t("promoCardLoop.keyReady") : t("promoCardLoop.keysUnlock")}
              </p>
            </div>
            <div className="col-span-2 border-t border-white/10 pt-2 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/40">{t("promoCardLoop.cycleResets")}</p>
              <p className="mt-0.5 text-sm font-bold text-amber-200">{card.cycleDaysRemaining} {t("promoCardLoop.days")}</p>
              <p className="text-[10px] text-white/45">{t("promoCardLoop.lifetime", { amount: `$${card.totalSavingsLifetime.toFixed(2)}` })}</p>
            </div>
          </div>

          {variant === "full" ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10 mt-4">
              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500 block">{t("promoCardLoop.cardNumber")}</span>
                <span className="font-mono text-zinc-300 tracking-wider">{card.cardNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button
                  disabled
                  size="sm"
                  variant="outline"
                  className="h-11 gap-1 rounded-xl border-amber-400/30 bg-white/10 px-3 text-[11px] text-white hover:bg-white/20 sm:h-9 sm:rounded-full sm:text-xs"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>{t("promoCardLoop.topUpSoon")}</span>
                </Button>
                <Button
                  onClick={() => setShowRechargeModal(true)}
                  size="sm"
                  className="h-11 gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 text-[11px] font-semibold text-black shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 sm:h-9 sm:rounded-full sm:text-xs"
                >
                  <Zap className="h-3.5 w-3.5 fill-black" />
                  <span>{t("promoCardLoop.waysToRestore")}</span>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <PromoCardNextMove
        id={loop.next.id}
        href={loop.next.href}
        creditHint={loop.next.creditHint}
        pointsHint={loop.next.pointsHint}
        keysHint={loop.next.keysHint}
        placeHint={loop.next.placeHint}
        onAction={handleNextMove}
      />

      {variant === "full" ? (
        <div id="recharge" className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-zinc-200">{t("promoCardLoop.rechargeProgress")}</h4>
            </div>
            <span className="text-xs font-bold text-amber-400">{card.rechargeHealthScore}% {t("promoCardLoop.active")}</span>
          </div>
          <Progress value={card.rechargeHealthScore} className="h-2 bg-zinc-800" />
          <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
            <span>{t("promoCardLoop.rechargeHint")}</span>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
            >
              {t("promoCardLoop.viewActions")} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">{t("promoCardLoop.presentTitle")}</DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-xs">
              {t("promoCardLoop.presentCopy")}
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 p-6 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner">
            <QrCode className="h-44 w-44 text-black" />
            <p className="mt-2 text-xs font-mono text-zinc-600 font-bold tracking-wider">
              {card.cardNumber}
            </p>
          </div>

          <div className="text-xs text-zinc-400 space-y-1">
            <p className="font-semibold text-white">{t("promoCardLoop.readyLabel")}: ${loop.credit.readyToSpend.toFixed(2)}</p>
            <p>{t("promoCardLoop.presentRemainder")}</p>
          </div>

          <Button
            onClick={() => setShowQRModal(false)}
            variant="outline"
            className="mt-4 w-full border-zinc-800 text-zinc-300"
          >
            {t("promoCardLoop.done")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showRechargeModal} onOpenChange={setShowRechargeModal}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              {t("promoCardLoop.rechargeTitle")}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              {t("promoCardLoop.rechargeCopy", { amount: loop.credit.stillRestorable.toFixed(0), count: String(loop.instruments.pointsToNextKey) })}
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
                    {t("promoCardLoop.actionCredit", { amount: action.rewardAmount.toFixed(2) })}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleRechargeAction(action)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-lg"
                >
                    {action.actionUrl ? t("promoCardLoop.viewAction") : t("promoCardLoop.soon")}
                </Button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400">
            <strong className="text-zinc-200">{t("promoCardLoop.howItWorks")}</strong> {t("promoCardLoop.howItWorksCopy")}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
