import { FormEvent, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
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

  const redeemCode = async (raw: string) => {
    const normalized = decodeOfferRedeemPayload(raw);
    if (!normalized) return;
    setLastRedemption(null);
    try {
      const result = await redeem.mutateAsync({ code: normalized, notes: "merchant_scan" });
      setLastRedemption(result);
      setCode("");
      toast({ title: "Perk redeemed", description: result.offers?.title || "The redemption was recorded." });
    } catch (error) {
      toast({
        title: "Could not redeem this code",
        description: error instanceof Error ? error.message : "Check the code and try again.",
        variant: "destructive",
      });
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await redeemCode(code);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 text-white shadow-2xl sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{venueName}</p>
            <h2 className="mt-1 text-xl font-black">Redeem a PromoCard perk</h2>
            <p className="mt-1 text-sm text-zinc-400">Scan the gold plate or flipped QR on their PromoCard, or type the code. VALID is the only completion.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <OfferQrScanner disabled={redeem.isPending} onCode={(value) => void redeemCode(value)} />
          <form onSubmit={submit} className="flex flex-col justify-end gap-3">
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="PR-XXXXXXXX"
              autoCapitalize="characters"
              autoComplete="off"
              className="h-12 border-zinc-700 bg-zinc-950 font-mono uppercase tracking-widest"
              aria-label="PromoCard redemption code"
            />
            <Button type="submit" disabled={!code.trim() || redeem.isPending} className="h-12 bg-emerald-500 font-black text-zinc-950 hover:bg-emerald-400">
              <KeyRound className="mr-2 h-4 w-4" />
              {redeem.isPending ? "Checking…" : "Redeem"}
            </Button>
          </form>
        </div>
        {lastRedemption ? (
          <div className="mt-5 space-y-3">
            <PromorangValidReceipt
              title={lastRedemption.offers?.title || "PromoCard perk"}
              reference={lastRedemption.id}
              nextBenefit={lastRedemption.nextBenefit?.title}
            />
            {lastRedemption.contributorReward ? (
              <p className="text-xs text-emerald-200">Ambassador reward updated: {lastRedemption.contributorReward.amount} PromoPoints.</p>
            ) : null}
          </div>
        ) : null}
      </section>
      <OfferFulfillmentQueue />
    </div>
  );
}

export default MerchantScannerStation;
