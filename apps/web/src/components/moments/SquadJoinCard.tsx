import { useState } from "react";
import { Users, Share2, Sparkles, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SquadJoinCardProps {
  momentId: string;
  momentTitle: string;
}

export function SquadJoinCard({ momentId, momentTitle }: SquadJoinCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const squadLink = `${window.location.origin}/moments/${momentId}?squad=${Math.random().toString(36).substring(7)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(squadLink);
    setCopied(true);
    toast({
      title: "Squad Link Copied!",
      description: "Paste this in your group chat to assemble your squad.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my squad for ${momentTitle}!`,
          text: `I'm going to ${momentTitle} on Promorang. Join my squad and we both get bonus points!`,
          url: squadLink,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-primary/5 overflow-hidden shadow-soft-xl group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3 h-3" />
              Squad Bonus: +20% Pts
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-2">Assemble a Squad</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Everything is better with friends. Invite others to this moment and unlock group-only multipliers.
        </p>

        <div className="flex gap-2">
          <Button 
            variant="hero" 
            className="flex-1 font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Invite Friends
          </Button>
          <Button 
            variant="outline" 
            className="bg-background border-border"
            size="icon"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-primary/10">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" />
            Active Squad Members
          </h4>
          <div className="flex -space-x-3">
             {[1, 2, 3].map((i) => (
               <div key={i} className={cn(
                 "w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold",
                 i === 1 ? "bg-amber-100 text-amber-600" : i === 2 ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
               )}>
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
             <div className="w-8 h-8 rounded-full border-2 border-card bg-charcoal text-white flex items-center justify-center text-[8px] font-black">
               +9
             </div>
          </div>
          <p className="text-[9px] text-muted-foreground mt-3 font-medium">
             <span className="text-emerald-600 font-bold">12 explorers</span> are currently coordinating for this moment.
          </p>
        </div>
      </CardContent>
      <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />
    </Card>
  );
}
