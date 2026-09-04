import { useSearchParams } from "react-router-dom";
import { humanActionLabel } from "@promorang/shared";
import { useWhatHappened } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty, StatPile } from "@/components/people/ExperienceShell";
import { NextMoveStrip } from "@/components/journey/NextMoveStrip";
import { getMemberNextMove } from "@/lib/member-next-move";
import { useAuth } from "@/contexts/AuthContext";
import { LatestPersonReceipt } from "@/components/promorang/PersonReceiptCallout";

export default function WhatHappened() {
  const [params] = useSearchParams();
  const happened = useWhatHappened(params.get("hub") || undefined);
  const { user } = useAuth();
  const data = happened.data;
  const buckets = data?.buckets || {};

  return (
    <ExperienceShell
      eyebrow="Progress"
      title="This week"
      description="What happened because of you — and how close you are to the result you want."
      backTo="/home"
    >
      <NextMoveStrip move={getMemberNextMove({ signedIn: Boolean(user), canCreate: Boolean(user) })} />
      <LatestPersonReceipt />
      <StatPile
        label="People participated"
        value={data?.participated || 0}
        hint={data?.earned ? `J$${Math.round(data.earned).toLocaleString()} generated` : "Verified movement only"}
      />

      <section className="grid grid-cols-2 gap-3">
        {[
          ["went somewhere", buckets.went],
          ["bought something", buckets.bought],
          ["answered Discoveries", buckets.answered],
          ["shared something", buckets.shared],
          ["brought friends", buckets.brought],
          ["claimed a perk", buckets.claimed],
          ["used a perk", buckets.used],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
            <p className="font-serif text-3xl font-bold">{value || 0}</p>
            <p className="mt-1 text-xs text-white/50">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Your people are most interested in</h2>
        {data?.topInterests?.length ? (
          <ol className="mt-3 space-y-2">
            {data.topInterests.map((interest: string, index: number) => (
              <li key={interest} className="rounded-[1.3rem] border border-white/10 px-4 py-3 text-sm">
                {index + 1}. {interest}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-white/45">Interest shows up after people start answering and showing up.</p>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Recent</h2>
        {data?.recent?.length ? (
          <div className="mt-3 space-y-2">
            {data.recent.map((row: any) => (
              <p key={row.id} className="rounded-[1.2rem] border border-white/10 px-4 py-3 text-sm text-white/70">
                {row.actorName || "Someone"} {humanActionLabel(row.action_type)}
              </p>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <QuietEmpty title="Quiet week" copy="When people claim, show up or answer, it will read like a story here." />
          </div>
        )}
      </section>
    </ExperienceShell>
  );
}
