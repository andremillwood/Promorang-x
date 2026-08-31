import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { hapticAudio } from "@/lib/hapticAudio";
import { TactileButton } from "@/components/ui/TactileButton";
import { PaperReceipt, StatusChip } from "@/components/promorang/SignatureObjects";
import { useI18n } from "@/i18n/I18nContext";
import nodeAmmCore from "@/assets/nodes/node-amm-core.jpg";
import nodeMerchantVault from "@/assets/nodes/node-merchant-vault.jpg";
import nodeCreatorPrism from "@/assets/nodes/node-creator-prism.jpg";

interface TangibleNodeCardProps {
  serialNumber?: string;
  nodeName: string;
  nodeCategory: string;
  nodeType?: "amm_liquidity" | "merchant_coupon_float" | "bounty_settlement";
  userTier?: "free" | "premium" | "super";
  stakedAmount: number;
  multiplier: number;
  totalTickets: number;
  onIgniteStake?: () => void;
}

export const TangibleNodeCard = ({
  serialNumber = "PRM-0842-X",
  nodeName = "Local perks pot",
  nodeType = "merchant_coupon_float",
  userTier = "premium",
  stakedAmount = 1000,
  multiplier = 3,
  totalTickets = 345,
  onIgniteStake,
}: TangibleNodeCardProps) => {
  const { t, formatNumber } = useI18n();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 18);
    setRotateY(x / 18);
  };

  const handleIgnition = () => {
    try {
      triggerHaptic("heavy");
      hapticAudio.playSuccess();
    } catch {
      // Audio/haptics are optional in preview.
    }
    setSaved(true);
    onIgniteStake?.();
    window.setTimeout(() => setSaved(false), 2500);
  };

  const artwork =
    nodeType === "amm_liquidity" ? nodeAmmCore : nodeType === "bounty_settlement" ? nodeCreatorPrism : nodeMerchantVault;

  return (
    <div style={{ perspective: 1000 }} className="mx-auto w-full max-w-lg" onMouseMove={handleMouseMove} onMouseLeave={() => { setRotateX(0); setRotateY(0); }}>
      <article
        ref={cardRef}
        style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transition: "transform 0.15s ease-out" }}
        className="overflow-hidden rounded-[1.8rem] border border-amber-400/30 bg-[#120e0a] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={artwork} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120e0a] via-[#120e0a]/30 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <StatusChip ok>{t("nodesHub.yourMoney")}</StatusChip>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-mono text-[10px] tracking-[0.18em] text-amber-200/80">{serialNumber}</p>
            <h3 className="mt-1 font-serif text-2xl font-bold text-white">{nodeName}</h3>
            <p className="text-sm text-white/70">{t("nodesHub.memberPass", { tier: userTier })}</p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <PaperReceipt
            heading={t("nodesHub.yourPot")}
            lines={[
              { label: t("nodesHub.setAside"), value: `$${formatNumber(stakedAmount)}`, strong: true },
              { label: t("nodesHub.takeOut"), value: t("nodesHub.anytime") },
              { label: t("nodesHub.drawTickets"), value: t("nodesHub.ticketMult", { tickets: formatNumber(totalTickets), multiplier }) },
            ]}
            footer={t("nodesHub.potFooter")}
          />
          <TactileButton variant={saved ? "success" : "vault"} size="lg" fullWidth onClick={handleIgnition} disabled={saved}>
            {saved ? t("nodesHub.setAsideDone") : t("nodesHub.setAsideCta")}
          </TactileButton>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {t("nodesHub.potDisclaimer")}
          </p>
          <p className="sr-only" aria-live="polite">
            {saved ? t("nodesHub.srSaved") : t("nodesHub.srReady")}
          </p>
        </div>
      </article>
    </div>
  );
};
