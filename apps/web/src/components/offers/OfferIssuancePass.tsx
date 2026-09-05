import { QRCodeSVG } from "qrcode.react";
import { encodeOfferRedeemPayload, isPresentablePass, participantJourneyLabel } from "@promorang/shared";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { Button } from "@/components/ui/button";
import { OfferShippingAddressForm } from "@/components/offers/OfferShippingAddressForm";
import { useClaimIssuance, useSaveOfferAddress, type OfferIssuance } from "@/hooks/useOffers";
import { toast } from "sonner";

export function OfferIssuancePass({ issuance }: { issuance: OfferIssuance }) {
  const claim = useClaimIssuance();
  const saveAddress = useSaveOfferAddress();
  const offer = issuance.offers;
  const type = offer.fulfillment_type || "code";
  const data = issuance.fulfillment_data || {};
  const label = participantJourneyLabel(type, issuance.status, data);
  const showPass = isPresentablePass(type, issuance.status);
  const needsAddress = type === "shipping" && (issuance.status === "issued" || data.shipping_stage === "awaiting_address");
  const payload = encodeOfferRedeemPayload(issuance.redemption_code);

  const claimNow = async () => {
    try {
      await claim.mutateAsync(issuance.id);
      toast.success(type === "automatic" ? "The value is already in your wallet." : "Offer claimed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not claim this offer");
    }
  };

  return (
    <article className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#111] p-4">
      <TicketPass
        kicker={label}
        title={offer.title}
        detail={offer.description || "Keep this until the place or delivery confirms it."}
        stub={issuance.redemption_code}
        stubLabel={type === "qr" ? "Scan" : "Code"}
      />

      {issuance.status === "issued" && type !== "shipping" ? (
        <Button className="w-full" disabled={claim.isPending} onClick={() => void claimNow()}>
          {type === "automatic" ? "Receive now" : "Claim this offer"}
        </Button>
      ) : null}

      {showPass ? (
        <div className="rounded-2xl bg-white p-5 text-center text-black">
          <QRCodeSVG value={payload} size={176} level="M" includeMargin className="mx-auto" />
          <p className="mt-3 font-mono text-xl font-black tracking-[0.18em]">{issuance.redemption_code}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {type === "qr" ? "Let the merchant scan this pass." : "Show this code or let them scan the square."}
          </p>
        </div>
      ) : null}

      {needsAddress ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="font-serif text-xl font-bold">Where should this go?</p>
          <p className="mt-1 mb-4 text-sm text-white/60">They cannot pack it until a delivery address is on the ticket.</p>
          <OfferShippingAddressForm
            initial={data.shipping_address}
            pending={saveAddress.isPending || claim.isPending}
            submitLabel="Save delivery address"
            onSubmit={async (shipping_address) => {
              try {
                if (issuance.status === "issued") await claim.mutateAsync({ id: issuance.id, shipping_address });
                else await saveAddress.mutateAsync({ id: issuance.id, shipping_address });
                toast.success("Delivery address saved.");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not save the address");
              }
            }}
          />
        </div>
      ) : null}

      {type === "manual" && issuance.status === "fulfillment_pending" ? (
        <p className="text-sm text-white/65">The business still has to confirm this in person or by review. Keep the code until they do.</p>
      ) : null}

      {type === "shipping" && data.shipping_stage === "ready_to_ship" ? (
        <p className="text-sm text-white/65">Address received. They are packing it.</p>
      ) : null}

      {data.shipping_stage === "shipped" || issuance.status === "redeemed" ? (
        <PaperReceipt
          heading={label}
          lines={[
            { label: "Offer", value: offer.title },
            { label: "Code", value: issuance.redemption_code },
            ...(offer.value_amount ? [{ label: "Value", value: `${offer.value_amount} ${offer.value_currency || ""}`.trim(), strong: true }] : []),
            ...(data.automatic?.wallet ? [{ label: "Wallet", value: `${data.automatic.amount || ""} ${data.automatic.wallet}`.trim() }] : []),
            ...(data.carrier ? [{ label: "Carrier", value: String(data.carrier) }] : []),
            ...(data.tracking_number ? [{ label: "Tracking", value: String(data.tracking_number), strong: true }] : []),
          ]}
          footer={type === "automatic" ? "No merchant scan was needed." : "Keep this as proof."}
        />
      ) : null}
    </article>
  );
}
