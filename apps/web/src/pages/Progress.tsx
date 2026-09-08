import { Link } from "react-router-dom";
import {
  CREW_RUN_ROLES,
  WORLD_FACTIONS,
  WORLD_FACTION_KEYS,
  WORLD_PATH_TITLES,
  type WorldPathDimension,
} from "@promorang/shared";
import { useExperienceActions, useWorldProgress } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { ConsequenceReceipt } from "@/components/promorang/ConsequenceReceipt";
import { useToast } from "@/hooks/use-toast";

const DIMENSIONS: WorldPathDimension[] = ["discover", "connect", "create", "host", "keep", "support"];

export default function Progress() {
  const query = useWorldProgress();
  const { setFaction } = useExperienceActions();
  const { toast } = useToast();
  const data = query.data;
  const world = data?.world;
  const counts = world?.path?.counts || {};
  const health = world?.health || [];

  const chooseFaction = async (key: string) => {
    try {
      await setFaction.mutateAsync(world?.faction?.key === key ? null : key);
      toast({
        title: world?.faction?.key === key ? "Philosophy cleared" : "Philosophy noted",
        description: "The war is Current versus Static — not people versus people. Mixed-faction Crews stay valid.",
      });
    } catch (error) {
      toast({ title: "Could not save that", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (query.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0D0D0E] text-white">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <ExperienceShell
      eyebrow={world?.dispatch?.eyebrow || world?.slice?.seasonTitle || "Progress"}
      title="What happened because of you"
      description="Verified action only. House and path form from what counted. Territory is standing, not ownership."
      backTo="/dashboard"
    >
      {world?.polarity?.line || world?.dispatch?.line ? (
        <p className="rounded-[1.4rem] border border-white/10 px-4 py-3 text-sm text-white/60">
          {world?.polarity?.line || world.dispatch.line}
        </p>
      ) : null}

      {world?.latestReturn ? (
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Latest Return</p>
          <ConsequenceReceipt receipt={world.latestReturn} />
        </section>
      ) : (
        <QuietEmpty title="Nothing counted yet" copy="Show up, support a Place, or bring someone. Progress starts after proof." />
      )}

      {world?.identity?.line || world?.worldSystem?.resonance?.cue ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">How you move</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">
            {world?.identity?.line || world?.worldSystem?.resonance?.cue}
          </h2>
          <p className="mt-2 text-sm text-white/50">
            House is how you tend to move. Path is what you have demonstrated. Neither is chosen at signup.
          </p>
          {world?.house ? (
            <p className="mt-3 text-sm text-white/60">{world.house.line}</p>
          ) : null}
          {world?.identity?.influenceLine ? (
            <p className="mt-2 text-sm text-white/50">{world.identity.influenceLine}</p>
          ) : null}
          {world?.identity?.reputationLine ? (
            <p className="mt-2 text-sm text-white/50">{world.identity.reputationLine}</p>
          ) : null}
          {world?.identity?.traits?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {world.identity.traits.map((trait: { key: string; title: string; criteria: string }) => (
                <span key={trait.key} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70" title={trait.criteria}>
                  {trait.title}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {world?.worldSystem?.returnChain ? (
        <section className="rounded-[1.4rem] border border-white/10 px-5 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your Throw returned</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">{world.worldSystem.returnChain.heading}</h2>
          <p className="mt-2 text-sm text-white/50">{world.worldSystem.returnChain.line}</p>
          {world.worldSystem.returnChain.moving ? (
            <p className="mt-2 text-xs text-white/35">The chain is still moving.</p>
          ) : null}
        </section>
      ) : null}

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Becoming good at</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          {world?.path?.forming ? world.path.cue : "A path has not formed yet"}
        </h2>
        <p className="mt-2 text-sm text-white/50">Three matching verified actions before a title appears.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DIMENSIONS.map((dimension) => (
            <article key={dimension} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-white/40">{WORLD_PATH_TITLES[dimension]}</p>
              <p className="mt-1 font-serif text-3xl font-bold">{counts[dimension] || 0}</p>
            </article>
          ))}
        </div>
      </section>

      {health.length ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Scene contribution</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">{world?.slice?.sceneTitle || "Kingston After Dark"}</h2>
          <p className="mt-2 text-sm text-white/50">Counts from your verified actions. Empty means nothing has been proven yet.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {health.map((item: { dimension: string; label: string; count: number }) => (
              <article key={item.dimension} className="rounded-[1.3rem] border border-white/10 px-3 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{item.count}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {world?.contest ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Faction war · Current vs Static</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Who is moving the Scene</h2>
          <p className="mt-2 text-sm text-white/50">{world.contest.contestLine}</p>
          {world.contest.mixedCrewNote ? <p className="mt-2 text-sm text-white/45">{world.contest.mixedCrewNote}</p> : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {world.contest.board?.map((row: { key: string; title: string; verb: string; current: number; rank: number }) => (
              <article key={row.key} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40">#{row.rank} · {row.verb}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{row.title}</p>
                <p className="mt-1 text-sm text-white/50">{row.current} verified {row.current === 1 ? "move" : "moves"}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {world?.territories?.length ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Territory · standing</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">Kingston corridors</h2>
          <p className="mt-2 text-sm text-white/50">Not ownership. Standing comes from verified presence and support.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {world.territories.map((area: { key: string; title: string; state: string; standingLine: string; presenceCount: number; supportCount: number }) => (
              <article key={area.key} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40">{area.state}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{area.title}</p>
                <p className="mt-2 text-sm text-white/50">{area.standingLine}</p>
                <p className="mt-2 text-xs text-white/35">
                  {area.presenceCount} presence · {area.supportCount} support
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.6rem] border border-white/10 px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Who you move with</p>
        <h2 className="mt-2 font-serif text-2xl font-bold">{world?.crew?.name || "No Crew yet"}</h2>
        <p className="mt-1 text-sm text-white/50">
          {world?.crew
            ? `${world.crew.runTitle || "Barbican Run"} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 4}`
            : "Form 3–8 people. Run roles are temporary."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
          {Object.values(CREW_RUN_ROLES).filter((role) => role.key !== "chronicler").map((role) => (
            <span key={role.key}>{role.title}</span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to="/crews" className="text-sm font-bold text-primary">Open Crew</Link>
          <Link to="/guilds" className="text-sm font-bold text-primary">
            {world?.guild?.name || "Open Guild"}
          </Link>
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Philosophy · optional</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          {world?.faction ? world.faction.title : "No faction required"}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          House is earned from verified movement. This leftover philosophy does not change it, and it is not a class or a Crew. The war is Current versus Static.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WORLD_FACTION_KEYS.map((key) => {
            const faction = WORLD_FACTIONS[key];
            const active = world?.faction?.key === key;
            return (
              <button
                key={key}
                type="button"
                disabled={setFaction.isPending}
                onClick={() => void chooseFaction(key)}
                className={`rounded-[1.4rem] border px-4 py-4 text-left ${
                  active ? "border-primary/50 bg-primary/10" : "border-white/10"
                }`}
              >
                <p className="font-serif text-xl font-bold">{faction.title}</p>
                <p className="mt-1 text-sm text-white/50">{faction.line}</p>
              </button>
            );
          })}
        </div>
      </section>

      <Link to="/happened" className="block text-center text-xs text-white/30">
        Operator view of what your people did
      </Link>
    </ExperienceShell>
  );
}
