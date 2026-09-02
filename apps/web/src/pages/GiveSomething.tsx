import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AUDIENCE_LABELS, PERK_KIND_LABELS, dropShareCopy, type DropAudience, type PerkKind } from "@promorang/shared";
import { useGiveablePerks, useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const KINDS = Object.entries(PERK_KIND_LABELS) as Array<[PerkKind, string]>;
const AUDIENCES = Object.entries(AUDIENCE_LABELS) as Array<[DropAudience, string]>;

const AUDIENCE_STUB: Record<DropAudience, string> = {
  everyone: "All",
  most_active: "Active",
  first_x: "First",
  specific: "Yours",
  complete_something: "After",
};

const AUDIENCE_HINT: Record<DropAudience, string> = {
  everyone: "We'll ping the people already in this room.",
  most_active: "We'll ping the people who show up most. Others can't claim it.",
  first_x: "The first people who claim get it. We'll ping your people.",
  specific: "We'll ping the people you already brought. The link still works for them.",
  complete_something: "Nobody gets pinged yet. They can claim after they show up or finish something.",
};

export default function GiveSomething() {
  const [params] = useSearchParams();
  const { user, profile } = useAuth();
  const perks = useGiveablePerks();
  const { createDrop } = useExperienceActions();
  const to = useExperiencePath();
  const { toast } = useToast();
  const giverName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Someone";
  const [kind, setKind] = useState<PerkKind>((params.get("kind") as PerkKind) || "complimentary");
  const [audience, setAudience] = useState<DropAudience>("everyone");
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState("50");
  const [offerId, setOfferId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const selectedPerk = useMemo(() => (perks.data || []).find((item) => item.id === offerId), [perks.data, offerId]);
  const dropTitle = title || selectedPerk?.title || "2-for-1 at the restaurant";

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
      const message = dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind]);
      await navigator.clipboard.writeText(`${message} ${url}`).catch(() => undefined);
      toast({ title: "Dropped", description: message });
    } catch (error) {
      toast({ title: "Could not drop it", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow="Give something"
      title="Write the pass"
      description="They should be able to hold this. You should never have to explain it."
      backTo="/dashboard"
    >
      <TicketPass
        kicker={PERK_KIND_LABELS[kind]}
        title={dropTitle}
        detail={AUDIENCE_HINT[audience]}
        stub={audience === "first_x" ? limit : AUDIENCE_STUB[audience]}
        stubLabel="Who"
      />

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What kind of pass?</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 pr-scroll-rail">
          {KINDS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setKind(id)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold ${kind === id ? "border-primary bg-primary text-black" : "border-white/15 bg-black/30 text-white/80"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {perks.data?.length ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Already in the room</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 pr-scroll-rail">
            {perks.data.map((perk) => (
              <button
                key={perk.id}
                type="button"
                onClick={() => {
                  setOfferId(perk.id);
                  setTitle(perk.title);
                }}
                className="min-w-[220px] shrink-0 text-left"
              >
                <TicketPass
                  kicker={perk.source === "yours" ? "Yours" : "Partner"}
                  title={perk.title}
                  detail={perk.remaining != null ? `${perk.remaining} remaining` : "Open inventory"}
                  stub={offerId === perk.id ? "On" : "Use"}
                  stubLabel="Pick"
                  className={offerId === perk.id ? "ring-2 ring-primary" : "opacity-80"}
                />
              </button>
            ))}
          </div>
        </section>
      ) : (
        <TicketPass
          kicker="No partner stock"
          title="Write your own"
          detail="A 2-for-1, a tasting, first 50 in. It still lands on their card."
          stub="New"
          stubLabel="Make"
        />
      )}

      <label className="block">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Print this on the pass</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="2-for-1 at the restaurant"
          className="mt-2 min-h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none placeholder:text-white/30"
        />
      </label>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Who can tear it?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AUDIENCES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAudience(id)}
              className={`min-h-11 rounded-full border px-4 text-sm font-bold ${audience === id ? "border-primary bg-primary text-black" : "border-white/15 text-white/80"}`}
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

      <Link to={to("/stock")} className="block">
        <TicketPass
          kicker="For other networks"
          title="Putting this up for others to move?"
          detail="Stock it. They earn when people claim."
          stub="Stock"
          stubLabel="Open"
        />
      </Link>

      <button
        type="button"
        disabled={createDrop.isPending}
        onClick={dropIt}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
      >
        {createDrop.isPending ? "Dropping…" : "Drop it on their cards"}
      </button>

      {shareUrl ? (
        <div className="space-y-3">
          <TicketPass
            kicker="Ready to send"
            title={dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind])}
            detail="They claim it on their PromoCard. No download first."
            stub="Send"
            stubLabel="Link"
          />
          <PaperReceipt
            heading="Dropped"
            lines={[
              { label: "Pass", value: title || selectedPerk?.title || PERK_KIND_LABELS[kind], strong: true },
              { label: "Kind", value: PERK_KIND_LABELS[kind] },
              { label: "Who", value: AUDIENCE_LABELS[audience] },
              { label: "Link", value: shareUrl },
            ]}
            footer="Keep this. Send the line above."
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                const message = dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind]);
                if (navigator.share) {
                  await navigator.share({ title: message, text: message, url: shareUrl }).catch(() => undefined);
                  return;
                }
                window.open(`https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}`, "_blank", "noopener,noreferrer");
              }}
              className="min-h-12 rounded-full bg-white text-sm font-black text-black"
            >
              Share
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${dropShareCopy(giverName, title || selectedPerk?.title || PERK_KIND_LABELS[kind])} ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer"
              className="grid min-h-12 place-items-center rounded-full border border-white/20 text-sm font-black"
            >
              WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </ExperienceShell>
  );
}
