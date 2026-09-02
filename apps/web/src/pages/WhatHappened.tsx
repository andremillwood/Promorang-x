import { Link, useSearchParams } from "react-router-dom";
import { humanActionLabel } from "@promorang/shared";
import { useWhatHappened } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { PaperReceipt } from "@/components/promorang/SignatureObjects";

export default function WhatHappened() {
  const [params] = useSearchParams();
  const to = useExperiencePath();
  const happened = useWhatHappened(params.get("hub") || undefined);
  const data = happened.data;
  const buckets = data?.buckets || {};

  return (
    <ExperienceShell
      eyebrow="What happened"
      title="This week"
      description="Not charts. What your people actually did."
      backTo="/dashboard"
    >
      <PaperReceipt
        heading="This week"
        lines={[
          { label: "People participated", value: String(data?.participated || 0), strong: true },
          { label: "Went somewhere", value: String(buckets.went || 0) },
          { label: "Bought something", value: String(buckets.bought || 0) },
          { label: "Answered", value: String(buckets.answered || 0) },
          { label: "Shared", value: String(buckets.shared || 0) },
          { label: "Brought friends", value: String(buckets.brought || 0) },
          { label: "Claimed a perk", value: String(buckets.claimed || 0) },
          { label: "Used a perk", value: String(buckets.used || 0) },
          ...(data?.earned
            ? [{ label: "Generated", value: `J$${Math.round(data.earned).toLocaleString()}`, strong: true }]
            : []),
        ]}
        footer="Verified movement only. Nothing invented."
      />

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
            <QuietEmpty
              kicker="Recent"
              stub="0"
              title="Quiet week"
              copy="When people claim, show up or answer, it prints here like a receipt."
              action={<Link to={to("/create")} className="block min-h-12 rounded-full bg-primary text-center text-sm font-black leading-[3rem] text-black">Ask them to do something</Link>}
            />
          </div>
        )}
      </section>
    </ExperienceShell>
  );
}
