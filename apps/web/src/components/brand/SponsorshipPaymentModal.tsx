import { useState } from "react";
import { CreditCard, ShieldCheck, Zap, ArrowRight, Loader2, DollarSign, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Sponsorship {
  id: string;
  moment: { title: string; location: string };
  bid_amount: number;
}

interface Props {
  sponsorship: Sponsorship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFunded: (id: string) => void;
}

export function SponsorshipPaymentModal({ sponsorship, open, onOpenChange, onFunded }: Props) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!sponsorship) return null;

  const platformFee = sponsorship.bid_amount * 0.15;
  const hostPayout = sponsorship.bid_amount - platformFee;

  const handleFunding = async () => {
    setLoading(true);
    // Simulate payment settlement
    setTimeout(() => {
      setLoading(false);
      onFunded(sponsorship.id);
      onOpenChange(false);
      toast({
        title: "Moment Successfully Funded! 💳",
        description: `Successfully activated sponsorship for ${sponsorship.moment.title}.`,
      });
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-charcoal text-cream border-white/5 p-0 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-black italic flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              Sponsorship Settlement
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Funding this moment activates the points-granting power for the Mayor.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Moment Target</p>
                    <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold uppercase">{sponsorship.moment.location.split(',')[0]}</Badge>
               </div>
               <h4 className="text-xl font-bold">{sponsorship.moment.title}</h4>
          </div>

          <div className="space-y-3">
               <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">Sponsorship Bid</span>
                    <span>${sponsorship.bid_amount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-white/60">Platform Service Fee (15%)</span>
                    <span>${platformFee.toFixed(2)}</span>
               </div>
               <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-black uppercase tracking-widest text-[10px] text-primary">Settlement Total</span>
                    <span className="text-2xl font-black italic text-emerald-500">${sponsorship.bid_amount.toFixed(2)}</span>
               </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
               <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
               <p className="text-[11px] text-white/70 leading-relaxed italic font-medium">
                 By activating, you authorize the Mayor to grant points backed by this budget. Participants will see **sponsored by ${sponsorship.moment.title}** on their check-ins.
               </p>
          </div>
        </div>

        <DialogFooter className="p-8 bg-white/5 border-t border-white/5">
          <Button variant="ghost" className="text-white/40 hover:text-white" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="hero" 
            className="h-12 px-8 shadow-glow-emerald bg-emerald-600 hover:bg-emerald-700" 
            disabled={loading}
            onClick={handleFunding}
          >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <span className="flex items-center gap-2">
                    Confirm & Activate
                    <ArrowRight className="w-4 h-4" />
                </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
