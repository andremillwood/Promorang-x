import { useMemo, useState } from "react";
import { Boxes, CircleDollarSign, Plus, StopCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReturnTypeOfActivationOperations } from "@/hooks/useActivationOperations.types";
import { useOwnerOffers } from "@/hooks/useOffers";
import { useI18n } from "@/i18n/I18nContext";

type Props = { operations: ReturnTypeOfActivationOperations };

const PAYABLE_BUCKETS = new Set(["distributor", "service_provider", "agency", "operator"]);

export function ActivationCommercialSetup({ operations }: Props) {
  const { t, formatNumber } = useI18n();
  const offers = useOwnerOffers();
  const [rule, setRule] = useState({ bucket: "operator", recipientId: "", mode: "percentage", value: "", currency: "", evidence: "purchase", terms: "" });
  const [offerId, setOfferId] = useState("");
  const selectedOffer = useMemo(() => (offers.data || []).find((offer) => offer.id === offerId), [offerId, offers.data]);
  const people = operations.people.data || [];
  const rules = operations.operations.data?.commercialRules || [];
  const requiresRecipient = PAYABLE_BUCKETS.has(rule.bucket);

  const saveRule = () => operations.addCommercialRule.mutate({
    bucket: rule.bucket,
    recipientId: requiresRecipient ? rule.recipientId : undefined,
    amount: rule.mode === "amount" ? Number(rule.value) : undefined,
    percentage: rule.mode === "percentage" ? Number(rule.value) : undefined,
    currency: rule.mode === "amount" ? rule.currency.toUpperCase() : undefined,
    requiredEvidence: rule.evidence,
    terms: rule.terms,
  }, { onSuccess: () => setRule((current) => ({ ...current, value: "", terms: "" })) });

  const attachOffer = () => {
    if (!selectedOffer) return;
    const remaining = selectedOffer.quantity_total == null ? undefined : Math.max(0, selectedOffer.quantity_total - selectedOffer.quantity_reserved - selectedOffer.quantity_redeemed);
    operations.addValueCommitment.mutate({
      type: selectedOffer.fulfillment_type === "shipping" ? "product" : "coupon",
      provider: t("activationSetup.offerOwner"),
      summary: selectedOffer.title,
      terms: selectedOffer.terms || undefined,
      quantity: remaining,
      faceValue: selectedOffer.value_amount || undefined,
      currency: selectedOffer.value_currency || undefined,
      offerId: selectedOffer.id,
    }, { onSuccess: () => setOfferId("") });
  };

  return <div className="grid gap-5 xl:grid-cols-2">
    <section className="rounded-[2rem] border border-white/10 bg-[#111110] p-6">
      <div className="flex gap-3"><CircleDollarSign className="h-5 w-5 text-primary" /><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-primary">{t("activationSetup.moneyEyebrow")}</p><h2 className="mt-1 font-serif text-2xl font-bold">{t("activationSetup.moneyTitle")}</h2></div></div>
      <p className="mt-3 text-xs leading-5 text-white/45">{t("activationSetup.moneyCopy")}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-[9px] font-black uppercase tracking-wide text-white/40">{t("activationSetup.bucket")}<select value={rule.bucket} onChange={(event) => setRule({ ...rule, bucket: event.target.value, recipientId: "" })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white">{["platform_revenue","participant_value","distribution","distributor","media","service_provider","agency","operator","tax","other_fulfillment"].map((bucket) => <option key={bucket} value={bucket}>{bucket.replaceAll("_", " ")}</option>)}</select></label>
        <label className="text-[9px] font-black uppercase tracking-wide text-white/40">{t("activationSetup.evidence")}<select value={rule.evidence} onChange={(event) => setRule({ ...rule, evidence: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white">{["reservation","purchase","attendance","redemption","repeat_purchase"].map((item) => <option key={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
        {requiresRecipient && <label className="text-[9px] font-black uppercase tracking-wide text-white/40 sm:col-span-2">{t("activationSetup.recipient")}<select value={rule.recipientId} onChange={(event) => setRule({ ...rule, recipientId: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white"><option value="">{t("activationSetup.choosePerson")}</option>{people.map((person) => <option key={person.user_id} value={person.user_id}>{person.full_name}</option>)}</select></label>}
        <label className="text-[9px] font-black uppercase tracking-wide text-white/40">{t("activationSetup.amountType")}<select value={rule.mode} onChange={(event) => setRule({ ...rule, mode: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white"><option value="percentage">{t("activationSetup.percentage")}</option><option value="amount">{t("activationSetup.fixedAmount")}</option></select></label>
        <label className="text-[9px] font-black uppercase tracking-wide text-white/40">{t("activationSetup.value")}<div className="mt-2 flex gap-2"><Input type="number" min="0.01" step="0.01" value={rule.value} onChange={(event) => setRule({ ...rule, value: event.target.value })} className="border-white/10 bg-black text-white" />{rule.mode === "amount" && <Input value={rule.currency} maxLength={3} onChange={(event) => setRule({ ...rule, currency: event.target.value })} placeholder="ISO" className="w-20 border-white/10 bg-black uppercase text-white" />}</div></label>
        <Input value={rule.terms} onChange={(event) => setRule({ ...rule, terms: event.target.value })} placeholder={t("activationSetup.terms")} className="border-white/10 bg-black text-white sm:col-span-2" />
      </div>
      <Button onClick={saveRule} disabled={!Number(rule.value) || (requiresRecipient && !rule.recipientId) || (rule.mode === "amount" && rule.currency.trim().length !== 3) || operations.addCommercialRule.isPending} className="mt-4 w-full bg-primary font-black text-black"><Plus className="mr-2 h-4 w-4" />{t("activationSetup.saveRule")}</Button>
      <div className="mt-5 space-y-2">{rules.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 p-3"><div><p className="text-xs font-bold capitalize">{item.bucket.replaceAll("_", " ")}</p><p className="mt-1 text-[10px] text-white/40">{item.percentage ? `${formatNumber(item.percentage)}%` : `${item.currency || ""} ${formatNumber(Number(item.amount || 0))}`} · {item.required_evidence.replaceAll("_", " ")}</p></div>{item.active && <button onClick={() => operations.deactivateCommercialRule.mutate(item.id)} aria-label={t("activationSetup.stopRule")} className="rounded-full p-2 text-white/35 hover:bg-white/10 hover:text-white"><StopCircle className="h-4 w-4" /></button>}</div>)}</div>
    </section>

    <section className="rounded-[2rem] border border-white/10 bg-[#111110] p-6">
      <div className="flex gap-3"><Boxes className="h-5 w-5 text-primary" /><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-primary">{t("activationSetup.inventoryEyebrow")}</p><h2 className="mt-1 font-serif text-2xl font-bold">{t("activationSetup.inventoryTitle")}</h2></div></div>
      <p className="mt-3 text-xs leading-5 text-white/45">{t("activationSetup.inventoryCopy")}</p>
      <label className="mt-5 block text-[9px] font-black uppercase tracking-wide text-white/40">{t("activationSetup.chooseOffer")}<select value={offerId} onChange={(event) => setOfferId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white"><option value="">{offers.isLoading ? t("common.loading") : t("activationSetup.chooseOfferPlaceholder")}</option>{(offers.data || []).filter((offer) => offer.status === "active" || offer.status === "draft").map((offer) => <option key={offer.id} value={offer.id}>{offer.title}</option>)}</select></label>
      {selectedOffer && <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[.06] p-4"><p className="font-serif text-xl font-bold">{selectedOffer.title}</p><p className="mt-2 text-xs text-white/45">{selectedOffer.quantity_total == null ? t("activationSetup.unlimited") : t("activationSetup.remaining", { count: Math.max(0, selectedOffer.quantity_total - selectedOffer.quantity_reserved - selectedOffer.quantity_redeemed) })}</p><p className="mt-2 text-[10px] text-white/35">{selectedOffer.fulfillment_type.replaceAll("_", " ")}</p></div>}
      <Button onClick={attachOffer} disabled={!selectedOffer || operations.addValueCommitment.isPending} variant="outline" className="mt-4 w-full border-primary/30 bg-primary/10 font-black text-primary hover:bg-primary hover:text-black"><Plus className="mr-2 h-4 w-4" />{t("activationSetup.attachOffer")}</Button>
    </section>
  </div>;
}
