import { Link, useSearchParams } from "react-router-dom";
import { humanActionLabel } from "@promorang/shared";
import { useWhatHappened } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell } from "@/components/people/ExperienceShell";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";

export default function WhatHappened() {
  const [params] = useSearchParams();
  const happened = useWhatHappened(params.get("hub") || undefined);
  const to = useExperiencePath();
  const data = happened.data;
  const buckets = data?.buckets || {};
  const recent = data?.recent || [];

  return (
    <ExperienceShell
      eyebrow="What happened"
      title="The receipt"
      description="Not a chart. What your people actually did this week."
      backTo="/dashboard"
    >
      <PaperReceipt
        heading="This week"
        lines={[
          { label: "Showed up", value: String(data?.participated || 0), strong: true },
          { label: "Went somewhere", value: String(buckets.went || 0) },
          { label: "Bought something", value: String(buckets.bought || 0) },
          { label: "Answered", value: String(buckets.answered || 0) },
          { label: "Shared", value: String(buckets.shared || 0) },
          { label: "Brought friends", value: String(buckets.brought || 0) },
          { label: "Claimed a perk", value: String(buckets.claimed || 0) },
          { label: "Used a perk", value: String(buckets.used || 0) },
          ...(data?.earned
            ? [{ label: "Earned", value: `J$${Math.round(data.earned).toLocaleString()}`, strong: true }]
            : []),
        ]}
        footer={
          data?.participated
            ? "Verified movement only. Nothing invented."
            : "Quiet week. Zeros stay zeros until someone shows up."
        }
      />

      {data?.topInterests?.length ? (
        <PaperReceipt
          heading="They keep choosing"
          lines={data.topInterests.map((interest: string, index: number) => ({
            label: `${index + 1}.`,
            value: interest,
            strong: index === 0,
          }))}
          footer="From what they answered and where they went."
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="font-serif text-2xl font-bold">Recent slips</h2>
        {recent.length ? (
          recent.map((row: any) => (
            <TicketPass
              key={row.id}
              kicker="Counted"
              title={`${row.actorName || "Someone"} ${humanActionLabel(row.action_type)}`}
              detail="It landed on this week's receipt."
              stub="Kept"
              stubLabel="Slip"
            />
          ))
        ) : (
          <Link to={to("/give")} className="block">
            <TicketPass
              kicker="Quiet"
              title="Nobody moved yet"
              detail="Give a perk or ask them to show up. The next slip prints here."
              stub="Give"
              stubLabel="Next"
            />
          </Link>
        )}
      </section>
    </ExperienceShell>
  );
}
