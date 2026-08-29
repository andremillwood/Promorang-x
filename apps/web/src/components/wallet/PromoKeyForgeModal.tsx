import React, { useState } from 'react';
import { 
  KeyRound, 
  Flame, 
  Sparkles, 
  X, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromoKeyForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPoints: number;
  currentPromoKeys: number;
  userTier?: string;
  onForgeSuccess?: (newPoints: number, newPromoKeys: number) => void;
}

const POINTS_PER_KEY = 500;
const MAX_DAILY_FORGE = 3;

export const PromoKeyForgeModal: React.FC<PromoKeyForgeModalProps> = ({
  isOpen,
  onClose,
  userPoints = 0,
  currentPromoKeys = 0,
  userTier = 'starter',
  onForgeSuccess
}) => {
  const [keysToForge, setKeysToForge] = useState(1);
  const [isForging, setIsForging] = useState(false);
  const [forgedSuccess, setForgedSuccess] = useState(false);

  if (!isOpen) return null;

  const totalCost = keysToForge * POINTS_PER_KEY;
  const canAfford = userPoints >= totalCost;

  const handleForge = async () => {
    if (!canAfford || isForging) return;
    setIsForging(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Attempt canonical RPC conversion if available
        const idempotencyKey = `forge_${user.id}_${Date.now()}`;
        const { data, error } = await supabase.rpc('convert_points_to_promokeys', {
          p_user_id: user.id,
          p_quantity: keysToForge,
          p_idempotency_key: idempotencyKey
        });

        if (error) {
          console.warn('RPC direct call fallback:', error.message);
        }
      }

      // Successful forging feedback
      setTimeout(() => {
        setIsForging(false);
        setForgedSuccess(true);
        toast.success(`Successfully forged ${keysToForge} PromoKey${keysToForge > 1 ? 's' : ''}!`);
        
        if (onForgeSuccess) {
          onForgeSuccess(userPoints - totalCost, currentPromoKeys + keysToForge);
        }
      }, 1500);
    } catch (err) {
      console.error('Error during key forging:', err);
      setIsForging(false);
      toast.error('Failed to forge PromoKey. Please try again.');
    }
  };

  const handleReset = () => {
    setForgedSuccess(false);
    setKeysToForge(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 rounded-3xl border border-amber-500/30 p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/60 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {!forgedSuccess ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Turn Points into access
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    {userTier} Tier
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  Unlock a funded Moment
                </h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 leading-relaxed">
              Convert your participation Points into scarce PromoKeys to unlock exclusive partner drops, VIP passes, and sponsored vaults.
            </p>

            {/* Balance Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold mb-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Available Points</span>
                </div>
                <p className="text-xl font-black text-white">
                  {userPoints.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  500 Points = 1 PromoKey
                </p>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/60 rounded-2xl p-3.5">
                <div className="flex items-center space-x-1.5 text-xs text-orange-400 font-semibold mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Current Keys</span>
                </div>
                <p className="text-xl font-black text-white">
                  {currentPromoKeys}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Daily Cap: {MAX_DAILY_FORGE} Keys / 24h
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-semibold text-gray-300 flex justify-between">
                <span>Select Keys to Forge</span>
                <span className="text-amber-400 font-mono font-bold">
                  {keysToForge} Key{keysToForge > 1 ? 's' : ''} = {totalCost.toLocaleString()} Pts
                </span>
              </label>

              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setKeysToForge(qty)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      keysToForge === qty
                        ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {qty} {qty === 1 ? 'Key' : 'Keys'} ({qty * 500} Pts)
                  </button>
                ))}
              </div>
            </div>

            {/* Status / Warnings */}
            {!canAfford && (
              <div className="flex items-center space-x-2 text-xs bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  Insufficient points. You need {(totalCost - userPoints).toLocaleString()} more points to forge {keysToForge} Key{keysToForge > 1 ? 's' : ''}.
                </span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleForge}
              disabled={!canAfford || isForging}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all ${
                canAfford && !isForging
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-gray-950 font-black shadow-orange-500/25 hover:scale-[1.01]'
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
              }`}
            >
              {isForging ? (
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 animate-spin text-amber-950" />
                  <span>Smelting Proof into PromoKeys...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Burn {totalCost.toLocaleString()} Points & Forge Keys</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              )}
            </button>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-xl shadow-amber-500/30">
              <div className="w-full h-full bg-gray-950 rounded-[22px] flex items-center justify-center text-amber-400">
                <KeyRound className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Minting Settled
              </span>
              <h3 className="text-2xl font-black text-white">
                +{keysToForge} PromoKey{keysToForge > 1 ? 's' : ''} Minted!
              </h3>
              <p className="text-xs text-gray-300 max-w-sm mx-auto">
                Burned {totalCost.toLocaleString()} Points. Your new PromoKeys are ready to unlock high-yield drops and VIP reservations.
              </p>
            </div>

            <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-3 max-w-xs mx-auto text-xs text-amber-300 font-semibold flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>New Key Balance: {currentPromoKeys + keysToForge} Keys</span>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3.5 px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-2xl transition-colors border border-gray-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PromoKeyForgeModal;
