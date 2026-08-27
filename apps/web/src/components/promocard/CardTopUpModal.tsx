import React, { useState } from "react";
import {
  DollarSign,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PromoCardService } from "@/lib/promocard";

interface CardTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CardTopUpModal: React.FC<CardTopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedCash, setSelectedCash] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{
    cash: number;
    bonus: number;
    total: number;
  } | null>(null);

  const bonusPercent = 0.15;
  const currentBonus = Number((selectedCash * bonusPercent).toFixed(2));
  const currentTotal = selectedCash + currentBonus;

  const handleExecuteTopUp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = PromoCardService.topUpWithCash(selectedCash);
      setIsProcessing(false);
      setSuccessResult({
        cash: selectedCash,
        bonus: result.bonusMarginAdded,
        total: result.totalBalanceAdded,
      });

      toast({
        title: "⚡ Stored-Value Top-Up Complete!",
        description: `Deposited $${selectedCash} + Added +$${result.bonusMarginAdded.toFixed(2)} Merchant Bonus Credit!`,
      });

      if (onSuccess) onSuccess();
    }, 900);
  };

  const handleModalClose = () => {
    setSuccessResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-md">
        {!successResult ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 text-xs">
                  Starbucks-Style Stored-Value Float
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-1">
                <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
                Pre-Load Cash & Get +15% Free
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Deposit cash into your Promorang Card to unlock an instant 15% promotional match funded by the merchant clearinghouse.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-3">
              {/* Cash Selectors */}
              <div className="grid grid-cols-3 gap-3">
                {[25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSelectedCash(amt)}
                    className={`py-3.5 px-3 rounded-2xl border text-center transition-all ${
                      selectedCash === amt
                        ? "border-amber-500 bg-amber-500/20 text-white shadow-lg shadow-amber-500/15 scale-[1.02]"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xl font-black block">${amt}</span>
                    <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                      +${(amt * 0.15).toFixed(2)} Free
                    </span>
                  </button>
                ))}
              </div>

              {/* Value Equation Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Your Cash Deposit (100% Protected)</span>
                  <span className="text-white font-semibold">${selectedCash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-medium">
                  <span>+15% Merchant Network Bonus</span>
                  <span>+${currentBonus.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Card Spending Power Added</span>
                  <span className="text-emerald-400 text-base">${currentTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 space-y-0.5">
                <p className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  How Stored-Value Works:
                </p>
                <p>
                  Your cash deposit never expires. Spend it at any participating Discovery alongside your merchant discount.
                </p>
              </div>
            </div>

            <Button
              onClick={handleExecuteTopUp}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-11 rounded-xl text-sm gap-2"
            >
              {isProcessing ? (
                "Processing Top-Up..."
              ) : (
                <>
                  <span>Deposit ${selectedCash} & Unlock ${currentTotal.toFixed(2)}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        ) : (
          /* Success View */
          <div className="text-center py-4 space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-white">Card Successfully Loaded!</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Added ${successResult.total.toFixed(2)} to your Promorang Card spending balance.
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Cash Pre-Loaded</span>
                <span className="text-white font-semibold">${successResult.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Free Merchant Margin Match</span>
                <span>+${successResult.bonus.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleModalClose}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl"
            >
              Back to Wallet
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
