import { useState } from "react";
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, MessageCircle, Sparkles, Gem, Send, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

interface ShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  venueName?: string;
  rewardValue?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  title,
  description,
  url,
  imageUrl,
  venueName,
  rewardValue,
  variant = "outline",
  size = "sm",
  className = "",
}: ShareButtonProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const baseUrl = url || (typeof window !== "undefined" ? window.location.href : "https://www.promorang.co");
  // Attach referral code if user is authenticated
  const shareUrl = user?.id ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}ref=${user.id.slice(0, 8)}` : baseUrl;
  
  const shareText = description
    ? `${title} — ${description.slice(0, 120)}${description.length > 120 ? "..." : ""}`
    : title;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Your unique PromoShare referral link is ready to share.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n👉 Join here: ${shareUrl}`)}`, "_blank"),
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      color: "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
    {
      name: "SMS / iMessage",
      icon: Send,
      color: "bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25",
      action: () => window.open(`sms:?&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank"),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          {t("shareButton.label")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-white/10 bg-[#0e0e11] text-white rounded-3xl shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-black">Share & Earn</DialogTitle>
                <p className="text-[11px] text-white/50">Invite friends & earn rewards when they join</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Card Preview */}
          <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center gap-3.5">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/10" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 font-black text-xl">
                ✨
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate">{title}</p>
              {venueName && <p className="text-[11px] text-primary font-medium truncate mt-0.5">{venueName}</p>}
              <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">{description || "Discover live moments on Promorang"}</p>
            </div>
          </div>

          {/* WIIFM Earning Potential Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/10 to-transparent border border-amber-500/25 flex items-start gap-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-200">PromoShare Reward</p>
              <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">
                Earn <strong className="text-white">50 Gems ($0.50)</strong> for every friend who RSVPs + <strong className="text-white">10% commission</strong> on ticket passes.
              </p>
            </div>
          </div>

          {/* 1-Tap Channels Grid */}
          <div className="grid grid-cols-2 gap-2">
            {shareChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <button
                  key={channel.name}
                  onClick={channel.action}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all active:scale-[0.98] ${channel.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{channel.name}</span>
                </button>
              );
            })}
          </div>

          {/* Copy Link Input Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.05] border border-white/10">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 text-xs text-white/70 font-mono focus:outline-none truncate"
            />
            <Button
              size="sm"
              onClick={handleCopyLink}
              className={`rounded-xl px-4 text-xs font-bold transition-all ${
                copied
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
