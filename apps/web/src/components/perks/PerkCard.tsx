import React, { useState } from 'react';
import { Perk } from '@/types/perk';
import { usePerks } from '@/hooks/usePerks';
import { PromoShareAction } from '@/components/promoshare/PromoShareAction';
import { 
  Gift, 
  Sparkles, 
  MapPin, 
  Clock, 
  Bookmark, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Tag, 
  ArrowRight,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { writePromoCardMark } from '@/lib/promocard/life';

interface PerkCardProps {
  perk: Perk;
  onSelect?: (perk: Perk) => void;
  showMerchantHeader?: boolean;
}

export const PerkCard: React.FC<PerkCardProps> = ({
  perk,
  onSelect,
  showMerchantHeader = true,
}) => {
  const { claimPerk, toggleSave, isClaiming, redeemPerk, isRedeeming } = usePerks();
  const { user } = useAuth();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const isClaimed = perk.userState?.isClaimed;
  const isSaved = perk.userState?.isSaved;
  const isRedeemed = perk.userState?.isRedeemed;

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isClaimed) {
      setQrModalOpen(true);
      return;
    }
    claimPerk(perk);
    if (user?.id) {
      writePromoCardMark(user.id, {
        kind: "landed",
        place: perk.merchantName || perk.title,
        id: `landed-${perk.id}`,
      });
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(perk.id);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQrModalOpen(true);
    if (onSelect) onSelect(perk);
  };

  const handleRedeemConfirm = () => {
    redeemPerk({ perkId: perk.id, code: perk.redemptionCode });
    if (user?.id) {
      writePromoCardMark(user.id, {
        kind: "spent",
        place: perk.merchantName || perk.title,
        id: `spent-${perk.id}`,
      });
    }
    setQrModalOpen(false);
  };

  const getPerkTypeLabel = (type: string) => {
    switch (type) {
      case 'complimentary_item': return 'Complimentary';
      case 'discount': return `${perk.discountValue}% Off`;
      case 'upgrade': return 'Upgrade';
      case 'access': return 'VIP Access';
      case 'experience': return 'Experience';
      case 'bundle': return 'Combo Drop';
      case 'limited_drop': return 'Limited Drop';
      default: return 'Special Perk';
    }
  };

  const remaining = perk.remainingQuantity ?? 25;
  const total = perk.availableQuantity ?? 50;
  const remainingPercent = Math.max(5, Math.min(100, Math.round((remaining / total) * 100)));

  return (
    <>
      <div 
        onClick={handleOpenModal}
        className="group relative rounded-3xl bg-zinc-900/90 border border-zinc-800/90 hover:border-orange-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-orange-500/5 cursor-pointer"
      >
        {/* Top Image Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
          {perk.imageUrl ? (
            <img 
              src={perk.imageUrl} 
              alt={perk.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
              <Gift className="w-12 h-12 text-orange-500/30" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <Badge className="bg-orange-500 text-black font-black text-xs px-3 py-1 uppercase tracking-wider border-none shadow-lg">
              {getPerkTypeLabel(perk.perkType)}
            </Badge>

            <button
              onClick={handleSave}
              className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black text-white/70 hover:text-orange-400 backdrop-blur-md transition-colors"
              title={isSaved ? "Saved to Vault" : "Save Perk"}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-orange-500 text-orange-500" : ""}`} />
            </button>
          </div>

          {/* Merchant Identity on Image */}
          {showMerchantHeader && perk.merchantName && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              {perk.merchantAvatar && (
                <img 
                  src={perk.merchantAvatar} 
                  alt="" 
                  className="w-7 h-7 rounded-full border border-white/20 object-cover" 
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate drop-shadow-md">
                  {perk.merchantName}
                </p>
                {perk.merchantLocation && (
                  <p className="text-[10px] text-zinc-300 flex items-center gap-1 drop-shadow-sm truncate">
                    <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                    <span>{perk.merchantLocation}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-black text-white group-hover:text-orange-300 transition-colors line-clamp-2 leading-snug">
              {perk.title}
            </h3>

            {perk.description && (
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                {perk.description}
              </p>
            )}
          </div>

          {/* Availability & Scarcity Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-zinc-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Available Drops</span>
              </span>
              <span className="font-mono text-orange-400 font-bold">
                {remaining} left of {total}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${remainingPercent}%` }} 
              />
            </div>
          </div>

          {/* Reward preview pill */}
          <div className="flex items-center justify-between py-2 px-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-[11px]">
            <span className="text-zinc-400 font-medium">Claim Reward</span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-orange-400">+{perk.rewardPoints || 25} Pts</span>
              <span className="text-purple-400">+{perk.promoShareTickets || 1} 🎟️</span>
            </div>
          </div>

          {/* CTAs: Claim / Redeem + PromoShare */}
          <div className="pt-2 flex items-center gap-2">
            <Button
              onClick={handleClaim}
              disabled={isClaiming || isRedeemed}
              className={`flex-1 font-bold text-xs rounded-xl transition-all shadow-md ${
                isRedeemed
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700"
                  : isClaimed
                  ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
                  : "bg-orange-500 hover:bg-orange-600 text-black shadow-orange-500/20"
              }`}
            >
              {isRedeemed ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Redeemed
                </span>
              ) : isClaimed ? (
                <span className="flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Use / Show Code
                </span>
              ) : (
                <span>Claim Perk</span>
              )}
            </Button>

            <PromoShareAction
              objectType="perk"
              objectId={perk.id}
              title={perk.title}
              description={perk.description}
              potentialReward={{
                promoPoints: perk.rewardPoints || 25,
                tickets: perk.promoShareTickets || 1,
                condition: "when someone claims through your link",
              }}
              variant="compact"
            />
          </div>
        </div>
      </div>

      {/* Full Redemption Modal & QR Code */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-6 rounded-3xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Promorang Perk</span>
            </div>
            <DialogTitle className="text-xl font-black text-white">{perk.title}</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Presented by <strong className="text-white">{perk.merchantName || 'Verified Merchant'}</strong>
            </DialogDescription>
          </DialogHeader>

          {/* QR Code Presentation Box */}
          <div className="my-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(perk.redemptionCode || perk.id)}`} 
                alt="Redemption QR Code"
                className="w-40 h-40"
              />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest">Redemption Code</p>
              <p className="text-xl font-mono font-black text-orange-400 tracking-wider bg-black/60 px-4 py-1.5 rounded-xl border border-white/10">
                {perk.redemptionCode || 'PRK-PROMO876'}
              </p>
            </div>

            <p className="text-xs text-zinc-400 max-w-xs">
              Show this QR code to merchant staff upon order or entry. Staff will scan or verify code to validate.
            </p>
          </div>

          {/* Terms & Claim status */}
          <div className="text-[11px] text-zinc-400 space-y-1.5 bg-black/40 p-3 rounded-2xl border border-white/5">
            <p><strong className="text-white">Terms:</strong> {perk.terms || 'Valid on location. Cannot be combined with other offers.'}</p>
            {perk.claimRequirement && <p><strong className="text-white">Unlock Requirement:</strong> {perk.claimRequirement}</p>}
          </div>

          <div className="mt-4 flex items-center gap-3">
            {!isRedeemed && (
              <Button
                onClick={handleRedeemConfirm}
                disabled={isRedeeming}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs py-3 rounded-xl shadow-lg"
              >
                Confirm In-Person Redemption
              </Button>
            )}
            <Button
              onClick={() => setQrModalOpen(false)}
              variant="outline"
              className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs py-3 rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
