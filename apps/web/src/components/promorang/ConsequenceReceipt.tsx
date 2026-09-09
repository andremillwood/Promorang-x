import { Link } from "react-router-dom";
import type { WorldConsequenceReceipt } from "@promorang/shared";
import { CollectibleRelic, PaperReceipt } from "@/components/promorang/SignatureObjects";

export function ConsequenceReceipt({
  receipt,
  reveal,
}: {
  receipt: WorldConsequenceReceipt;
  reveal?: { title: string; origin: string; perk: string; scene?: string; place?: string; date?: string } | null;
}) {
  return (
    <div className="space-y-5">
      <PaperReceipt heading={receipt.heading} lines={receipt.lines} footer={receipt.footer} pictures={receipt.pictures} />
      {reveal ? (
        <CollectibleRelic
          serial="MEMORY · VERIFIED"
          title={reveal.title}
          origin={reveal.origin}
          perk={reveal.perk}
          scene={reveal.scene}
          place={reveal.place}
          verifiedDate={reveal.date}
        />
      ) : null}
      {receipt.next ? (
        <Link
          to={receipt.next.href}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-black"
        >
          {receipt.next.label}
        </Link>
      ) : null}
    </div>
  );
}
