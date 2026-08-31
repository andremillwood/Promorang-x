import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import { TangibleNodeCard } from "./TangibleNodeCard";
import { NodeLiveTelemetryTicker } from "./NodeLiveTelemetryTicker";
import jackpotMegaVault from "@/assets/nodes/jackpot-mega-vault.jpg";
import { ProofReceiptModal } from "@/components/value/ProofReceiptModal";
import { ValueReceiptData } from "@/components/value/TactileValueReceipt";
import { TactileButton } from "@/components/ui/TactileButton";
import { NightTrail, PlainEnglish, StatusChip, TicketPass } from "@/components/promorang/SignatureObjects";
import { useI18n } from "@/i18n/I18nContext";

interface NodeHubProps {
  userTier?: "free" | "premium" | "super";
  streakDays?: number;
  stakedBalance?: number;
  onUpgradeTier?: () => void;
  onStake?: (nodeId: string, amount: number) => void;
}

export const PromorangNodeHub = ({
  userTier = "premium",
  streakDays = 28,
  stakedBalance = 500,
  onUpgradeTier,
  onStake,
}: NodeHubProps) => {
  const { t, formatNumber, formatDate } = useI18n();
  const [activeReceipt, setActiveReceipt] = useState<ValueReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const multiplier = userTier === "super" ? 10 : userTier === "premium" ? 3 : 1;
  const baseTickets = Math.floor(stakedBalance / 10);
  const streakBoostPct = Math.round(Math.min(streakDays, 365) * 0.5);
  const totalTickets = Math.floor(baseTickets * multiplier * (1 + streakBoostPct / 100));

  const handleSave = (vaultId: string, amount: number) => {
    onStake?.(vaultId, amount);

    const newReceipt: ValueReceiptData = {
      id: `rec_node_stake_${Date.now()}`,
      receiptNumber: `REC-VAULT-${Math.floor(1000 + Math.random() * 9000)}`,
      actorHandle: "@community_backer",
      actorName: t("nodesHub.actorName"),
      actionType: "commerce",
      actionTitle: t("nodesHub.receiptAction"),
      targetEntity: t("nodesHub.receiptTarget"),
      timestamp: formatDate(new Date(), { month: "short", day: "numeric", year: "numeric" }),
      status: "verified",
      verificationMethod: t("nodesHub.verificationMethod"),
      proofHash: `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      hostQuote: t("nodesHub.receiptHostQuote"),
      hostSigner: t("nodesHub.receiptHostSigner"),
      metrics: [
        { label: t("nodesHub.receiptSetAside"), value: `$${amount}.00`, highlight: true },
        { label: t("nodesHub.receiptTickets"), value: t("nodesHub.receiptTicketsValue", { count: (amount * multiplier) / 10 }) },
        { label: t("nodesHub.receiptWithdraw"), value: t("nodesHub.anytime") },
      ],
      rewards: [
        { type: "cash", label: t("nodesHub.receiptRewardMoney"), value: `$${amount}.00` },
        { type: "keys", label: t("nodesHub.receiptRewardTickets"), value: t("nodesHub.receiptTicketsValue", { count: Math.floor((amount / 10) * multiplier) }) },
      ],
    };

    setActiveReceipt(newReceipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 text-white md:px-6">
      <header className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-amber-300">{t("nodesHub.eyebrow")}</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.05] md:text-6xl">
            {t("nodesHub.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 md:text-lg">
            {t("nodesHub.copy")}
          </p>
          <div className="mt-6 max-w-xl">
            <PlainEnglish>
              {t("nodesHub.plainEnglish")}
            </PlainEnglish>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusChip ok>{t("nodesHub.memberTickets", { tier: userTier, multiplier })}</StatusChip>
            <StatusChip>
              <Flame className="h-3.5 w-3.5 text-amber-300" /> {t("nodesHub.streakBoost", { days: streakDays, pct: streakBoostPct })}
            </StatusChip>
            <StatusChip>{t("nodesHub.ticketsInHand", { count: formatNumber(totalTickets) })}</StatusChip>
          </div>
        </div>
        <TangibleNodeCard
          nodeName={t("nodesHub.localPerksPot")}
          nodeCategory={t("nodesHub.partnerDiscounts")}
          userTier={userTier}
          stakedAmount={stakedBalance}
          multiplier={multiplier}
          totalTickets={totalTickets}
          onIgniteStake={() => handleSave("pieces-amm-node", 100)}
        />
      </header>

      <NightTrail
        eyebrow={t("nodesHub.howEyebrow")}
        title={t("nodesHub.howTitle")}
        steps={[
          { label: t("nodesHub.step1Label"), title: t("nodesHub.step1Title"), text: t("nodesHub.step1Text") },
          { label: t("nodesHub.step2Label"), title: t("nodesHub.step2Title"), text: t("nodesHub.step2Text") },
          { label: t("nodesHub.step3Label"), title: t("nodesHub.step3Title"), text: t("nodesHub.step3Text") },
          { label: t("nodesHub.step4Label"), title: t("nodesHub.step4Title"), text: t("nodesHub.step4Text") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <NodeLiveTelemetryTicker />
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-[0.2em] text-primary">{t("nodesHub.thisWeek")}</p>
          <h2 className="font-serif text-3xl font-bold">{t("nodesHub.threePots")}</h2>
          <TicketPass
            kicker={t("nodesHub.weeklyKicker")}
            title={t("nodesHub.sundayTitle")}
            detail={t("nodesHub.sundayDetail", { count: totalTickets })}
            stub={t("nodesHub.sundayStub")}
            stubLabel={t("nodesHub.sundayStubLabel")}
          />
          <article className="overflow-hidden rounded-[1.6rem] border border-amber-400/30">
            <div className="relative h-36">
              <img src={jackpotMegaVault} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120e0a] to-transparent" />
              <p className="absolute bottom-3 left-4 font-serif text-xl font-bold text-white">{t("nodesHub.megaTitle")}</p>
            </div>
            <div className="bg-[#120e0a] p-4 text-sm text-zinc-300">
              {t("nodesHub.megaCopy")}
            </div>
          </article>
          <TicketPass
            kicker={t("nodesHub.seasonKicker")}
            title={t("nodesHub.seasonTitle")}
            detail={t("nodesHub.seasonDetail")}
            stub={t("nodesHub.seasonStub")}
            stubLabel={t("nodesHub.seasonStubLabel")}
          />
          {userTier !== "super" ? (
            <TactileButton variant="obsidian" size="lg" fullWidth onClick={onUpgradeTier}>
              {t("nodesHub.seeSuper")}
            </TactileButton>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pb-4">
        <TactileButton variant="primary" size="lg" asChild>
          <Link to="/economy">
            {t("nodesHub.howRest")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </TactileButton>
        <TactileButton variant="obsidian" size="lg" asChild>
          <Link to="/explore/moments">{t("nodesHub.findMoment")}</Link>
        </TactileButton>
      </div>

      {activeReceipt ? (
        <ProofReceiptModal isOpen={isReceiptModalOpen} receipt={activeReceipt} onClose={() => setIsReceiptModalOpen(false)} />
      ) : null}
    </div>
  );
};
