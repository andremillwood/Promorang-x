import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PaperReceipt, PromoCardFace } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";

export function PromoCardCheckoutDemo({
  holder = "Maya · East Austin",
}: {
  holder?: string;
}) {
  const [applied, setApplied] = useState(false);

  return (
    <div className="space-y-4">
      <PromoCardFace available={applied ? "$16.00" : "$24.00"} holder={holder} />
      <PaperReceipt
        heading={applied ? "Velvet Lounge" : "Ready at checkout"}
        lines={
          applied
            ? [
                { label: "Tasting flight", value: "$24.00" },
                { label: "PromoCard", value: "−$8.00", strong: true },
                { label: "You pay", value: "$16.00", strong: true },
              ]
            : [
                { label: "Tonight's bill", value: "$24.00" },
                { label: "Card ready", value: "$8.00 off" },
                { label: "You would pay", value: "$16.00" },
              ]
        }
        footer={applied ? "Saved $8. Check in to refill." : "Not a bank card. Just savings at partners."}
      />
      <TactileButton variant={applied ? "success" : "vault"} size="lg" fullWidth onClick={() => setApplied((value) => !value)}>
        {applied ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Saved on the bill
          </>
        ) : (
          "Apply $8 at checkout"
        )}
      </TactileButton>
      <p className="sr-only" aria-live="polite">
        {applied ? "PromoCard applied. You pay 16 dollars." : "PromoCard not yet applied."}
      </p>
    </div>
  );
}
