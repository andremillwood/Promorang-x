import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Copy, Check, Sparkles, MessageCircle, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePromoShareRail } from '@/hooks/usePromoShareRail';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateReferralCode } from '@/hooks/useReferrals';
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
  /** Human reason to distribute this object. Sharing remains optional. */
  shareReason?: string;
}

const OBJECT_TYPE_KEYS: Record<ShareableObjectType, TranslationKey> = {
  perk: 'promoShare.typePerk',
  discovery: 'promoShare.typeDiscovery',
  moment: 'promoShare.typeMoment',
  mission: 'promoShare.typeMission',
  piece: 'promoShare.typePiece',
  campaign: 'promoShare.typeCampaign',
  creator: 'promoShare.typeCreator',
};

const DEFAULT_SHARE_REASON: Record<ShareableObjectType, string> = {
  perk: 'Send useful access to someone who may genuinely want to use it.',
  discovery: 'Bring more real voices into the choice so the result is more useful.',
  moment: 'Help someone discover a Moment they may actually want to join.',
  mission: 'Invite someone into a Challenge that is worth completing.',
  piece: 'Help a useful piece of content reach the people it was made for.',
  campaign: 'Help this activation reach people who fit the opportunity.',
  creator: 'Help someone discover a creator whose work may matter to them.',
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
  shareReason,
}) => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { generateShareLink, referralCode, referralCodeRecorded } = usePromoShareRail();
  const createReferralCode = useCreateReferralCode();
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSheetCompleted, setShareSheetCompleted] = useState(false);

  const label = buttonLabel ?? 'Share this';
  const whyShare = shareReason || DEFAULT_SHARE_REASON[objectType];
  const finalShareUrl = explicitShareUrl || generateShareLink(objectType, objectId, slugOrPath);
  const hasRewardRule = Boolean(
    potentialReward &&
    ((potentialReward.promoPoints || 0) > 0 || (potentialReward.gems || 0) > 0 || (potentialReward.tickets || 0) > 0),
  );

  const rewardSummary = [
    potentialReward?.promoPoints ? `${potentialReward.promoPoints} points` : null,
    potentialReward?.gems ? `${potentialReward.gems} Gems` : null,
    potentialReward?.tickets ? `${potentialReward.tickets} draw ${potentialReward.tickets === 1 ? 'entry' : 'entries'}` : null,
  ].filter(Boolean).join(' · ');

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(finalShareUrl);
      setCopied(true);
      toast.success('Link copied', {
        description: 'Copying a link is not a verified referral, conversion, or reward issuance.',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(t('promoShare.copyFailed'));
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareViaWhatsApp(title, finalShareUrl);
    toast.info('Share opened', {
      description: 'PromoShare attribution begins only when the linked activity is recorded; opening WhatsApp does not issue a reward.',
    });
  };

  const handleTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareViaTwitter(title, finalShareUrl);
    toast.info('Share opened', {
      description: 'Opening a share destination is not a verified referral, conversion, or reward.',
    });
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || t('promoShare.checkOut', { title }),
          url: finalShareUrl,
        });
        setShareSheetCompleted(true);
        toast.success('Share sheet completed', {
          description: 'A share is not itself a conversion or reward. Any later attribution must be recorded separately.',
        });
        return;
      } catch {
        // Cancellation or unsupported destination falls through to the explicit share dialog.
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
          title={t('promoShare.promoteTitle', { title })}
          aria-label={t('promoShare.shareAria')}
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
          <span>{shareSheetCompleted ? 'Shared' : label}</span>
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
          <span>{hasRewardRule ? 'Share · attributed action may qualify' : 'Share with PromoShare'}</span>
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
        <span>{shareSheetCompleted ? 'Shared' : label}</span>
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
              <span>{t('promoShare.rail')}</span>
            </div>
            <DialogTitle className="text-xl font-black text-white">{title}</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              {t('promoShare.shareThis', { type: t(OBJECT_TYPE_KEYS[objectType]) })}
            </DialogDescription>
          </DialogHeader>

          <div className="my-3 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Why move this?</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-zinc-400">{whyShare}</p>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-zinc-900 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Share2 className="w-4 h-4 text-orange-400" />
                <span>How credit works</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                {['Share', 'Arrive', 'Act', 'Credit', 'Earn*'].map((step, index) => (
                  <div key={step} className="rounded-lg border border-white/8 bg-black/30 px-1 py-2">
                    <p className="text-[8px] font-black text-orange-300">{index + 1}</p>
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white/55">{step}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-zinc-400">
                A share can help something move without paying anything. Referral credit requires a recorded link. Affiliate or referral earnings only exist when a funded rule names the qualifying action and that action is verified.
              </p>
              {hasRewardRule ? (
                <p className="pt-2 text-[11px] font-bold leading-5 text-orange-300">
                  This object has a recorded rule: {rewardSummary}. {potentialReward?.condition || 'The configured attributed action must be verified.'}
                </p>
              ) : (
                <p className="pt-2 text-[11px] leading-5 text-white/35">*No reward rule is attached to this share right now.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {referralCodeRecorded
                ? t('promoShare.linkLabel', { code: referralCode || '' })
                : 'Share link · no referral attribution code recorded'}
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
                <span>{copied ? t('promoShare.copied') : t('promoShare.copy')}</span>
              </Button>
            </div>
          </div>

          {!referralCodeRecorded && !explicitShareUrl ? (
            <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3">
              <p className="text-[11px] leading-5 text-amber-100/65">
                This link is shareable, but PROMORANG cannot credit later referral activity to you until you create a recorded referral code.
              </p>
              {user ? (
                <button
                  type="button"
                  disabled={createReferralCode.isPending}
                  onClick={(event) => {
                    event.stopPropagation();
                    createReferralCode.mutate();
                  }}
                  className="mt-3 inline-flex min-h-9 items-center rounded-full bg-amber-300 px-4 text-[10px] font-black uppercase tracking-[0.1em] text-black disabled:opacity-50"
                >
                  {createReferralCode.isPending ? 'Creating…' : 'Create my tracked link'}
                </button>
              ) : (
                <Link
                  to={`/auth?mode=signup&next=${encodeURIComponent(window.location.pathname)}`}
                  className="mt-3 inline-flex min-h-9 items-center rounded-full bg-amber-300 px-4 text-[10px] font-black uppercase tracking-[0.1em] text-black"
                >
                  Sign in for tracked credit
                </Link>
              )}
            </div>
          ) : referralCodeRecorded ? (
            <p className="mt-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-3 text-[11px] leading-5 text-emerald-100/65">
              Your recorded referral code is attached. PROMORANG can attribute later eligible referral activity when the linked journey is actually recorded.
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('promoShare.whatsapp')}</span>
            </button>
            <button
              onClick={handleTwitter}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-400 text-xs font-bold transition-all"
            >
              <Twitter className="w-4 h-4" />
              <span>{t('promoShare.twitter')}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
