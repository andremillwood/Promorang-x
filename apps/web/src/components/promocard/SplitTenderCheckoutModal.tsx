import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Store,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  SplitTenderService,
  SplitTenderCalculation,
  SplitTenderReceipt,
  PromoCardService,
} from "@/lib/promocard";

interface SplitTenderCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  merchantName: string;
  itemTitle: string;
  grossAmount: number;
  onSuccess?: (receipt: SplitTenderReceipt) => void;
}

export const SplitTenderCheckoutModal: React.FC<SplitTenderCheckoutModalProps> = ({
  isOpen,
  onClose,
  merchantId,
  merchantName,
  itemTitle,
  grossAmount,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [usePromoCard, setUsePromoCard] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<SplitTenderReceipt | null>(null);

  const calc: SplitTenderCalculation = SplitTenderService.calculateSplit(
    grossAmount,
    merchantId,
    usePromoCard
  );

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = SplitTenderService.executeTransaction(
        merchantId,
        merchantName,
        grossAmount,
        usePromoCard
      );

      setIsProcessing(false);
      if (result.success && result.receipt) {
        setCompletedReceipt(result.receipt);
        toast({
          title: "🎉 Split-Tender Payment Complete!",
          description: `Saved $${result.receipt.promoDiscountApplied.toFixed(2)} with your Promorang Card.`,
        });
        if (onSuccess) onSuccess(result.receipt);
      } else {
        toast({
          title: "Payment Error",
          description: result.error || "Could not process transaction",
          variant: "destructive",
        });
      }
    }, 800);
  };

  const handleModalClose = () => {
    setCompletedReceipt(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-md">
        {!completedReceipt ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                <Store className="h-4 w-4" />
                {merchantName}
              </div>
              <DialogTitle className="text-xl font-bold">{itemTitle}</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Split-Tender Checkout: Settle with your PromoCard balance + standard card.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-3">
              {/* Order Gross Amount */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-sm text-zinc-300">Order Subtotal</span>
                <span className="text-lg font-bold text-white">${grossAmount.toFixed(2)}</span>
              </div>

              {/* PromoCard Application Toggle */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                      <CreditCard className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Apply Promorang Card</p>
                      <p className="text-[11px] text-zinc-400">
                        Available: ${calc.promoBalanceAvailable.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={usePromoCard}
                    onCheckedChange={setUsePromoCard}
                    disabled={!calc.isEligibleForPromo}
                  />
                </div>

                {!calc.isEligibleForPromo ? (
                  <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Minimum spend of ${calc.minBasketSizeRequired.toFixed(2)} required for this merchant.
                  </p>
                ) : (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-500/10">
                    <span className="text-emerald-400 font-medium">Merchant Margin Applied:</span>
                    <span className="text-emerald-400 font-bold">
                      -${calc.promoDiscountApplied.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Fee and Payout Transparency */}
              <div className="space-y-2 text-xs text-zinc-400 px-1">
                <div className="flex justify-between">
                  <span>Gross Order</span>
                  <span className="text-zinc-200">${grossAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Promorang Card Discount</span>
                  <span>-${calc.promoDiscountApplied.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant Net Settlement</span>
                  <span className="text-zinc-400">${calc.netMerchantPayout.toFixed(2)}</span>
                </div>
                <Separator className="bg-zinc-800 my-1" />
                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span>Total Cash Due (Card/Apple Pay)</span>
                  <span className="text-amber-400 text-base">${calc.fiatCashPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCompletePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-11 rounded-xl text-sm gap-2"
            >
              {isProcessing ? (
                "Settling Split-Tender..."
              ) : (
                <>
                  <span>Pay ${calc.fiatCashPayable.toFixed(2)} & Settle Order</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        ) : (
          /* Payment Success View */
          <div className="text-center py-4 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-white">Payment Confirmed!</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Receipt ID: {completedReceipt.id}
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Merchant</span>
                <span className="text-white font-semibold">{completedReceipt.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Charged to Card</span>
                <span className="text-white font-semibold">${completedReceipt.fiatCashCharged.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>PromoCard Savings</span>
                <span className="font-bold">-${completedReceipt.promoDiscountApplied.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              ⚡ <strong>Recharge Tip:</strong> Post a Moment photo from this visit to recharge +$15 back onto your Promorang Card!
            </div>

            <Button
              onClick={handleModalClose}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
