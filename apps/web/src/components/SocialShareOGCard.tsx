import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Calendar, Share2, Copy, Check, ExternalLink, Gift, Sparkles, MessageCircle, Twitter } from "lucide-react";

interface SocialShareOGCardProps {
  isOpen: boolean;
  onClose: () => void;
  moment: {
    id: string;
    title: string;
    description?: string | null;
    venue_name?: string | null;
    location?: string | null;
    starts_at?: string | null;
    reward?: string | null;
    image_url?: string | null;
    banner_image_url?: string | null;
  };
}

export const SocialShareOGCard: React.FC<SocialShareOGCardProps> = ({
  isOpen,
  onClose,
  moment,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/moments/${moment.id}`;
  const shareText = `Check out ${moment.title} on Promorang! ${moment.reward ? `Reward: ${moment.reward}` : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-popover text-popover-foreground border border-border rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#ff5500]" /> Share Moment & Invite Friends
          </DialogTitle>
        </DialogHeader>

        {/* High-Impact Visual OG Card Preview */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#16161a] p-5 space-y-4 shadow-xl group">
          <div className="relative h-40 w-full rounded-xl overflow-hidden bg-black">
            {moment.banner_image_url || moment.image_url ? (
              <img
                src={moment.banner_image_url || moment.image_url}
                alt={moment.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#ff5500]/30 via-[#18181c] to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#16161a] via-transparent to-transparent" />
            <Badge className="absolute top-3 left-3 bg-black/70 text-white backdrop-blur-md border border-white/10 font-bold text-[10px]">
              Promorang Moment
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-white leading-tight">{moment.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#ff5500]" /> {moment.venue_name || moment.location || "Venue"}
              </span>
              {moment.starts_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[#ff5500]" /> {new Date(moment.starts_at).toLocaleDateString()}
                </span>
              )}
            </div>
            {moment.reward && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                <Gift className="h-3.5 w-3.5" /> Perk: {moment.reward}
              </div>
            )}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={handleWhatsApp}
            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs py-5"
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp
          </Button>
          <Button
            onClick={handleTwitter}
            className="rounded-xl bg-sky-600 text-white hover:bg-sky-700 font-bold text-xs py-5"
          >
            <Twitter className="mr-2 h-4 w-4" /> Share on X
          </Button>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted text-foreground text-xs focus:outline-none"
          />
          <Button
            onClick={handleCopy}
            className="rounded-xl bg-[#ff5500] text-white hover:bg-[#e04b00] font-bold text-xs h-10 px-4 shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
