import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  dropShareCopy,
  opportunityRemainingCopy,
  opportunitySourceLabel,
  opportunityStubCode,
} from "@promorang/shared";
import { useOpportunities, useExperienceActions, useWhatHappened } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { JobSlip, NightTrail, PaperReceipt } from "@/components/promorang/SignatureObjects";
import { TactileButton } from "@/components/ui/TactileButton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type TakenDrop = {
  title: string;
  url: string;
  message: string;
};

const money = (value: number) => {
  if (!value) return "J$0";
  return `J$${Math.round(value).toLocaleString()}`;
};

export default function EarnOpportunities() {
  const [params] = useSearchParams();
  const sceneId = params.get("hub") || undefined;
  const to = useExperiencePath();
  const { user, profile } = useAuth();
  const opportunities = useOpportunities(sceneId);
  const happened = useWhatHappened(sceneId);
  const { takeOpportunity } = useExperienceActions();
  const { toast } = useToast();
  const [taken, setTaken] = useState<TakenDrop | null>(null);
  const giverName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Someone";

  const items = opportunities.data || [];
  const participated = Number(happened.data?.participated || 0);
  const earned = Number(happened.data?.earned || 0);

  const take = async (id: string, title: string) => {
    try {
      const result = await takeOpportunity.mutateAsync({ id, sceneId });
      const url = `${window.location.origin}/drop/${result.drop.slug}`;
      const message = dropShareCopy(giverName, title || result.opportunity?.title || "this");
      await navigator.clipboard.writeText(`${message} ${url}`).catch(() => undefined);
      setTaken({ title: title || result.opportunity?.title || "Drop", url, message });
      toast({ title: "You took it", description: "A drop is ready for your people." });
    } catch (error) {
      toast({ title: "Could not take this yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  const shareTaken = async () => {
    if (!taken) return;
    if (navigator.share) {
      await navigator.share({ title: taken.message, text: taken.message, url: taken.url }).catch(() => undefined);
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${taken.message} ${taken.url}`)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <ExperienceShell
      eyebrow="Earn"
      title="Opportunities"
      description="Get people to try, visit, buy or show up. You earn when the action is verified."
      backTo="/dashboard"
    >
      {taken ? (
        <JobSlip
          kicker="Dropped"
          title={taken.title}
          detail={taken.message}
          stub="SEND"
          stubLabel="Keep"
          action={
            <div className="grid grid-cols-2 gap-2">
              <TactileButton type="button" fullWidth onClick={shareTaken}>
                Share
              </TactileButton>
              <TactileButton variant="obsidian" fullWidth asChild>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${taken.message} ${taken.url}`)}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </TactileButton>
            </div>
          }
        />
      ) : null}

      {opportunities.isLoading ? (
        <div className="pr-ticket min-h-[168px] animate-pulse rounded-[1.6rem]" aria-hidden />
      ) : opportunities.isError ? (
        <JobSlip
          kicker="Hold"
          title="Could not load slips yet"
          detail="Try again in a moment. Nothing here is invented while we wait."
          stub="WAIT"
          stubLabel="Hold"
          waiting
        />
      ) : items.length ? (
        <div className="space-y-5">
          {items.map((item) => (
            <JobSlip
              key={item.id}
              kicker={opportunitySourceLabel(item.sourceKind)}
              title={item.title}
              detail={item.description || undefined}
              peopleGet={item.peopleGet}
              youEarn={item.youEarn}
              remaining={opportunityRemainingCopy(item.remaining)}
              stub={opportunityStubCode(item.id)}
              action={
                <TactileButton
                  type="button"
                  fullWidth
                  size="lg"
                  disabled={takeOpportunity.isPending}
                  onClick={() => take(item.id, item.title)}
                >
                  Take this opportunity
                </TactileButton>
              }
            />
          ))}
        </div>
      ) : (
        <WaitingRoom stockTo={to("/stock")} giveTo={to("/give")} happenedTo={to("/happened")} />
      )}

      <PaperReceipt
        heading="This week's take"
        lines={[
          { label: "Live slips", value: opportunities.isLoading ? "…" : String(items.length), strong: true },
          { label: "People who acted", value: String(participated) },
          { label: "You earned", value: money(earned), strong: earned > 0 },
        ]}
        footer={items.length ? "Take a slip. Drop it. Earn when they show up." : "When a merchant, brand or venue wants your people, a job slip lands here."}
      />
    </ExperienceShell>
  );
}

function WaitingRoom({
  stockTo,
  giveTo,
  happenedTo,
}: {
  stockTo: string;
  giveTo: string;
  happenedTo: string;
}) {
  return (
    <div className="space-y-5">
      <JobSlip
        kicker="Waiting"
        title="No live job slip yet"
        detail="A merchant, brand or venue will put something up. You take it, drop it on your people, and earn when they show up."
        peopleGet="A perk they can actually use"
        youEarn="When the action is verified"
        remaining="Open"
        stub="OPEN"
        stubLabel="Slip"
        waiting
        action={
          <TactileButton fullWidth size="lg" asChild>
            <Link to={stockTo}>Put something up yourself</Link>
          </TactileButton>
        }
      />

      <NightTrail
        eyebrow="How you earn"
        title="Take it. Drop it. Earn when they show up."
        steps={[
          { label: "Take", title: "Pick up the slip", text: "A merchant or brand opens something. You take it." },
          { label: "Drop", title: "Put it on your people", text: "It lands on their PromoCards. They claim it." },
          { label: "Act", title: "They show up", text: "They try, visit, buy or walk in. The action has to be real." },
          { label: "Earn", title: "Then it is yours", text: "You earn when that action is verified. Not before." },
        ]}
      />

      <Link to={giveTo} className="block overflow-hidden rounded-[1.6rem] bg-primary px-5 py-5 text-black">
        <p className="text-[10px] font-black uppercase tracking-[0.22em]">Meanwhile</p>
        <p className="mt-1 font-serif text-2xl font-bold">Give something to your people</p>
        <p className="mt-1 text-sm">Drop a perk now. You do not have to wait for a brand.</p>
      </Link>

      <Link to={happenedTo} className="block rounded-[1.6rem] border border-white/10 px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Proof</p>
        <p className="mt-1 font-serif text-2xl font-bold">See what already happened</p>
        <p className="mt-1 text-sm text-white/50">Claims, visits and show-ups live there — not here.</p>
      </Link>
    </div>
  );
}
