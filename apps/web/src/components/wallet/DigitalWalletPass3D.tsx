import { useState } from "react";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { Sparkles, ShieldCheck, Gem, KeyRound, Coins, Flame } from "lucide-react";
import PromoKeyForgeModal from "@/components/wallet/PromoKeyForgeModal";
import { useI18n } from "@/i18n/I18nContext";
import { getPromoKeyAccessState } from "@/lib/promo-key-access";

interface DigitalWalletPass3DProps {
  displayName?: string | null;
  userEmail?: string | null;
  points?: number;
  promoKeys?: number;
  gems?: number;
  userId?: string | null;
  userTier?: string;
  onBalanceUpdate?: (newPoints: number, newKeys: number) => void;
}

export function DigitalWalletPass3D({
  displayName,
  userEmail,
  points = 0,
  promoKeys = 0,
  gems = 0,
  userId,
  userTier = "Starter",
  onBalanceUpdate,
}: DigitalWalletPass3DProps) {
  const { t, formatNumber } = useI18n();
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [localPoints, setLocalPoints] = useState(points);
  const [localKeys, setLocalKeys] = useState(promoKeys);
  const keyAccess = getPromoKeyAccessState(localPoints);

  // Format simulated member pass code from user ID or default
  const passIdRaw = (userId || "876049210038").replace(/[^a-zA-Z0-9]/g, "").padEnd(12, "0").toUpperCase();
  const passFormatted = `PROMO • ${passIdRaw.slice(0, 4)} • ${passIdRaw.slice(4, 8)} • ${passIdRaw.slice(8, 12)}`;

  const nameToShow = displayName || (userEmail ? userEmail.split("@")[0] : "Verified Member");

  const handleForgeSuccess = (newPoints: number, newKeys: number) => {
    setLocalPoints(newPoints);
    setLocalKeys(newKeys);
    if (onBalanceUpdate) onBalanceUpdate(newPoints, newKeys);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[420px]">
      <TiltCard3D
        maxTilt={14}
        perspective={1200}
        scaleOnHover={1.03}
        className="w-full"
      >
        <div className="relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-neutral-900 via-[#16121a] to-[#0a080c] p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-2xl">
          {/* Holographic Mesh & Shimmer Background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,106,0,0.28),transparent_42%),radial-gradient(circle_at_20%_85%,rgba(168,85,247,0.22),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_50%)]"
          />

          {/* Diagonal Micro-Texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"
          />

          {/* Top Bar: Hologram Chip & Pass Branding */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-9 items-center justify-center rounded-md border border-amber-400/40 bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-amber-600/40 shadow-inner">
                <div className="h-4 w-6 rounded border border-amber-300/30 bg-amber-400/10" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                Promorang Pass
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
              <ShieldCheck className="h-3 w-3" />
              Active
            </div>
          </div>

          {/* Middle: Member ID & Balances */}
          <div className="relative z-10 my-4 space-y-3">
            <p className="font-mono text-xs tracking-widest text-white/50">{passFormatted}</p>
            
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md">
              <div className="text-left">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  <Coins className="h-2.5 w-2.5" />
                  Pts
                </div>
                <p className="mt-0.5 text-sm font-black text-white">{localPoints.toLocaleString()}</p>
              </div>
              <div className="text-left border-l border-white/10 pl-2.5">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                  <KeyRound className="h-2.5 w-2.5" />
                  Keys
                </div>
                <p className="mt-0.5 text-sm font-black text-white">{localKeys.toLocaleString()}</p>
              </div>
              <div className="text-left border-l border-white/10 pl-2.5">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-400">
                  <Gem className="h-2.5 w-2.5" />
                  Gems
                </div>
                <p className="mt-0.5 text-sm font-black text-white">{gems.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Holder Name & Security Foil */}
          <div className="relative z-10 flex items-end justify-between border-t border-white/10 pt-2.5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Cardholder</p>
              <p className="text-xs font-black uppercase tracking-wider text-white line-clamp-1">{nameToShow}</p>
            </div>
            <div className="flex items-center gap-1.5 text-white/60">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">{userTier}</span>
            </div>
          </div>
        </div>
      </TiltCard3D>

      <button
        onClick={() => setIsForgeOpen(true)}
        className="w-full space-y-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-amber-300 transition-all hover:scale-[1.01] hover:bg-amber-500/20"
      >
        <span className="flex items-center justify-center gap-2 text-xs font-bold">
          <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          {t("wallet.unlockOutcome")}
        </span>
        <span className="block text-[10px] font-semibold text-amber-200/80">
          {keyAccess.canConvert
            ? t(keyAccess.readyCount === 1 ? "wallet.unlockReady" : "wallet.unlockReadyPlural", { count: formatNumber(keyAccess.readyCount) })
            : t("wallet.unlockNeed", { count: formatNumber(keyAccess.pointsNeeded) })}
        </span>
        {!keyAccess.canConvert && (
          <span className="mx-auto block h-1 max-w-[180px] overflow-hidden rounded-full bg-black/40">
            <span className="block h-full rounded-full bg-amber-400" style={{ width: `${keyAccess.progress}%` }} />
          </span>
        )}
      </button>

      <PromoKeyForgeModal
        isOpen={isForgeOpen}
        onClose={() => setIsForgeOpen(false)}
        userPoints={localPoints}
        currentPromoKeys={localKeys}
        onForgeSuccess={handleForgeSuccess}
      />
    </div>
  );
}

