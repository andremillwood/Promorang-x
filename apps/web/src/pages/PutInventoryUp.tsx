import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PERK_KIND_LABELS, getStakeholderHowLead, inventoryOpenCopy, merchantPerkPostedNext, type PerkKind } from "@promorang/shared";
import { useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const KINDS = (Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>).filter(([id]) =>
  ["merchant", "complimentary", "discount", "free_entry", "priority", "invitation", "custom"].includes(id),
);

export default function PutInventoryUp() {
  const [params] = useSearchParams();
  const { user, profile, activeRole } = useAuth();
  const lensRole = params.get("role") || activeRole;
  const { provideInventory } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const merchantName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "A place";
  const [kind, setKind] = useState<PerkKind>("merchant");
  const [title, setTitle] = useState(params.get("title") || "");
  const [quantity, setQuantity] = useState("50");
  const [youEarn, setYouEarn] = useState("");
  const [opened, setOpened] = useState<{ title: string; remaining: number | null; offerId?: string } | null>(null);

  const submit = async () => {
    try {
      const result = await provideInventory.mutateAsync({
        kind,
        title,
        quantity: quantity ? Number(quantity) : null,
        peopleGet: title,
        youEarn: youEarn || undefined,
      });
      setOpened({
        title: result.opportunity.title,
        remaining: result.opportunity.remaining,
        offerId: result.offer?.id || result.opportunity?.sourceId,
      });
      toast({ title: "It’s up", description: inventoryOpenCopy(merchantName, title) });
    } catch (error) {
      toast({ title: "Could not put that up yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (opened) {
    return (
      <ExperienceShell eyebrow="It’s up" title={inventoryOpenCopy(merchantName, opened.title)} backTo="/dashboard">
        <p className="text-sm text-white/55">
          Contributors will see this under Earn. The loop finishes only when you validate the code at the counter.
        </p>
        {opened.remaining != null ? (
          <p className="text-sm text-white/45">{opened.remaining} available.</p>
        ) : null}
        {merchantPerkPostedNext(opened.offerId).map((action) => (
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
          <p className="font-serif text-2xl font-bold">See it as an opportunity</p>
          <p className="mt-1 text-sm text-white/50">Other people take it and drop it on their PromoCards.</p>
        </Link>
        <Link to={to("/happened")} className="block text-center text-sm text-white/40">Watch claimed and used</Link>
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
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`min-h-14 rounded-[1.3rem] border px-3 text-sm font-bold ${kind === id ? "border-primary bg-primary text-black" : "border-white/10 bg-white/[0.04]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What do people get?</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Free tasting, 2-for-1 Friday, first drink"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">How many?</span>
        <input
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          inputMode="numeric"
          placeholder="Leave blank if open"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What do people who move it earn?</span>
        <input
          value={youEarn}
          onChange={(event) => setYouEarn(event.target.value)}
          placeholder="Credit when someone uses it"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <button
        type="button"
        disabled={!title.trim() || provideInventory.isPending}
        onClick={submit}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {provideInventory.isPending ? "Putting it up…" : "Put it up"}
      </button>
    </ExperienceShell>
  );
}
