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
        description: "This is not a class and not a war. Mixed-faction Crews stay valid.",
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
      description="Verified action only. Paths form from behaviour. Factions are optional philosophy — never required at signup."
      backTo="/dashboard"
    >
      {world?.dispatch?.line ? (
        <p className="rounded-[1.4rem] border border-white/10 px-4 py-3 text-sm text-white/60">{world.dispatch.line}</p>
      ) : null}

      {world?.latestReturn ? (
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Latest Return</p>
          <ConsequenceReceipt receipt={world.latestReturn} />
        </section>
      ) : (
        <QuietEmpty title="Nothing counted yet" copy="Show up, support a Place, or bring someone. Progress starts after proof." />
      )}

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

      <section className="rounded-[1.6rem] border border-white/10 px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Who you move with</p>
        <h2 className="mt-2 font-serif text-2xl font-bold">{world?.crew?.name || "No Crew yet"}</h2>
        <p className="mt-1 text-sm text-white/50">
          {world?.crew
            ? `${world.crew.runTitle || "Barbican Run"} · ${world.crew.runCompleted || 0}/${world.crew.runTotal || 4}`
            : "Form 3–8 people. Run roles are temporary."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
          {Object.values(CREW_RUN_ROLES).map((role) => (
            <span key={role.key}>{role.title}</span>
          ))}
        </div>
        <Link to="/crews" className="mt-4 inline-block text-sm font-bold text-primary">
          Open Crew
        </Link>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Philosophy · optional</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          {world?.faction ? world.faction.title : "No faction required"}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          A faction is how you like to strengthen a Scene. It is not a class, not a Crew, and not a war.
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
