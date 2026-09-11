import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, MessageCircle, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePromoShareRail } from '@/hooks/usePromoShareRail';
import { ShareableObjectType, shareViaWhatsApp, shareViaTwitter } from '@/lib/promoShareRail';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

export interface PromoShareActionProps {
  objectType: ShareableObjectType;
  objectId: string;
  title: string;
  description?: string;
  slugOrPath?: string;
  shareUrl?: string;
  potentialReward?: {
    promoPoints?: number;
    gems?: number;
    tickets?: number;
    condition?: string;
  };
  variant?: 'button' | 'icon' | 'compact' | 'badge';
  className?: string;
  buttonLabel?: string;
}

const OBJECT_TYPE_KEYS: Record<ShareableObjectType, TranslationKey> = {
  perk: "promoShare.typePerk",
  discovery: "promoShare.typeDiscovery",
  moment: "promoShare.typeMoment",
  mission: "promoShare.typeMission",
  piece: "promoShare.typePiece",
  campaign: "promoShare.typeCampaign",
  creator: "promoShare.typeCreator",
};

export const PromoShareAction: React.FC<PromoShareActionProps> = ({
  objectType,
  objectId,
  title,
  description,
  slugOrPath,
  shareUrl: explicitShareUrl,
  potentialReward,
  variant = 'button',
  className = '',
  buttonLabel,
}) => {
  const { t } = useI18n();
  const { generateShareLink, referralCode } = usePromoShareRail();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const reward = potentialReward ?? { promoPoints: 25, tickets: 1 };
  const condition = reward.condition || t("promoShare.defaultCondition");
  const label = buttonLabel ?? t("promoShare.promote");
  const finalShareUrl = explicitShareUrl || generateShareLink(objectType, objectId, slugOrPath);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(finalShareUrl);
      }
      setCopied(true);
      setHasShared(true);
      toast.success(t("promoShare.copiedToast"));
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error(t("promoShare.copyFailed"));
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareViaWhatsApp(title, finalShareUrl);
    setHasShared(true);
  };

  const handleTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareViaTwitter(title, finalShareUrl);
    setHasShared(true);
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || t("promoShare.checkOut", { title }),
          url: finalShareUrl,
        });
        setHasShared(true);
        toast.success(t("promoShare.shared"));
        return;
      } catch (err) {
        // Fallback to modal if cancelled or unsupported
      }
    }
    setModalOpen(true);
  };

  const renderTrigger = () => {
    if (variant === 'icon') {
      return (
        <button
          onClick={handleNativeShare}
          className={`p-2 rounded-full bg-white/10 hover:bg-orange-500/20 text-white/70 hover:text-orange-400 border border-white/10 transition-all ${className}`}
          title={t("promoShare.promoteTitle", { title })}
          aria-label={t("promoShare.shareAria")}
        >
          <Share2 className="w-4 h-4" />
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          onClick={handleNativeShare}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-bold text-orange-400 transition-all ${className}`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{hasShared ? t("promoShare.shared") : label}</span>
        </button>
      );
    }

    if (variant === 'badge') {
      return (
        <span
          onClick={handleNativeShare}
          className={`cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all ${className}`}
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{t("promoShare.ticketOnShare", { count: String(reward.tickets || 1) })}</span>
        </span>
      );
    }

    return (
      <Button
        onClick={handleNativeShare}
        variant="outline"
        className={`border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 font-bold gap-2 text-xs rounded-xl ${className}`}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>{hasShared ? t("promoShare.shared") : label}</span>
        {reward.tickets && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-500/30 text-[10px] text-orange-300">
            +{reward.tickets} 🎟️
          </span>
        )}
      </Button>
    );
  };

  return (
    <>
      {renderTrigger()}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-6 rounded-3xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Share2 className="w-4 h-4" />
              <span>{t("promoShare.rail")}</span>
            </div>
            <DialogTitle className="text-xl font-black text-white">{title}</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              {t("promoShare.shareThis", { type: t(OBJECT_TYPE_KEYS[objectType]) })}
            </DialogDescription>
          </DialogHeader>

          {/* Reward attribution guarantee strip */}
          <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-zinc-900 to-purple-950/40 border border-orange-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t("promoShare.attribution")}</span>
              </span>
              <span className="font-mono text-orange-400 font-black">
                {t("promoShare.rewardLine", {
                  points: String(reward.promoPoints || 25),
                  tickets: String(reward.tickets || 1),
                })}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {t("promoShare.awarded", { condition })}
            </p>
          </div>

          {/* Copyable link input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {t("promoShare.linkLabel", { code: referralCode || "" })}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={finalShareUrl}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 font-mono focus:outline-none"
              />
              <Button
                onClick={handleCopy}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl px-4 text-xs gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t("promoShare.copied") : t("promoShare.copy")}</span>
              </Button>
            </div>
          </div>

          {/* Quick share options */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("promoShare.whatsapp")}</span>
            </button>
            <button
              onClick={handleTwitter}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-400 text-xs font-bold transition-all"
            >
              <Twitter className="w-4 h-4" />
              <span>{t("promoShare.twitter")}</span>
            </button>
          </div>

          {hasShared && (
            <div className="mt-4 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300 text-center animate-in fade-in">
              ✨ {t("promoShare.sharedBanner")}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
