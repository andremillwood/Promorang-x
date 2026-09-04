import { Link } from "react-router-dom";
import { humanActionLabel } from "@promorang/shared";
import { useWhatHappened } from "@/hooks/usePeopleExperience";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";

export type PersonReceipt = {
  actor: string;
  momentTitle: string;
  counted: string;
  keep: string;
  href?: string;
};

export function PersonReceiptCallout({
  actor,
  momentTitle,
  counted,
  keep,
  href,
}: PersonReceipt) {
  const inner = (
    <PaperReceipt
      heading="It counted"
      lines={[
        { label: "Who", value: actor, strong: true },
        { label: "Moment", value: momentTitle },
        { label: "What counted", value: counted },
        { label: "They keep", value: keep, strong: true },
      ]}
      footer="Person + Moment + proof. That is the object, not a feed toast."
    />
  );

  if (!href) return inner;
  return (
    <Link to={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
      {inner}
    </Link>
  );
}

export function LatestPersonReceipt({ fallback }: { fallback?: PersonReceipt | null }) {
  const happened = useWhatHappened();
  const latest = happened.data?.recent?.[0];
  const receipt: PersonReceipt | null = latest
    ? {
        actor: latest.actorName || "Someone",
        momentTitle: latest.momentTitle || latest.action_metadata?.moment_title || "A Moment",
        counted: humanActionLabel(latest.counted || latest.action_type),
        keep:
          latest.keep ||
          latest.action_metadata?.reward ||
          latest.action_metadata?.perk ||
          (latest.amount ? `J$${Math.round(Number(latest.amount)).toLocaleString()}` : "The proof of showing up"),
        href: latest.moment_id ? `/moments/${latest.moment_id}` : "/progress",
      }
    : fallback || null;

  if (!receipt) return null;

  return (
    <section className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/80">Who just moved</p>
      <PersonReceiptCallout {...receipt} />
    </section>
  );
}
