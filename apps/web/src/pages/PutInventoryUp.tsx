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
  const merchantName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "A place";
  const [kind, setKind] = useState<PerkKind>("merchant");
  const [journey, setJourney] = useState<PromoCardJourneyKind>("place");
  const fulfillment = STOCK_FULFILLMENT_OPTIONS.find((item) => item.id === journey) || STOCK_FULFILLMENT_OPTIONS[0];
  const [title, setTitle] = useState(params.get("title") || "");
  const [quantity, setQuantity] = useState("50");
  const [youEarn, setYouEarn] = useState("");
  const [opened, setOpened] = useState<{ title: string; remaining: number | null; offerId?: string; fulfillmentType?: string } | null>(null);

  const submit = async () => {
    try {
      const result = await provideInventory.mutateAsync({
        kind,
        title,
        quantity: quantity ? Number(quantity) : null,
        peopleGet: title,
        youEarn: youEarn || undefined,
        fulfillment_type: fulfillment.fulfillmentType,
        owner_type: lensRole === "brand" || lensRole === "agency" || lensRole === "marketing" ? "brand" : "merchant",
      });
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
        <p className="text-sm text-white/55">
          {localizedInventoryFollow(opened.fulfillmentType, t)}
        </p>
        {opened.remaining != null ? (
          <p className="text-sm text-white/45">{t("stock.available", { count: opened.remaining })}</p>
        ) : null}
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
        <Link to={to("/earn")} className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
          <p className="font-serif text-2xl font-bold">{t("stock.seeOpportunity")}</p>
          <p className="mt-1 text-sm text-white/50">{t("stock.seeOpportunityCopy")}</p>
        </Link>
        <Link to={to("/happened")} className="block text-center text-sm text-white/40">{t("stock.watchClaimed")}</Link>
      </ExperienceShell>
    );
  }

  const how = getStakeholderHowLead(lensRole, "stock");

  return (
    <ExperienceShell
      eyebrow={how.eyebrow}
      title={how.title}
      description={how.body}
      backTo="/dashboard"
    >
      <StakeholderHowLead role={lensRole} surface="stock" />
      <section>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("stock.howReceive")}</p>
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
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("stock.whatGet")}</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("stock.whatGetPh")}
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("stock.howMany")}</span>
        <input
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          inputMode="numeric"
          placeholder={t("stock.howManyPh")}
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("stock.moversEarn")}</span>
        <input
          value={youEarn}
          onChange={(event) => setYouEarn(event.target.value)}
          placeholder={t("stock.moversEarnPh")}
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <button
        type="button"
        disabled={!title.trim() || provideInventory.isPending}
        onClick={submit}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {provideInventory.isPending ? t("stock.putting") : t("stock.putItUp")}
      </button>
    </ExperienceShell>
  );
}
