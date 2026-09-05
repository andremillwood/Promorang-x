import { useState } from "react";
import { Package, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import { useFulfillOffer, usePendingFulfillments, type OfferIssuance } from "@/hooks/useOffers";
import { toast } from "sonner";

function FulfillmentRow({ issuance }: { issuance: OfferIssuance }) {
  const fulfill = useFulfillOffer();
  const [tracking, setTracking] = useState(issuance.fulfillment_data?.tracking_number || "");
  const [carrier, setCarrier] = useState(issuance.fulfillment_data?.carrier || "");
  const type = issuance.offers.fulfillment_type;
  const address = issuance.fulfillment_data?.shipping_address;
  const stage = issuance.fulfillment_data?.shipping_stage;

  const run = async (action: "confirm" | "ship" | "deliver") => {
    try {
      await fulfill.mutateAsync({
        id: issuance.id,
        action,
        tracking_number: tracking,
        carrier,
      });
      toast.success(action === "confirm" ? "Confirmed for the customer." : action === "ship" ? "Marked as shipped." : "Marked as delivered.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update fulfillment");
    }
  };

  return (
    <article className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
      <PaperReceipt
        heading={issuance.offers.title}
        lines={[
          { label: "Code", value: issuance.redemption_code, strong: true },
          { label: "Journey", value: type.replaceAll("_", " ") },
          { label: "Stage", value: (stage || issuance.status).replaceAll("_", " ") },
          ...(address?.name ? [{ label: "Send to", value: `${address.name}, ${address.line1}, ${address.city}` }] : []),
          ...(issuance.fulfillment_data?.tracking_number ? [{ label: "Tracking", value: String(issuance.fulfillment_data.tracking_number) }] : []),
        ]}
        footer="Finish the journey the customer already started."
      />
      {type === "manual" ? (
        <Button className="w-full" disabled={fulfill.isPending} onClick={() => void run("confirm")}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm this was given
        </Button>
      ) : null}
      {type === "shipping" ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`carrier-${issuance.id}`}>Carrier</Label>
              <Input id={`carrier-${issuance.id}`} value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Jamaica Post" />
            </div>
            <div>
              <Label htmlFor={`track-${issuance.id}`}>Tracking number</Label>
              <Input id={`track-${issuance.id}`} value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="JM123456" />
            </div>
          </div>
          {stage !== "shipped" ? (
            <Button disabled={fulfill.isPending} onClick={() => void run("ship")}>
              <Truck className="mr-2 h-4 w-4" /> Mark shipped
            </Button>
          ) : (
            <Button disabled={fulfill.isPending} onClick={() => void run("deliver")}>
              <Package className="mr-2 h-4 w-4" /> Mark delivered
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function OfferFulfillmentQueue() {
  const pending = usePendingFulfillments();
  const rows = pending.data || [];

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Still in your hands</p>
        <h3 className="mt-1 font-serif text-2xl font-bold">Manual confirmations and shipments</h3>
        <p className="mt-1 text-sm text-muted-foreground">These people already claimed. They are waiting on you.</p>
      </div>
      {pending.isLoading ? <p className="text-sm text-muted-foreground">Loading open fulfillments…</p> : null}
      {!pending.isLoading && !rows.length ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nothing is waiting. New manual and shipping claims will appear here.</p>
      ) : null}
      {rows.map((issuance) => <FulfillmentRow key={issuance.id} issuance={issuance} />)}
    </section>
  );
}
