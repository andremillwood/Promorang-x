import React, { useState } from "react";
import {
  Building2,
  Gift,
  Users,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PromoCardService, BulkPassOrder } from "@/lib/promocard";

interface B2BBulkPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  hubName?: string;
}

export const B2BBulkPassModal: React.FC<B2BBulkPassModalProps> = ({
  isOpen,
  onClose,
  hubName = "Downtown Culture & Dining Hub",
}) => {
  const { toast } = useToast();
  const [orgName, setOrgName] = useState("");
  const [passCount, setPassCount] = useState<number>(25);
  const [passPerk, setPassPerk] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<BulkPassOrder | null>(null);
  const [copied, setCopied] = useState(false);

  const totalCash = passCount * passPerk;

  const handleOrderPasses = () => {
    if (!orgName.trim()) {
      toast({
        title: "Organization Name Required",
        description: "Please enter your company or organization name.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const order = PromoCardService.createBulkPassOrder(orgName, passCount, passPerk);
      setIsProcessing(false);
      setCompletedOrder(order);
      toast({
        title: "🎉 Bulk Culture Passes Generated!",
        description: `Issued ${passCount} passes for ${orgName}.`,
      });
    }, 800);
  };

  const handleCopyCodes = () => {
    const codes = Array.from(
      { length: completedOrder?.passCount || 0 },
      (_, i) => `${completedOrder?.passCodePrefix}-${1000 + i}`
    ).join("\n");

    navigator.clipboard.writeText(codes);
    setCopied(true);
    toast({
      title: "Pass Codes Copied!",
      description: "Ready to distribute to your employees or attendees.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-lg">
        {!completedOrder ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 text-xs">
                  B2B Corporate & Event Gifting
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-1">
                <Building2 className="h-5 w-5 text-amber-400" />
                Issue Bulk Community Hub Passes
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Provide your team, clients, or event guests with pre-loaded Promorang Passes spendable across all {hubName} merchants.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Organization or Event Name</Label>
                <Input
                  placeholder="e.g. Acme Studio / Tech Summit 2026"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white text-xs h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">Number of Passes</Label>
                  <Input
                    type="number"
                    value={passCount}
                    onChange={(e) => setPassCount(Number(e.target.value))}
                    className="bg-zinc-900 border-zinc-800 text-white text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-300">Balance Per Pass ($)</Label>
                  <Input
                    type="number"
                    value={passPerk}
                    onChange={(e) => setPassPerk(Number(e.target.value))}
                    className="bg-zinc-900 border-zinc-800 text-white text-xs h-10"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Pass Tier</span>
                  <span className="text-white font-medium">{hubName} VIP Pass</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Total Recipients</span>
                  <span className="text-white font-medium">{passCount} Employees / Guests</span>
                </div>
                <div className="flex justify-between text-amber-400 font-medium">
                  <span>Operator Revenue Split</span>
                  <span>80% Distributed to Local Hub</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Invoice (Stripe B2B)</span>
                  <span className="text-emerald-400 text-base">${totalCash.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleOrderPasses}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold h-11 rounded-xl text-sm gap-2"
            >
              {isProcessing ? "Generating Passes..." : `Purchase ${passCount} Passes ($${totalCash.toFixed(2)})`}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          /* Order Complete View */
          <div className="text-center py-4 space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold text-white">
                {completedOrder.passCount} Passes Ready for Distribution!
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Order ID: {completedOrder.id} • Prefix: {completedOrder.passCodePrefix}
              </DialogDescription>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2 text-xs">
              <p className="text-zinc-300 font-semibold">Distribution Options:</p>
              <p className="text-zinc-400">
                Share your unique pass code list with your team. Recipients enter their code at{" "}
                <code className="text-amber-400">promorang.co/claim-drop</code> to load their ${completedOrder.amountPerPass} balance.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCopyCodes}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-10 rounded-xl gap-1.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied All Codes" : "Copy Codes List"}</span>
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-zinc-800 text-zinc-300 text-xs h-10 rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
