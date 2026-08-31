import { useState } from "react";
import { Link } from "react-router-dom";
import { useExperienceNetwork, useExperienceActions } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty, StatPile } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";

export default function MyPeople() {
  const network = useExperienceNetwork();
  const { invite } = useExperienceActions();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const data = network.data;

  const handleInvite = async () => {
    try {
      const firstScene = data?.sceneSlug;
      const result = firstScene
        ? await invite.mutateAsync(firstScene)
        : { shareUrl: `${window.location.origin}/auth?mode=signup` };
      await navigator.clipboard.writeText(result.shareUrl);
      setCopied(true);
      toast({ title: "Invite ready", description: "The link is on your clipboard." });
    } catch (error) {
      toast({ title: "Could not copy invite", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow="Your people"
      title="Your network"
      description="Credit follows the people you actually moved — not empty accounts."
      backTo="/dashboard"
    >
      <section className="grid grid-cols-2 gap-3">
        <StatPile label="People" value={data?.people || 0} hint={data?.thisMonth ? `+${data.thisMonth} this month` : "Start with one invite"} />
        <StatPile label="Brought by you" value={data?.direct || 0} hint={`${data?.throughNetwork || 0} through your network`} />
      </section>

      <button
        type="button"
        onClick={handleInvite}
        className="min-h-14 w-full rounded-full bg-primary text-sm font-black text-black"
      >
        {copied ? "Invite copied" : "Invite someone to build"}
      </button>

      <section>
        <h2 className="font-serif text-2xl font-bold">Top contributors</h2>
        <p className="mt-1 text-sm text-white/50">People who bring people who actually show up.</p>
        {network.isLoading ? (
          <div className="mt-4 h-32 animate-pulse rounded-[1.5rem] bg-white/5" />
        ) : data?.topContributors?.length ? (
          <div className="mt-4 space-y-3">
            {data.topContributors.map((person: any) => (
              <article key={person.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold">{person.name}</h3>
                    <p className="mt-1 text-sm text-white/55">{person.people} people · {person.active} active</p>
                  </div>
                  <p className="text-xs text-white/40">{person.verifiedActions} verified</p>
                </div>
                {person.attributedValue ? (
                  <p className="mt-2 text-sm text-primary">J${Math.round(person.attributedValue).toLocaleString()} attributed</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <QuietEmpty
              title="No contributors yet"
              copy="When someone in your network starts bringing people who actually do things, they will show up here."
              action={<Link to="/give" className="text-sm font-bold text-primary">Give them a reason to join</Link>}
            />
          </div>
        )}
      </section>
    </ExperienceShell>
  );
}
