import { useState } from "react";
import { Link } from "react-router-dom";
import { KINGSTON_AFTER_DARK_SLICE } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useExperienceActions, useMyCrew, useMyGuild } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";

export default function Guilds() {
  const { user } = useAuth();
  const crewQuery = useMyCrew();
  const guildQuery = useMyGuild();
  const { createGuild, joinGuild } = useExperienceActions();
  const { toast } = useToast();
  const [name, setName] = useState("Night Watch");
  const [code, setCode] = useState("");
  const crew = crewQuery.data;
  const guild = guildQuery.data;

  const copyInvite = async () => {
    if (!guild?.inviteCode) return;
    await navigator.clipboard.writeText(guild.inviteCode);
    toast({ title: "Invite code copied", description: "Send it to another Crew already moving in this Scene." });
  };

  const handleCreate = async () => {
    try {
      await createGuild.mutateAsync({ name: name.trim() || "Night Watch" });
      toast({ title: "Guild formed", description: "Your Crew is the first seat. Invite 1–5 more Crews." });
    } catch (error) {
      toast({ title: "Could not form a Guild", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleJoin = async () => {
    try {
      await joinGuild.mutateAsync(code.trim().toUpperCase());
      toast({ title: "Your Crew is in", description: "The Guild now coordinates at Scene scale." });
    } catch (error) {
      toast({ title: "Could not join", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (guildQuery.isLoading || crewQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return (
      <ExperienceShell eyebrow="Guild" title="Who coordinates the Scene?" backTo="/dashboard">
        <QuietEmpty title="Sign in to form a Guild" copy="A Guild is 2–6 Crews. Not a hierarchy." action={<Link to="/auth" className="text-sm font-bold text-primary">Sign in</Link>} />
      </ExperienceShell>
    );
  }

  if (!crew) {
    return (
      <ExperienceShell
        eyebrow="Guild"
        title="Form a Crew first"
        description="Guilds are Crews coordinating at Scene scale. Individuals do not join a Guild alone."
        backTo="/crews"
      >
        <QuietEmpty
          title="No Crew yet"
          copy="Form 3–8 people you will actually go out with. Then federate with other Crews."
          action={<Link to="/crews" className="text-sm font-bold text-primary">Open Crews</Link>}
        />
      </ExperienceShell>
    );
  }

  return (
    <ExperienceShell
      eyebrow="Scene coordination"
      title={guild?.name || "Form a Guild"}
      description="2–6 Crews. One Scene. Flat — not an upline. Progress still comes from verified action."
      backTo="/dashboard"
    >
      {guild ? (
        <>
          <section className="rounded-[1.6rem] border border-primary/30 bg-primary/10 px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              {guild.scene?.title || KINGSTON_AFTER_DARK_SLICE.sceneTitle}
            </p>
            <p className="mt-2 font-serif text-3xl font-bold">
              {guild.crewCount || 0} Crews coordinating
            </p>
            <p className="mt-2 text-sm text-white/60">{guild.readiness?.line}</p>
            {guild.contest?.mixedCrewNote ? (
              <p className="mt-3 text-sm text-white/55">{guild.contest.mixedCrewNote}</p>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void copyInvite()}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-black"
              >
                Copy invite · {guild.inviteCode}
              </button>
              <Link
                to="/progress"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold text-white"
              >
                Season contest
              </Link>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold">Crews</h2>
            <div className="mt-3 space-y-2">
              {guild.crews?.map((item: { id: string; name: string; size: number; runTitle?: string | null; runCompleted?: number; runTotal?: number }) => (
                <article key={item.id} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                  <p className="font-serif text-xl font-bold">{item.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
                    {item.size} {item.size === 1 ? "person" : "people"}
                    {item.runTitle ? ` · ${item.runTitle} ${item.runCompleted || 0}/${item.runTotal || 4}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <QuietEmpty
            title="No Guild yet"
            copy={`${crew.name} can federate with 1–5 other Crews. This is not the invite ladder.`}
          />
          <section className="space-y-3 rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Form one</p>
            <label className="block text-sm text-white/60">
              Guild name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-white"
              />
            </label>
            <button
              type="button"
              disabled={createGuild.isPending}
              onClick={() => void handleCreate()}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
            >
              {createGuild.isPending ? "Forming…" : "Form Guild"}
            </button>
          </section>
          <section className="space-y-3 rounded-[1.6rem] border border-white/10 px-5 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Or attach this Crew</p>
            <label className="block text-sm text-white/60">
              Invite code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="GLD-XXXXXX"
                className="mt-2 h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 font-mono text-white uppercase"
              />
            </label>
            <button
              type="button"
              disabled={joinGuild.isPending || !code.trim()}
              onClick={() => void handleJoin()}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 text-sm font-bold text-white disabled:opacity-60"
            >
              {joinGuild.isPending ? "Joining…" : "Join Guild"}
            </button>
          </section>
        </>
      )}
      <Link to="/crews" className="block text-center text-xs text-white/30">
        Back to your Crew
      </Link>
    </ExperienceShell>
  );
}
