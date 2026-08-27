import React, { useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Sparkles,
  CreditCard,
  Send,
  Zap,
  Users,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const CardDropCreator: React.FC = () => {
  const { user } = useAuth();
  const [dropAmount, setDropAmount] = useState<number>(15);
  const [customNote, setCustomNote] = useState<string>("Enjoy your pre-loaded Promorang Card on me!");
  const [copied, setCopied] = useState(false);

  const senderName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "A Promorang Friend";
  const dropCode = `drop_${Date.now().toString(36)}`;
  const shareUrl = `${window.location.origin}/claim-drop?amount=${dropAmount}&from=${encodeURIComponent(
    senderName
  )}&code=${dropCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Card Drop Link Copied!", {
      description: "Send this to friends to gift them spendable Promorang Card power.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${senderName} sent you a $${dropAmount} Promorang Card!`,
          text: customNote,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-white overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 right-0 h-48 w-48 bg-amber-500/10 blur-3xl pointer-events-none" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10 text-xs uppercase">
                Viral Liquidity Rail
              </Badge>
              <span className="text-xs text-zinc-400 font-medium">PromoShare Drops</span>
            </div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Gift className="h-6 w-6 text-amber-400" />
              Gift a Pre-Loaded Card Drop
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Drop real spendable purchasing power directly to your friends, followers, or community.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Drop Amount Selector */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-300 font-semibold">Select Drop Amount to Gift</Label>
          <div className="grid grid-cols-3 gap-3">
            {[10, 15, 25].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setDropAmount(amt)}
                className={`py-3.5 px-4 rounded-xl border text-center font-bold transition-all ${
                  dropAmount === amt
                    ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/10 scale-[1.02]"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <span className="text-lg block">${amt}</span>
                <span className="text-[10px] font-normal text-zinc-400">Card Credit</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <div className="space-y-2">
          <Label className="text-xs text-zinc-300 font-semibold">Personalized Gift Message</Label>
          <Input
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Here's a drink or meal on me in Kingston!"
            className="bg-zinc-900 border-zinc-800 text-white text-xs h-10"
          />
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-amber-400" />
              Recipient View Preview
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              Ready to Claim
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-zinc-300">
              <strong className="text-white">{senderName}</strong> sent you:
            </p>
            <p className="text-2xl font-black text-amber-400">${dropAmount}.00 Promorang Card Credit</p>
            <p className="text-xs text-zinc-400 italic">"{customNote}"</p>
          </div>
        </div>

        {/* Share Actions */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="bg-zinc-900/80 border-zinc-800 text-xs font-mono text-zinc-400 h-11"
            />
            <Button
              onClick={handleCopyLink}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-11 px-5 rounded-xl text-xs gap-1.5 shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </Button>
          </div>

          <Button
            onClick={handleShareNative}
            variant="outline"
            className="w-full border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-white text-xs h-10 rounded-xl gap-2"
          >
            <Share2 className="h-4 w-4 text-amber-400" />
            <span>Share via WhatsApp / Socials</span>
          </Button>
        </div>

        {/* Viral Benefit Explanation */}
        <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Viral Reward Loop:
          </p>
          <p>
            When recipients claim your drop and spend at a partner Discovery, you automatically earn{" "}
            <strong className="text-emerald-400">5% commission</strong> on their cash order plus{" "}
            <strong className="text-amber-300">+25% Attention Recharge</strong> on your own card!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
