import { useState } from "react";
import { Link } from "react-router-dom";
import { CREW_RUN_ROLE_KEYS, CREW_RUN_ROLES, KINGSTON_AFTER_DARK_SLICE, presentWorldRunTitle } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceActions, useMyCrew } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";

export default function Crews() {
  const { user } = useAuth();
  const crewQuery = useMyCrew();
  const { createCrew, joinCrew, setCrewRole } = useExperienceActions();
  const { toast } = useToast();
  const [name, setName] = useState("Night Owls");
  const [code, setCode] = useState("");
  const crew = crewQuery.data;
  const run = crew?.run;

  const copyInvite = async () => {
    if (!crew?.inviteCode) return;
    await navigator.clipboard.writeText(crew.inviteCode);
    toast({ title: "Invite code copied", description: "Send it to 2–7 people you actually move with." });
  };

  const handleCreate = async () => {
    try {
      await createCrew.mutateAsync({ name: name.trim() || "Night Owls" });
      toast({ title: "Crew formed", description: "Invite people. The Run starts when you move together." });
    } catch (error) {
      toast({ title: "Could not form a Crew", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleJoin = async () => {
    try {
      await joinCrew.mutateAsync(code.trim().toUpperCase());
      toast({ title: "You’re in", description: "Your next verified move counts for the Crew." });
    } catch (error) {
      toast({ title: "Could not join", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (crewQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return (
      <ExperienceShell eyebrow="Crew" title="Who do you move with?" backTo="/dashboard">
        <QuietEmpty title="Sign in to form a Crew" copy="Crews are 3–8 people. Not a social network." action={<Link to="/auth" className="text-sm font-bold text-primary">Sign in</Link>} />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow="Who you move with"
      title={crew?.name || "Form a Crew"}
      description="3–8 people. One Run. Progress only from verified action."
      backTo="/dashboard"
    >
      {crew ? (
        <>
          <section className="overflow-hidden rounded-[1.6rem] border border-primary/30 bg-primary/10">
            {(run?.imageUrl || KINGSTON_AFTER_DARK_SLICE.imageUrl) ? (
              <img
                src={run?.imageUrl || KINGSTON_AFTER_DARK_SLICE.imageUrl}
                alt={presentWorldRunTitle(run?.title)}
                className="h-44 w-full object-cover sm:h-52"
              />
            ) : null}
            <div className="px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{presentWorldRunTitle(run?.title)}</p>
            <p className="mt-2 font-serif text-3xl font-bold">
              {run?.completed || 0}/{run?.total || 4} objectives counted
            </p>
            <p className="mt-2 text-sm text-white/60">
              {crew.needsPeople
                ? `Need ${crew.needsPeople} more ${crew.needsPeople === 1 ? "person" : "people"} before this is a Crew.`
                : "Show up, support a Place, bring someone, keep a Memory."}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void copyInvite()}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-black"
              >
                Copy invite · {crew.inviteCode}
              </button>
              <Link
                to="/discover"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold text-white"
              >
                Find tonight’s move
              </Link>
            </div>
            </div>
          </section>

          {(crew.places || KINGSTON_AFTER_DARK_SLICE.places).length ? (
            <section>
              <h2 className="font-serif text-2xl font-bold">Barbican and the corridors</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(crew.places || KINGSTON_AFTER_DARK_SLICE.places).map((place: { name: string; area: string; role: string; imageUrl?: string | null }) => (
                  <article key={place.name} className="overflow-hidden rounded-[1.4rem] border border-white/10">
                    {place.imageUrl ? <img src={place.imageUrl} alt={place.name} className="h-32 w-full object-cover" /> : null}
                    <div className="px-4 py-3">
                      <p className="font-serif text-lg font-bold">{place.name}</p>
                      <p className="mt-1 text-xs text-white/45">{place.area} · {place.role}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="font-serif text-2xl font-bold">People</h2>
            <div className="mt-3 space-y-2">
              {crew.members?.map((member: { userId: string; name: string; pathCue?: string | null; pathTitle?: string | null; runRole?: { key: string; title: string; job: string } | null; house?: { key: string; title: string; color?: string } | null }) => (
                <article key={member.userId} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                  <p className="font-serif text-xl font-bold">{member.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
                    {[member.runRole?.title, member.house ? `${member.house.title} House` : null, member.pathCue || "A path has not formed yet"].filter(Boolean).join(" · ")}
                  </p>
                  {member.userId === user.id && !member.runRole ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {CREW_RUN_ROLE_KEYS.map((role) => (
                        <button
                          key={role}
                          type="button"
                          disabled={setCrewRole.isPending}
                          onClick={() => void setCrewRole.mutateAsync({ role }).catch((error) => toast({ title: "Role still open for someone else", description: (error as Error).message, variant: "destructive" }))}
                          className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/70"
                        >
                          {CREW_RUN_ROLES[role].title}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Scene scale</p>
            <h2 className="mt-2 font-serif text-2xl font-bold">Federate this Crew</h2>
            <p className="mt-1 text-sm text-white/50">A Guild is 2–6 Crews coordinating one Scene. Still no Game tab.</p>
            <Link to="/guilds" className="mt-4 inline-block text-sm font-bold text-primary">Open Guilds</Link>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold">{presentWorldRunTitle(run?.title)}</h2>
            <ol className="mt-3 space-y-2">
              {(run?.objectives || KINGSTON_AFTER_DARK_SLICE.objectives).map((objective: { key: string; title: string; proof: string; complete?: boolean; imageUrl?: string | null }) => (
                <li key={objective.key} className="overflow-hidden rounded-[1.4rem] border border-white/10">
                  {objective.imageUrl ? (
                    <img src={objective.imageUrl} alt={objective.title} className="h-36 w-full object-cover" />
                  ) : null}
                  <div className="px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      {objective.complete ? "Counted" : "Open"}
                    </p>
                    <p className="mt-1 font-serif text-xl font-bold">{objective.title}</p>
                    <p className="mt-1 text-sm text-white/50">{objective.proof}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : (
        <>
          <section className="overflow-hidden rounded-[1.6rem] border border-white/10">
            <img
              src={KINGSTON_AFTER_DARK_SLICE.imageUrl}
              alt={KINGSTON_AFTER_DARK_SLICE.runTitle}
              className="h-44 w-full object-cover sm:h-52"
            />
            <div className="px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{KINGSTON_AFTER_DARK_SLICE.runTitle}</p>
              <h2 className="mt-2 font-serif text-2xl font-bold">Move through Kingston together</h2>
              <p className="mt-2 text-sm text-white/50">Show up at a Moment, support a Place, bring someone, keep a Memory.</p>
            </div>
          </section>
          <QuietEmpty
            title="No Crew yet"
            copy="This is not the invite ladder. Form 3–8 people you will actually go out with."
          />
          <section className="space-y-3 rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Form one</p>
            <label className="block text-sm text-white/60">
              Crew name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-white"
              />
            </label>
            <button
              type="button"
              disabled={createCrew.isPending}
              onClick={() => void handleCreate()}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
            >
              {createCrew.isPending ? "Forming…" : "Form Crew"}
            </button>
          </section>
          <section className="space-y-3 rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Or join</p>
            <label className="block text-sm text-white/60">
              Invite code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="CRW-XXXXXX"
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 font-mono text-white uppercase"
              />
            </label>
            <button
              type="button"
              disabled={joinCrew.isPending || !code.trim()}
              onClick={() => void handleJoin()}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 text-sm font-bold text-white disabled:opacity-60"
            >
              {joinCrew.isPending ? "Joining…" : "Join Crew"}
            </button>
          </section>
        </>
      )}
    </ExperienceShell>
  );
}
