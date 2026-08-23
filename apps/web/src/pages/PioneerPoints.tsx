import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, Clock3, Sparkles, Users, CircleDot } from "lucide-react";
import SEO from "@/components/SEO";
import { usePioneerPoints } from "@/hooks/usePioneerPoints";
import { useI18n } from "@/i18n/I18nContext";

const labels: Record<string, string> = {
  member: "Active member", creator: "Creator", host: "Moment host",
  venue: "Venue", referrer: "Connector", community_builder: "Community builder",
};

const eventLabels: Record<string, string> = {
  daily_active: "Meaningful active day",
  qualified_engagement: "Qualified engagement",
  original_content: "Original content published",
  moment_hosted: "Moment hosted",
  moment_quality: "Moment quality",
  venue_onboarded: "Venue onboarded",
  moment_facilitated: "Moment facilitated",
  qualified_referral: "Qualified person joined",
  community_contribution: "Community contribution",
};

export default function PioneerPoints() {
  const { t, formatNumber } = useI18n();
  const { data, isLoading, error } = usePioneerPoints();
  const total = data?.totals;

  return (
    <main className="min-h-screen bg-[#070707] pb-20 text-white">
      <SEO title={t("pioneerPoints.seoTitle")} description={t("pioneerPoints.seoDesc")} />
      <section className="border-b border-white/10 pt-28">
        <div className="container px-6 pb-14">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pioneerPoints.seasonTag")}</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.06em] md:text-7xl">
            {t("pioneerPoints.titlePart1")}<br /><span className="text-primary">{t("pioneerPoints.titlePart2")}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
            {t("pioneerPoints.subtitle")}
          </p>
        </div>
      </section>

      <div className="container px-6 py-10">
        {isLoading && <div className="h-64 animate-pulse rounded-3xl bg-white/[0.05]" />}
        {error && <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5">{t("pioneerPoints.loadError")}</div>}
        {data && !data.season && <div className="rounded-2xl border border-white/10 p-6">{t("pioneerPoints.noSeason")}</div>}
        {data?.season && total && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-primary/30 bg-primary/[0.08] p-6 md:col-span-2">
                <div className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5" /><span className="text-xs font-black uppercase tracking-widest">{t("pioneerPoints.verifiedLabel")}</span></div>
                <p className="mt-6 text-6xl font-black tracking-[-0.06em]">{formatNumber(total.verified_points)}</p>
                <p className="mt-3 text-sm text-white/50">{t("pioneerPoints.verifiedDisclaimer")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <Clock3 className="h-5 w-5 text-amber-300" />
                <p className="mt-6 text-4xl font-black">{formatNumber(total.pending_points)}</p>
                <p className="mt-1 text-sm text-white/45">{t("pioneerPoints.awaitingVerification")}</p>
                <div className="mt-8 border-t border-white/10 pt-4 text-sm text-white/60">
                  {total.rank ? t("pioneerPoints.rankFormat", { rank: total.rank.toString(), count: formatNumber(total.participant_count || 0) }) : t("pioneerPoints.verifiedActionsCount", { count: formatNumber(total.verified_actions || 0) })}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("pioneerPoints.identityEyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("pioneerPoints.identityTitle")}</h2></div><Link to="/pioneers" className="text-xs font-black text-white/45 hover:text-primary">{t("pioneerPoints.programGuide")}</Link></div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {data.roles.length ? data.roles.map((role) => (
                  <article key={role.contributor_type} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-white/40">{labels[role.contributor_type] || role.contributor_type}</p>
                    <p className="mt-4 text-3xl font-black">{formatNumber(role.verified_points)}</p>
                    <p className="text-xs text-white/40">{t("pioneerPoints.pendingSuffix", { count: formatNumber(role.pending_points) })}</p>
                  </article>
                )) : <div className="rounded-2xl border border-dashed border-white/15 p-6 md:col-span-2 lg:col-span-3"><p className="font-black">{t("pioneerPoints.noRolesTitle")}</p><p className="mt-2 text-sm text-white/45">{t("pioneerPoints.noRolesDesc")}</p></div>}
              </div>
            </section>

            <section className="mt-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="text-2xl font-black">{t("pioneerPoints.waysToBuild")}</h2>
                <div className="mt-5 space-y-4 text-sm text-white/65">
                  <Link to="/create/moment" className="flex items-center justify-between"><span className="flex items-center gap-3"><CalendarDays className="text-primary" />{t("pioneerPoints.hostMomentAction")}</span><ArrowRight /></Link>
                  <Link to="/dashboard/venues/add" className="flex items-center justify-between"><span className="flex items-center gap-3"><Building2 className="text-primary" />{t("pioneerPoints.onboardVenueAction")}</span><ArrowRight /></Link>
                  <Link to="/promopush/promoter" className="flex items-center justify-between"><span className="flex items-center gap-3"><Users className="text-primary" />{t("pioneerPoints.inviteAction")}</span><ArrowRight /></Link>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="text-2xl font-black">{t("pioneerPoints.promiseTitle")}</h2>
                <p className="mt-4 text-sm leading-6 text-white/55">
                  {t("pioneerPoints.promiseDesc")}
                </p>
                <div className="mt-5 flex gap-3 text-xs text-white/45"><CheckCircle2 className="h-4 w-4 text-primary" />{t("pioneerPoints.promiseFeatures")}</div>
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("pioneerPoints.receiptsEyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("pioneerPoints.receiptsTitle")}</h2></div><CircleDot className="h-5 w-5 text-primary" /></div>
              <div className="mt-6 divide-y divide-white/10">
                {data.recent.length ? data.recent.map((event) => (
                  <article key={event.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div><p className="font-black">{eventLabels[event.event_type] || event.event_type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-white/38">{labels[event.contributor_type] || event.contributor_type} · {new Date(event.occurred_at).toLocaleDateString()}</p></div>
                    <div className="flex items-center gap-3"><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${event.status === "verified" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-300/10 text-amber-200"}`}>{event.status}</span><span className="font-black text-primary">+{formatNumber(event.points)}</span></div>
                  </article>
                )) : <div className="py-8 text-sm text-white/42">{t("pioneerPoints.noReceipts")}</div>}
              </div>
            </section>

            {!!data.venues?.length && <section className="mt-8">
              <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("pioneerPoints.venuesEyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("pioneerPoints.venuesTitle")}</h2></div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {data.venues.map((venue) => {
                  const verified = venue.events.filter((event) => event.status === "verified").reduce((sum, event) => sum + Number(event.points), 0);
                  const pending = venue.events.filter((event) => event.status === "pending").reduce((sum, event) => sum + Number(event.points), 0);
                  return <article key={venue.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                    {venue.image_url && <img src={venue.image_url} alt="" className="h-32 w-full object-cover" />}
                    <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-black">{venue.name}</h3><p className="mt-1 text-xs text-white/40">{venue.address}</p></div><Building2 className="h-5 w-5 text-primary" /></div>
                      <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-black/25 p-3"><p className="text-2xl font-black">{formatNumber(verified)}</p><p className="text-[10px] uppercase text-emerald-300">{t("pioneerPoints.verifiedTag")}</p></div><div className="rounded-xl bg-black/25 p-3"><p className="text-2xl font-black">{formatNumber(pending)}</p><p className="text-[10px] uppercase text-amber-200">{t("pioneerPoints.pendingTag")}</p></div></div>
                      {!venue.events.length && <p className="mt-4 text-xs leading-5 text-white/42">{t("pioneerPoints.venuePendingMsg")}</p>}
                    </div>
                  </article>;
                })}
              </div>
            </section>}

            {!!data.notifications?.length && <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
              <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("pioneerPoints.notificationsEyebrow")}</p><h2 className="mt-1 text-2xl font-black">{t("pioneerPoints.notificationsTitle")}</h2></div>
              <div className="mt-5 divide-y divide-white/10">
                {data.notifications.map((notification) => <div key={notification.id} className="flex gap-3 py-4"><span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.read_at?"bg-white/20":"bg-primary"}`} /><div><p className="font-black">{notification.title}</p><p className="mt-1 text-sm text-white/45">{notification.body}</p><p className="mt-2 text-[10px] uppercase text-white/25">{new Date(notification.created_at).toLocaleString()}</p></div></div>)}
              </div>
            </section>}
          </>
        )}
      </div>
    </main>
  );
}
