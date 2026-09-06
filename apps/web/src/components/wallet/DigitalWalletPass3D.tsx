import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { PromoCardFace } from "@/components/promorang/SignatureObjects";
import PromoKeyForgeModal from "@/components/wallet/PromoKeyForgeModal";

interface DigitalWalletPass3DProps {
  displayName?: string | null;
  userEmail?: string | null;
  points?: number;
  promoKeys?: number;
  gems?: number;
  userId?: string | null;
  userTier?: string;
  onBalanceUpdate?: (newPoints: number, newKeys: number) => void;
  showForge?: boolean;
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
  showForge = true,
}: DigitalWalletPass3DProps) {
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [localPoints, setLocalPoints] = useState(points);
  const [localKeys, setLocalKeys] = useState(promoKeys);

  useEffect(() => {
    setLocalPoints(points);
    setLocalKeys(promoKeys);
  }, [points, promoKeys]);

  const nameToShow = displayName || (userEmail ? userEmail.split("@")[0] : "Verified Member");

  const handleForgeSuccess = (newPoints: number, newKeys: number) => {
    setLocalPoints(newPoints);
    setLocalKeys(newKeys);
    if (onBalanceUpdate) onBalanceUpdate(newPoints, newKeys);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[420px]">
      <PromoCardFace
        holder={nameToShow}
        userId={userId}
        userTier={userTier}
        points={localPoints}
        promoKeys={localKeys}
        gems={gems}
        tilt
      />

      {showForge ? (
        <button
          onClick={() => setIsForgeOpen(true)}
          className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Forge PromoKeys (500 Pts = 1 Key)</span>
        </button>
      ) : null}

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
