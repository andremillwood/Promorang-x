import { FormEvent, useState } from "react";
import { AlertTriangle, KeyRound, ReceiptText, ShieldCheck } from "lucide-react";
import { decodeOfferRedeemPayload } from "@promorang/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OfferFulfillmentQueue } from "@/components/offers/OfferFulfillmentQueue";
import { OfferQrScanner } from "@/components/offers/OfferQrScanner";
import { PromorangValidReceipt } from "@/components/promorang/SignatureObjects";
import { useToast } from "@/hooks/use-toast";
import { useRedeemOffer } from "@/hooks/useOffers";

export function MerchantScannerStation({ venueName = "Merchant station" }: { venueName?: string }) {
  const { toast } = useToast();
  const redeem = useRedeemOffer();
  const [code, setCode] = useState("");
  const [lastRedemption, setLastRedemption] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const redeemCode = async (raw: string) => {
    const normalized = decodeOfferRedeemPayload(raw);
    if (!normalized) {
      setLastError("This does not look like a valid PROMORANG redemption code. Nothing was recorded.");
      return;
    }

    setLastError(null);
    try {
      const result = await redeem.mutateAsync({ code: normalized, notes: "merchant_scan" });
      setLastRedemption(result);
      setCode("");
      toast({ title: "Redemption validated", description: result.offers?.title || "The offer use was recorded." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Check the code and try again.";
      setLastError(message);
      toast({ title: "Could not validate this redemption", description: message, variant: "destructive" });
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await redeemCode(code);
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-emerald-500/25 bg-zinc-950 text-white shadow-2xl">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(16,185,129,.14),transparent_32%)] p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-300"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{venueName} · validation station</p>
              <h2 className="mt-1 text-2xl font-black">Validate a presented benefit.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
                A successful validation proves the eligible offer was used. It does not, by itself, prove a paid transaction.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[17rem_1fr]">
          <OfferQrScanner disabled={redeem.isPending} onCode={(value) => void redeemCode(value)} />
          <div className="space-y-4">
            <form onSubmit={submit} className="space-y-3">
              <label htmlFor="merchant-redemption-code" className="block text-[10px] font-black uppercase tracking-[.15em] text-white/55">Redemption code</label>
              <Input
                id="merchant-redemption-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="PR-XXXXXXXX"
                autoCapitalize="characters"
                autoComplete="off"
                className="h-12 border-zinc-700 bg-zinc-950 font-mono uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="PromoCard redemption code"
                aria-describedby="merchant-redemption-help"
              />
              <p id="merchant-redemption-help" className="text-xs leading-5 text-white/50">Scan the presented PromoCard/PromoKey QR or enter the code exactly as shown.</p>
              <Button type="submit" disabled={!code.trim() || redeem.isPending} className="min-h-12 w-full bg-emerald-500 font-black text-zinc-950 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
                <KeyRound className="mr-2 h-4 w-4" aria-hidden="true" />
                {redeem.isPending ? "Checking latest eligibility…" : "Validate presented benefit"}
              </Button>
            </form>

            {redeem.isPending ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-4 text-sm text-sky-100" role="status" aria-live="polite">
                Checking the latest server state. Do not treat this use as valid until confirmation returns.
              </div>
            ) : null}

            {lastError ? (
              <div className="flex gap-3 rounded-2xl border border-red-400/30 bg-red-950/25 p-4" role="alert">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden="true" />
                <div><p className="font-bold text-red-100">Validation not recorded</p><p className="mt-1 text-sm leading-5 text-red-100/75">{lastError}</p><p className="mt-2 text-xs text-white/45">The last confirmed redemption state remains unchanged.</p></div>
              </div>
            ) : null}
          </div>
        </div>

        {lastRedemption ? (
          <div className="border-t border-white/10 p-5 sm:p-7" aria-live="polite">
            <div className="mb-4 flex items-center gap-2 text-emerald-300"><ReceiptText className="h-4 w-4" aria-hidden="true"/><p className="text-[10px] font-black uppercase tracking-[.17em]">Last confirmed redemption</p></div>
            <PromorangValidReceipt
              title={lastRedemption.offers?.title || "PromoCard perk"}
              reference={lastRedemption.id}
              nextBenefit={lastRedemption.nextBenefit?.title}
            />
            <p className="mt-3 text-xs leading-5 text-white/50">This receipt confirms redemption/validation only. Attach transaction evidence separately where the product supports paid-order proof.</p>
            {lastRedemption.contributorReward ? (
              <p className="mt-2 text-xs text-emerald-200">Contributor reward record updated: {lastRedemption.contributorReward.amount} PromoPoints.</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <OfferFulfillmentQueue />
    </div>
  );
}

export default MerchantScannerStation;
