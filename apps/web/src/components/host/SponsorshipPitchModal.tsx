import { useState } from "react";
import { Handshake, Share2, Copy, Check, MessageSquare, Megaphone, Zap, Sparkles, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SponsorshipPitchModalProps {
  momentId?: string;
  momentTitle?: string;
  trigger?: React.ReactNode;
}

export function SponsorshipPitchModal({ momentId, momentTitle, trigger }: SponsorshipPitchModalProps) {
  const [copied, setCopied] = useState(false);
  const [targetBudget, setTargetBudget] = useState("500");
  const { toast } = useToast();

  const pitchUrl = `${window.location.origin}/moments/${momentId}?pitch=true&budget=${targetBudget}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pitchUrl);
    setCopied(true);
    toast({
      title: "Pitch Link Copied! 🔗",
      description: "Send this to brands looking for authentic community alignment.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 bg-primary/5">
            <Handshake className="w-4 h-4" />
            Pitch Sponsor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-border overflow-hidden p-0">
        <div className="bg-charcoal text-cream p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16" />
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-xl backdrop-blur-sm">
                <Megaphone className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold italic">Sponsorship Pitch</h2>
            <p className="text-white/50 text-xs mt-1">Invite a brand to fund your community moment.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border">
             <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target Funding</Label>
                <div className="flex items-center gap-1 text-primary font-bold">
                    <DollarSign className="w-3 h-3" />
                    {targetBudget}
                </div>
             </div>
             <Input 
               type="range" 
               min="100" 
               max="5000" 
               step="100"
               value={targetBudget}
               onChange={(e) => setTargetBudget(e.target.value)}
               className="h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
             />
             <p className="text-[10px] text-muted-foreground text-center animate-pulse">
                Brands prefer budgets between $250 - $1,500 for single events.
             </p>
          </div>

          <div className="space-y-3">
             <h4 className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                The Value Proposition
             </h4>
             <ul className="space-y-2">
                {[
                  "Verified behavioral conversion (Foot traffic)",
                  "Branded UGC from high-intent participants",
                  "Direct community loyalty & retention"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5" />
                    {text}
                  </li>
                ))}
             </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
                variant="hero" 
                className="flex-1 h-14 font-black shadow-xl"
                onClick={handleCopy}
            >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? "Link Copied" : "Copy Pitch Link"}
            </Button>
          </div>

          <div className="text-center">
             <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase py-1 px-3 border border-border rounded-full bg-muted/30">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                Founding Mayor Tool
             </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
