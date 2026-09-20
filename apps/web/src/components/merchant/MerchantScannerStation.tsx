import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, BadgeCheck, KeyRound, ReceiptText, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { decodeOfferRedeemPayload } from "@promorang/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OfferFulfillmentQueue } from "@/components/offers/OfferFulfillmentQueue";
import { OfferQrScanner } from "@/components/offers/OfferQrScanner";
import { PromorangValidReceipt } from "@/components/promorang/SignatureObjects";
import { PromorangSemanticMark } from "@/components/promorang/PromorangSemanticMark";
import { useToast } from "@/hooks/use-toast";
import { useRedeemOffer } from "@/hooks/useOffers";

export function MerchantScannerStation({ venueName = "Merchant station" }: { venueName?: string }) {
  const { toast } = useToast();
  const redeem = useRedeemOffer();
  const [code, setCode] = useState("");
  const [lastRedemption, setLastRedemption] = useState<any>(null);
  const [lastError, setLastError] = useState("");
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const redeemCode = async (raw: string) => {
    if (!online) {
      setLastError("Validation is unavailable offline. The last confirmed receipt remains visible, but no new redemption will be recorded.");
      return;
    }
    const normalized = decodeOfferRedeemPayload(raw);
    if (!normalized) {
      setLastError("This code could not be read as a valid PROMORANG redemption code.");
      return;
    }
    setLastError("");
    try {
      const result = await redeem.mutateAsync({ code: normalized, notes: "merchant_scan" });
      setLastRedemption(result);
      setCode("");
      toast({ title: "Use validated", description: result.offers?.title || "The redemption was recorded." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Check the code and try again.";
      setLastError(message);
      toast({ title: "Could not validate this use", description: message, variant: "destructive" });
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await redeemCode(code);
  };

  return (
    <div className="space-y-8" data-proof-family="merchant-validation-slip">
      <section className="overflow-hidden border border-emerald-500/20 bg-[#090c0b] text-white shadow-2xl">
        <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <PromorangSemanticMark kind="proof" size={42} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Merchant · validation boundary</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold tracking-[-0.03em]">Confirm one legitimate use.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Scan or enter the code. A successful validation writes one entitlement use at this merchant station. Purchase, revenue and fulfillment remain separate facts.</p>
              </div>
            </div>
            <span className={`inline-flex min-h-9 items-center gap-2 self-start border px-3 text-[10px] font-black uppercase tracking-[0.14em] ${online ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>
              {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {online ? "Ready to validate" : "Offline · writes paused"}
            </span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[20rem_1fr]">
          <div className="border-b border-white/10 bg-black/25 p-5 lg:border-b-0 lg:border-r sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Counter station</p>
                <h3 className="mt-1 text-lg font-black">{venueName}</h3>
              </div>
              <span className="border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/45">Write action</span>
            </div>
            <div className="mt-5">
              <OfferQrScanner disabled={redeem.isPending || !online} onCode={(value) => void redeemCode(value)} />
            </div>
            <p className="mt-4 text-xs leading-5 text-white/45">Use the camera for the PromoCard QR or switch to manual entry. Failed or duplicate validations remain visibly unrecorded.</p>
          </div>

          <div className="p-5 sm:p-7">
            <form onSubmit={submit} className="space-y-3">
              <label htmlFor="merchant-redemption-code" className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Manual code</label>
              <Input
                id="merchant-redemption-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="PR-XXXXXXXX"
                autoCapitalize="characters"
                autoComplete="off"
                disabled={!online || redeem.isPending}
                className="h-14 border-zinc-700 bg-zinc-950 font-mono text-lg uppercase tracking-[0.12em]"
                aria-label="PromoCard redemption code"
              />
              <Button type="submit" disabled={!code.trim() || redeem.isPending || !online} className="h-12 w-full bg-emerald-500 font-black text-zinc-950 hover:bg-emerald-400">
                <KeyRound className="mr-2 h-4 w-4" />
                {redeem.isPending ? "Checking…" : online ? "Validate use" : "Offline · unavailable"}
              </Button>
            </form>

            {lastError ? (
              <div role="alert" className="mt-4 flex items-start gap-3 border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <div><strong>Not recorded.</strong><p className="mt-1 text-amber-100/70">{lastError}</p></div>
              </div>
            ) : null}

            {lastRedemption ? (
              <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,22rem)_1fr]">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-emerald-300"><ReceiptText className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[0.16em]">Validation slip</span></div>
                  <div className="bg-[#e8e1d4] p-3 text-black shadow-[0_20px_60px_rgba(0,0,0,.28)]">
                    <PromorangValidReceipt
                      title={lastRedemption.offers?.title || "PromoCard perk"}
                      reference={lastRedemption.id}
                      nextBenefit={lastRedemption.nextBenefit?.title}
                    />
                  </div>
                </div>
                <div className="border-y border-white/10 py-1">
                  {[
                    ["Validation", "Recorded", "One accepted entitlement use was written."],
                    ["Purchase", "Not implied", "No purchase fact is created by validation."],
                    ["Fulfillment", "Separate", "Completion remains in the fulfillment queue."],
                  ].map(([label, state, detail]) => (
                    <div key={label} className="grid gap-2 border-b border-white/10 py-4 last:border-b-0 sm:grid-cols-[.55fr_.55fr_1.4fr]">
                      <strong className="text-sm">{label}</strong>
                      <span className="text-[10px] font-black uppercase tracking-[.12em] text-emerald-300">{state}</span>
                      <span className="text-xs leading-5 text-white/45">{detail}</span>
                    </div>
                  ))}
                  {lastRedemption.contributorReward ? (
                    <p className="border-t border-white/10 pt-4 text-xs text-emerald-200">Ambassador reward updated: {lastRedemption.contributorReward.amount} PromoPoints.</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mt-5 border border-dashed border-white/10 p-4 text-sm text-white/40">No validation has been confirmed in this session yet.</div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Fulfillment queue</p>
            <p className="mt-1 text-sm text-white/50">Operational follow-up stays separate from the validation write. A validated entitlement is not automatically fulfilled.</p>
          </div>
        </div>
        <OfferFulfillmentQueue />
      </section>
    </div>
  );
}

export default MerchantScannerStation;