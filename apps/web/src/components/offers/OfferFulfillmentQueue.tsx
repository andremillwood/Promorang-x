import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { useRef, useState } from "react";
import { Package, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";
import { useFulfillOffer, usePendingFulfillments, type OfferIssuance } from "@/hooks/useOffers";
import { toast } from "sonner";

function FulfillmentRow({ issuance }: { issuance: OfferIssuance }) {
  const { t: webT } = useWebI18n();
  const fulfill = useFulfillOffer();
  const inFlight = useRef(false);
  const [recordedAction, setRecordedAction] = useState<string | null>(null);
  const [result, setResult] = useState<{error:boolean;message:string} | null>(null);
  const [tracking, setTracking] = useState(issuance.fulfillment_data?.tracking_number || "");
  const [carrier, setCarrier] = useState(issuance.fulfillment_data?.carrier || "");
  const type = issuance.offers.fulfillment_type;
  const address = issuance.fulfillment_data?.shipping_address;
  const stage = recordedAction === "ship" ? "shipped" : issuance.fulfillment_data?.shipping_stage;

  const run = async (action: "confirm" | "ship" | "deliver") => {
    if (inFlight.current) return;
    inFlight.current = true;
    setResult(null);
    try {
      await fulfill.mutateAsync({
        id: issuance.id,
        action,
        tracking_number: tracking.trim(),
        carrier: carrier.trim(),
      });
      setRecordedAction(action);
      setResult({error:false,message:action === "confirm" ? "Fulfillment confirmed." : action === "ship" ? "Shipment recorded." : "Delivery recorded."});
      toast.success(action === "confirm" ? "Confirmed for the customer." : action === "ship" ? "Marked as shipped." : "Marked as delivered.");
    } catch (error) {
      setResult({error:true,message:error instanceof Error ? error.message : "Fulfillment was not updated. Try again."});
      toast.error(error instanceof Error ? error.message : "Could not update fulfillment");
    } finally { inFlight.current = false; }
  };

  return (
    <article className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
      <PaperReceipt
        heading={issuance.offers.title}
        lines={[
          { label: webT("web.code"), value: issuance.redemption_code, strong: true },
          { label: webT("activatePage.journeyTitle"), value: type.replaceAll("_", " ") },
          { label: "Stage", value: (stage || issuance.status).replaceAll("_", " ") },
          ...(address?.name ? [{ label: "Send to", value: `${address.name}, ${address.line1}, ${address.city}` }] : []),
          ...(issuance.fulfillment_data?.tracking_number ? [{ label: "Tracking", value: String(issuance.fulfillment_data.tracking_number) }] : []),
        ]}
        footer="Finish the journey the customer already started."
      />
      {result ? <p role={result.error ? "alert" : "status"} className={`text-sm ${result.error ? "text-red-200" : "text-emerald-300"}`}>{result.message}</p> : null}
      {type === "manual" ? (
        <Button className="min-h-11 w-full" disabled={fulfill.isPending || recordedAction === "confirm" || recordedAction === "deliver"} onClick={() => void run("confirm")}>
          <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm this was given
        </Button>
      ) : null}
      {type === "shipping" ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`carrier-${issuance.id}`}>Carrier</Label>
              <Input id={`carrier-${issuance.id}`} className="min-h-11 text-base" disabled={fulfill.isPending} value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Jamaica Post" />
            </div>
            <div>
              <Label htmlFor={`track-${issuance.id}`}>Tracking number (optional)</Label>
              <Input id={`track-${issuance.id}`} className="min-h-11 text-base" disabled={fulfill.isPending} value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="JM123456" />
            </div>
          </div>
          {recordedAction === "deliver" || stage === "delivered" ? <p className="text-sm text-muted-foreground">Completed</p> : stage !== "shipped" ? (
            <Button disabled={fulfill.isPending || recordedAction === "confirm" || recordedAction === "deliver"} onClick={() => void run("ship")}>
              <Truck className="mr-2 h-4 w-4" /> Mark shipped
            </Button>
          ) : (
            <Button disabled={fulfill.isPending || recordedAction === "confirm" || recordedAction === "deliver"} onClick={() => void run("deliver")}>
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
        <h3 className="font-sans text-xl font-semibold">Confirmations and shipments</h3>
        <p className="mt-1 text-sm text-muted-foreground">Complete outstanding manual and shipping claims.</p>
      </div>
      {pending.isLoading ? <p className="text-sm text-muted-foreground">Loading open fulfillments…</p> : null}
      {pending.isError ? <div role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm"><p>Fulfillment claims could not be loaded.</p><Button variant="outline" className="mt-3" disabled={pending.isFetching} onClick={() => void pending.refetch()}>Try again</Button></div> : null}
      {!pending.isLoading && !pending.isError && !rows.length ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nothing is waiting. New manual and shipping claims will appear here.</p>
      ) : null}
      {rows.map((issuance) => <FulfillmentRow key={issuance.id} issuance={issuance} />)}
    </section>
  );
}
