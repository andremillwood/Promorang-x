import { Link } from "react-router-dom";
import {
  CREW_RUN_ROLES,
  WORLD_FACTIONS,
  WORLD_FACTION_KEYS,
  presentContestLine,
  presentWorldRunTitle,
  resolveWorldInvitation,
  type WorldPathDimension,
} from "@promorang/shared";
import { useExperienceActions, useWorldProgress } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, WorldInvitationCard } from "@/components/people/ExperienceShell";
import { ConsequenceReceipt } from "@/components/promorang/ConsequenceReceipt";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { localizedCrewRoleTitle, localizedFactionCopy, localizedPathTitle } from "@/i18n/localize";

const DIMENSIONS: WorldPathDimension[] = ["discover", "connect", "create", "host", "keep", "support"];

export default function Progress() {
  const { t, formatNumber } = useI18n();
  const query = useWorldProgress();
  const to = useExperiencePath();
  const { setFaction } = useExperienceActions();
  const { toast } = useToast();
  const data = query.data;
  const world = data?.world;
  const invitation = world?.invitation || world?.worldSystem?.invitation || resolveWorldInvitation({
    identityLine: world?.identity?.line,
    hasLiveMoment: Boolean(world?.currentMove?.href && String(world.currentMove.href).includes("/moments/")),
    nextHref: world?.currentMove?.href || "/discover",
  });
  const counts = world?.path?.counts || {};
  const health = world?.health || [];

  const chooseFaction = async (key: string) => {
    try {
      await setFaction.mutateAsync(world?.faction?.key === key ? null : key);
      toast({
        title: world?.faction?.key === key ? t("progress.philosophyCleared") : t("progress.philosophyNoted"),
        description: t("progress.philosophyCopy"),
      });
    } catch (error) {
      toast({ title: t("progress.saveFailed"), description: (error as Error).message, variant: "destructive" });
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
      eyebrow={world?.dispatch?.eyebrow || world?.slice?.seasonTitle || t("progress.eyebrow")}
      title={t("progress.title")}
      description={t("progress.copy")}
      backTo="/dashboard"
    >
      {world?.polarity?.line || world?.dispatch?.line ? (
        <p className="rounded-[1.4rem] border border-white/10 px-4 py-3 text-sm text-white/60">
          {world?.polarity?.line || world.dispatch.line}
        </p>
      ) : null}

      {world?.latestReturn ? (
        <section className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("people.latestReturn")}</p>
          <ConsequenceReceipt receipt={world.latestReturn} />
        </section>
      ) : invitation ? (
        <WorldInvitationCard invitation={invitation} />
      ) : null}

      {world?.identity?.line || world?.worldSystem?.resonance?.cue || invitation?.formingLine ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.howYouMove")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">
            {world?.identity?.line || world?.worldSystem?.resonance?.cue || t("progress.pathUnnamed")}
          </h2>
          <p className="mt-2 text-sm text-white/50">
            {invitation?.formingLine || t("progress.housePath")}
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.throwReturned")}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">{world.worldSystem.returnChain.heading}</h2>
          <p className="mt-2 text-sm text-white/50">{world.worldSystem.returnChain.line}</p>
          {world.worldSystem.returnChain.moving ? (
            <p className="mt-2 text-xs text-white/35">{t("progress.chainMoving")}</p>
          ) : null}
        </section>
      ) : null}

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.becoming")}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          {world?.path?.forming ? world.path.cue : t("progress.pathNotFormed")}
        </h2>
        <p className="mt-2 text-sm text-white/50">{t("progress.threeActions")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DIMENSIONS.map((dimension) => (
            <article key={dimension} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-white/40">{localizedPathTitle(dimension, t)}</p>
              <p className="mt-1 font-serif text-3xl font-bold">{formatNumber(counts[dimension] || 0)}</p>
            </article>
          ))}
        </div>
      </section>

      {health.length ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.sceneContribution")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">{world?.slice?.sceneTitle || t("progress.kingstonAfterDark")}</h2>
          <p className="mt-2 text-sm text-white/50">{t("progress.countsCopy")}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {health.map((item: { dimension: string; label: string; count: number }) => (
              <article key={item.dimension} className="rounded-[1.3rem] border border-white/10 px-3 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{formatNumber(item.count)}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {world?.contest || world?.polarity ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.currentVsStatic")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">
            {(world.contest?.totalCurrent || 0) > 0 ? t("progress.whoMoving") : t("progress.sceneWaiting")}
          </h2>
          <p className="mt-2 text-sm text-white/50">
            {(world.contest?.totalCurrent || 0) > 0
              ? presentContestLine(world.contest?.contestLine, world.contest?.totalCurrent)
              : world.polarity?.line || presentContestLine(world.contest?.contestLine, world.contest?.totalCurrent)}
          </p>
          {(world.contest?.totalCurrent || 0) > 0 ? (
            <>
              {world.contest?.mixedCrewNote ? <p className="mt-2 text-sm text-white/45">{world.contest.mixedCrewNote}</p> : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {world.contest?.board?.map((row: { key: string; title: string; verb: string; current: number; rank: number }) => {
                  const faction = WORLD_FACTIONS[row.key as keyof typeof WORLD_FACTIONS]
                    ? localizedFactionCopy(row.key, t)
                    : { title: row.title, verb: row.verb, line: "" };
                  return (
                  <article key={row.key} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-widest text-white/40">#{row.rank} · {faction.verb}</p>
                    <p className="mt-1 font-serif text-2xl font-bold">{faction.title}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {t(row.current === 1 ? "progress.moveOne" : "progress.moveMany", { count: formatNumber(row.current) })}
                    </p>
                  </article>
                  );
                })}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {world?.territories?.length ? (
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.territory")}</p>
          <h2 className="mt-2 font-serif text-3xl font-bold">{t("progress.corridors")}</h2>
          <p className="mt-2 text-sm text-white/50">{t("progress.territoryCopy")}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {world.territories.map((area: { key: string; title: string; state: string; standingLine: string; presenceCount: number; supportCount: number }) => (
              <article key={area.key} className="rounded-[1.4rem] border border-white/10 px-4 py-4">
                <p className="text-[10px] uppercase tracking-widest text-white/40">{area.state}</p>
                <p className="mt-1 font-serif text-2xl font-bold">{area.title}</p>
                <p className="mt-2 text-sm text-white/50">{area.standingLine}</p>
                <p className="mt-2 text-xs text-white/35">
                  {t("progress.presenceSupport", {
                    presence: formatNumber(area.presenceCount),
                    support: formatNumber(area.supportCount),
                  })}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.6rem] border border-white/10 px-5 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.whoMoveWith")}</p>
        <h2 className="mt-2 font-serif text-2xl font-bold">{world?.crew?.name || t("progress.noCrew")}</h2>
        <p className="mt-1 text-sm text-white/50">
          {world?.crew
            ? t("progress.crewRun", {
                title: presentWorldRunTitle(world.crew.runTitle),
                completed: formatNumber(world.crew.runCompleted || 0),
                total: formatNumber(world.crew.runTotal || 4),
              })
            : t("progress.formCrew")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
          {Object.values(CREW_RUN_ROLES).filter((role) => role.key !== "chronicler").map((role) => (
            <span key={role.key}>{localizedCrewRoleTitle(role.key, t)}</span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to={to("/crews")} className="text-sm font-bold text-primary">{t("progress.openCrew")}</Link>
          <Link to={to("/guilds")} className="text-sm font-bold text-primary">
            {world?.guild?.name || t("progress.openGuild")}
          </Link>
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("progress.philosophyOptional")}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          {world?.house?.title ? t("progress.houseNamed", { title: world.house.title }) : t("progress.houseForms")}
        </h2>
        <p className="mt-2 text-sm text-white/50">{t("progress.philosophyLead")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WORLD_FACTION_KEYS.map((key) => {
            const faction = localizedFactionCopy(key, t);
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
        {t("progress.operatorView")}
      </Link>
    </ExperienceShell>
  );
}
