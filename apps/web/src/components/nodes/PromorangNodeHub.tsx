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
      actorName: "Community pot",
      actionType: "commerce",
      actionTitle: "Set money aside in a community pot",
      targetEntity: "Local perks & check-in float",
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "verified",
      verificationMethod: "Promorang savings record",
      proofHash: `0x${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      hostQuote: "This money still belongs to you. It backs local perks until you take it out.",
      hostSigner: "Promorang community pots",
      metrics: [
        { label: "Set aside", value: `$${amount}.00`, highlight: true },
        { label: "Free draw tickets", value: `+${(amount * multiplier) / 10} tickets` },
        { label: "Can withdraw", value: "Anytime" },
      ],
      rewards: [
        { type: "cash", label: "Your money, still yours", value: `$${amount}.00` },
        { type: "keys", label: "Prize draw entries", value: `+${Math.floor((amount / 10) * multiplier)} tickets` },
      ],
    };

    setActiveReceipt(newReceipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 text-white md:px-6">
      <header className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-amber-300">Save & Win</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.05] md:text-6xl">
            Set money aside. Stay in the draws. Take it out whenever.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300 md:text-lg">
            Community pots back local discounts and check-ins. You keep 100% of what you put in. While it sits there, you collect free tickets into weekly and monthly prize draws.
          </p>
          <div className="mt-6 max-w-xl">
            <PlainEnglish>
              This is not investing. It is money in a jar that also buys you raffle tickets. The jar is still yours.
            </PlainEnglish>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusChip ok>{userTier} member · {multiplier}× tickets</StatusChip>
            <StatusChip>
              <Flame className="h-3.5 w-3.5 text-amber-300" /> {streakDays}-day streak · +{streakBoostPct}%
            </StatusChip>
            <StatusChip>{totalTickets.toLocaleString()} tickets in hand</StatusChip>
          </div>
        </div>
        <TangibleNodeCard
          nodeName="Local perks pot"
          nodeCategory="Partner discounts"
          userTier={userTier}
          stakedAmount={stakedBalance}
          multiplier={multiplier}
          totalTickets={totalTickets}
          onIgniteStake={() => handleSave("pieces-amm-node", 100)}
        />
      </header>

      <NightTrail
        eyebrow="How a pot works"
        title="Four beats, zero loss"
        steps={[
          { label: "Set aside", title: "You park some money", text: "It still belongs to you. Pull it out whenever you want." },
          { label: "It works", title: "Shops use that parked money", text: "It helps power discounts and check-in perks nearby." },
          { label: "Tickets", title: "You get draw entries", text: "Membership and streaks can multiply how many tickets you hold." },
          { label: "Draw", title: "Sunday and month-end", text: "If you win, the prize is extra. If you don't, your money is still there." },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <NodeLiveTelemetryTicker />
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-[0.2em] text-primary">This week's tickets</p>
          <h2 className="font-serif text-3xl font-bold">Three pots. Pick the night.</h2>
          <TicketPass
            kicker="Weekly · everyone"
            title="Sunday community treat"
            detail={`$1,250 already in. You are holding ${totalTickets} tickets. Funded by check-ins and local sponsors.`}
            stub="SUN"
            stubLabel="Draw"
          />
          <article className="overflow-hidden rounded-[1.6rem] border border-amber-400/30">
            <div className="relative h-36">
              <img src={jackpotMegaVault} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120e0a] to-transparent" />
              <p className="absolute bottom-3 left-4 font-serif text-xl font-bold text-white">Monthly city mega pot · $6,500</p>
            </div>
            <div className="bg-[#120e0a] p-4 text-sm text-zinc-300">
              Pro and Super members. Built from city-wide shopping and venue check-ins.
            </div>
          </article>
          <TicketPass
            kicker="Season · Super members"
            title="Season champion pot"
            detail="$35,000 at season end for people who kept showing up."
            stub="S3"
            stubLabel="Season"
          />
          {userTier !== "super" ? (
            <TactileButton variant="obsidian" size="lg" fullWidth onClick={onUpgradeTier}>
              See Super for the season pot
            </TactileButton>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pb-4">
        <TactileButton variant="primary" size="lg" asChild>
          <Link to="/economy">
            How the rest of Promorang works
            <ArrowRight className="h-4 w-4" />
          </Link>
        </TactileButton>
        <TactileButton variant="obsidian" size="lg" asChild>
          <Link to="/explore/moments">Go find a Moment</Link>
        </TactileButton>
      </div>

      {activeReceipt ? (
        <ProofReceiptModal isOpen={isReceiptModalOpen} receipt={activeReceipt} onClose={() => setIsReceiptModalOpen(false)} />
      ) : null}
    </div>
  );
};
