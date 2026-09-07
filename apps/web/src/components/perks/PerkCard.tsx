import { LivePerkCard, type LivePerkLike } from "@/components/perks/LivePerkCard";

type PerkCardProps = {
  perk: LivePerkLike;
  intent?: "claim" | "share";
};

/** Live perk face. Claim and redeem only happen on a drop or at the merchant counter. */
export const PerkCard = ({ perk, intent = "claim" }: PerkCardProps) => (
  <LivePerkCard perk={perk} intent={intent} />
);
