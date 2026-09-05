import { Link } from "react-router-dom";
import { useMyPromoCard } from "@/hooks/usePeopleExperience";
import { PromoCardSummary } from "./PromoCardSummary";

export function DigitalPromoCard() {
  const card = useMyPromoCard();
  if (card.isLoading) return <p role="status">Loading your PromoCard…</p>;
  if (card.isError) return <Link to="/card">Open your PromoCard to try again</Link>;
  return (
    <Link to="/card" className="block">
      <PromoCardSummary holder={card.data?.name || "Member"} perks={card.data?.perks || []} />
      <span className="mt-3 block text-sm font-bold text-primary">Open your benefits</span>
    </Link>
  );
}
