import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AUDIENCE_LABELS, PERK_KIND_LABELS, type DropAudience, type PerkKind } from "@promorang/shared";
import { useGiveablePerks, useExperienceActions } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";

const KINDS = Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>;
const AUDIENCES = Object.entries(AUDIENCE_LABELS) as Array<[DropAudience, string]>;

export default function GiveSomething() {
  const [params] = useSearchParams();
  const perks = useGiveablePerks();
  const { createDrop } = useExperienceActions();
  const { toast } = useToast();
  const [kind, setKind] = useState<PerkKind>((params.get("kind") as PerkKind) || "complimentary");
  const [audience, setAudience] = useState<DropAudience>("everyone");
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("50");
  const [offerId, setOfferId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const selectedPerk = useMemo(() => (perks.data || []).find((item) => item.id === offerId), [perks.data, offerId]);

  const dropIt = async () => {
    try {
      const drop = await createDrop.mutateAsync({
        kind,
        title: title || selectedPerk?.title || PERK_KIND_LABELS[kind],
        description: selectedPerk?.description,
        offerId,
        audience,
        audienceLimit: audience === "first_x" ? Number(limit) || 50 : null,
        sceneId: params.get("hub") || undefined,
      });
      const url = `${window.location.origin}/drop/${drop.slug}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => undefined);
      toast({ title: "Dropped", description: "Tell your people. They claim it on their PromoCard." });
    } catch (error) {
      toast({ title: "Could not drop it", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow="Give something"
      title="What do you want to give your people?"
      description="Drop it onto their PromoCards. They should never need to understand the machinery underneath."
      backTo="/dashboard"
    >
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

      <section>
        <h2 className="font-serif text-2xl font-bold">Available for your people</h2>
        {perks.data?.length ? (
          <div className="mt-3 space-y-2">
            {perks.data.map((perk) => (
              <button
                key={perk.id}
                type="button"
                onClick={() => {
                  setOfferId(perk.id);
                  setTitle(perk.title);
                }}
                className={`w-full rounded-[1.4rem] border px-4 py-4 text-left ${offerId === perk.id ? "border-primary bg-primary/15" : "border-white/10 bg-white/[0.04]"}`}
              >
                <p className="font-serif text-xl font-bold">{perk.title}</p>
                <p className="mt-1 text-xs text-white/50">
                  {perk.remaining != null ? `${perk.remaining} remaining` : "Open inventory"} · {perk.source === "yours" ? "Yours" : "From a partner"}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title="No partner inventory yet" copy="You can still make a simple perk and drop it yourself." />
          </div>
        )}
      </section>

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What should we drop?</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="2-for-1 at the restaurant"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Who gets it?</p>
        <div className="mt-2 grid gap-2">
          {AUDIENCES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAudience(id)}
              className={`min-h-12 rounded-full border px-4 text-sm font-bold ${audience === id ? "border-primary bg-primary text-black" : "border-white/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {audience === "first_x" ? (
          <input
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            inputMode="numeric"
            className="mt-3 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4"
            placeholder="First 50 people"
          />
        ) : null}
      </section>

      <button
        type="button"
        disabled={createDrop.isPending}
        onClick={dropIt}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {createDrop.isPending ? "Dropping…" : "Drop it"}
      </button>

      {shareUrl ? (
        <div className="rounded-[1.5rem] border border-primary/40 bg-primary/10 px-4 py-4">
          <p className="text-sm text-white/70">Tell them you have something for them. They do not need to download anything first.</p>
          <p className="mt-2 break-all font-mono text-xs text-primary">{shareUrl}</p>
        </div>
      ) : null}
    </ExperienceShell>
  );
}
