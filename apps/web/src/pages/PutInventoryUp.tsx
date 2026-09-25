import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  PERK_KIND_LABELS,
  STOCK_FULFILLMENT_OPTIONS,
  getStakeholderHowLead,
  inventoryPostedNext,
  type PerkKind,
  type PromoCardJourneyKind,
} from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { localizedFulfillment, localizedInventoryFollow, localizedInventoryNext, localizedPerkKind } from "@/i18n/localize";
import { useFindOrAskOriginOutcome } from "@/hooks/useFindOrAskOriginOutcome";

const KINDS = (Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>).filter(([id]) =>
  ["merchant", "complimentary", "discount", "free_entry", "priority", "invitation", "custom"].includes(id),
);

export default function PutInventoryUp() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const { user, profile, activeRole } = useAuth();
  const lensRole = params.get("role") || activeRole;
  const { provideInventory } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const originOutcome = useFindOrAskOriginOutcome();
  const merchantName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "This business";

  const [kind, setKind] = useState<PerkKind>("merchant");
  const [journey, setJourney] = useState<PromoCardJourneyKind>("place");
  const fulfillment = STOCK_FULFILLMENT_OPTIONS.find((item) => item.id === journey) || STOCK_FULFILLMENT_OPTIONS[0];
  const [title, setTitle] = useState(params.get("title") || "");
  const [quantity, setQuantity] = useState("");
  const [youEarn, setYouEarn] = useState("");
  const [opened, setOpened] = useState<{ title: string; remaining: number | null; offerId?: string; fulfillmentType?: string } | null>(null);

  const submit = async () => {
    const normalizedQuantity = quantity.trim() ? Number(quantity) : null;
    if (normalizedQuantity !== null && (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1)) {
      toast({
        title: "Enter a real available quantity",
        description: "Use a whole number of 1 or more, or leave quantity blank only when the inventory genuinely has no fixed limit.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await provideInventory.mutateAsync({
        kind,
        title: title.trim(),
        quantity: normalizedQuantity,
        peopleGet: title.trim(),
        youEarn: youEarn.trim() || undefined,
        fulfillment_type: fulfillment.fulfillmentType,
        owner_type: lensRole === "brand" || lensRole === "agency" || lensRole === "marketing" ? "brand" : "merchant",
      });

      const canonicalId = String(result.offer?.id || result.opportunity?.sourceId || result.opportunity?.id || "");
      const canonicalType = result.offer?.id || result.opportunity?.sourceId ? "offer" : "opportunity";
      const attachedToAsk = canonicalId ? await originOutcome.attachCreatedOutcome({
        canonicalObjectType: canonicalType,
        canonicalObjectId: canonicalId,
        canonicalObjectUrl: canonicalType === "offer" ? `/offers/${encodeURIComponent(canonicalId)}` : undefined,
        sourceLabel: result.opportunity.title,
      }) : false;
      if (originOutcome.hasOrigin && !attachedToAsk) {
        toast({
          title: "Inventory is live; response link needs attention",
          description: "The inventory was created, but PROMORANG could not attach it back to the originating question yet.",
          variant: "destructive",
        });
      }

      setOpened({
        title: result.opportunity.title,
        remaining: result.opportunity.remaining,
        offerId: result.offer?.id || result.opportunity?.sourceId,
        fulfillmentType: result.opportunity.fulfillmentType || fulfillment.fulfillmentType,
      });

      toast({ title: t("stock.itsUp"), description: t("stock.openCopy", { who: merchantName, what: title }) });
    } catch (error) {
      toast({ title: t("stock.couldNot"), description: (error as Error).message, variant: "destructive" });
    }
  };

  if (opened) {
    return (
      <ExperienceShell eyebrow={t("stock.itsUp")} title={t("stock.openCopy", { who: merchantName, what: opened.title })} backTo="/dashboard">
        <section className="rounded-[1.6rem] border border-emerald-400/20 bg-emerald-400/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">What happens now</p>
          <p className="mt-2 text-sm leading-6 text-white/70">{localizedInventoryFollow(opened.fulfillmentType, t)}</p>
          {opened.remaining != null ? <p className="mt-2 text-sm text-white/50">{t("stock.available", { count: opened.remaining })}</p> : null}
          <p className="mt-3 text-xs leading-5 text-white/45">
            Watch real claims and downstream use. Once you have evidence, decide whether to replenish this offer, change it, close it, or repeat it for another audience.
          </p>
        </section>

        {localizedInventoryNext(inventoryPostedNext(opened.fulfillmentType, opened.offerId), opened.fulfillmentType, t).map((action) => (
          <Link
            key={action.id}
            to={to(action.href)}
            className={`block rounded-[1.6rem] px-5 py-5 ${action.id === "share-perk" ? "bg-primary text-black" : "border border-white/10"}`}
          >
            <p className="font-serif text-2xl font-bold">{action.label}</p>
            <p className={`mt-1 text-sm ${action.id === "share-perk" ? "text-black/70" : "text-white/50"}`}>{action.why}</p>
          </Link>
        ))}

        <Link to={to("/happened")} className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
          <p className="font-serif text-2xl font-bold">Review what actually happened</p>
          <p className="mt-1 text-sm text-white/50">Claims, verified use, and downstream activity belong here—not in a projected success metric.</p>
        </Link>
      </ExperienceShell>
    );
  }

  const how = getStakeholderHowLead(lensRole, "stock");

  return (
    <ExperienceShell eyebrow={how.eyebrow} title={how.title} description={how.body} backTo="/dashboard">
      <StakeholderHowLead role={lensRole} surface="stock" />

      <section className="rounded-[1.6rem] border border-primary/20 bg-primary/5 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">The job</p>
        <h2 className="mt-2 font-serif text-2xl font-bold">Give someone a real reason to act.</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Publish only inventory, access, discounts, invitations, or perks that actually exist. PROMORANG will record the claim and the fulfillment path so you can later review what happened.
        </p>
      </section>

      <section>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">How will the person receive or use it?</p>
        <div className="grid grid-cols-2 gap-2">
          {STOCK_FULFILLMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setJourney(option.id)}
              className={`min-h-16 rounded-[1.3rem] border px-3 py-3 text-left ${journey === option.id ? "border-primary bg-primary text-black" : "border-white/10 bg-white/[0.04]"}`}
            >
              <p className="text-sm font-bold">{localizedFulfillment(option.id, t).label}</p>
              <p className={`mt-1 text-[11px] leading-4 ${journey === option.id ? "text-black/70" : "text-white/45"}`}>{localizedFulfillment(option.id, t).detail}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What kind of value is this?</p>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map(([id]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`min-h-14 rounded-[1.3rem] border px-3 text-sm font-bold ${kind === id ? "border-primary bg-primary text-black" : "border-white/10 bg-white/[0.04]"}`}
            >
              {localizedPerkKind(id, t)}
            </button>
          ))}
        </div>
      </section>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What exactly does the person get?</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("stock.whatGetPh")}
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">How many actually exist?</span>
        <input
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="Leave blank only if there is genuinely no fixed limit"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
        <p className="mt-2 text-xs leading-5 text-white/40">No quantity is assumed for you. Enter the real available amount when the offer is limited.</p>
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What does a mover / distributor earn, if anything?</span>
        <input
          value={youEarn}
          onChange={(event) => setYouEarn(event.target.value)}
          placeholder="Optional — leave blank if there is no approved reward"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Proof contract</p>
        <p className="mt-2 text-sm leading-6 text-white/65">
          A claim shows intent. The selected fulfillment path determines the stronger proof that follows. Do not describe a claim as a purchase or completed visit unless that later action is actually recorded.
        </p>
      </section>

      <button
        type="button"
        disabled={!title.trim() || provideInventory.isPending}
        onClick={submit}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {provideInventory.isPending ? t("stock.putting") : "Publish real inventory"}
      </button>
    </ExperienceShell>
  );
}
