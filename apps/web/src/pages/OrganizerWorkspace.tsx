import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, CalendarDays, CheckCircle2, DollarSign, Megaphone, Settings, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureEvents } from "@/data/culture-demo";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const organizerRoutes: Array<{ label: TranslationKey; href: string; icon: typeof CalendarDays }> = [
  { label: "orgWork.navMoments", href: "/organizer/events", icon: CalendarDays },
  { label: "orgWork.navCheckIns", href: "/organizer/check-ins", icon: CheckCircle2 },
  { label: "orgWork.navTickets", href: "/organizer/tickets", icon: Ticket },
  { label: "orgWork.navPromoters", href: "/organizer/promoters", icon: Megaphone },
  { label: "orgWork.navScenes", href: "/organizer/communities", icon: Users },
  { label: "orgWork.navAnalytics", href: "/organizer/analytics", icon: BarChart3 },
  { label: "orgWork.navSettings", href: "/organizer/settings", icon: Settings },
];

const viewMeta: Record<string, { eyebrow: TranslationKey; title: TranslationKey; description: TranslationKey; action: TranslationKey; actionHref: string }> = {
  "/organizer/events": { eyebrow: "orgWork.eventsEyebrow", title: "orgWork.eventsTitle", description: "orgWork.eventsDesc", action: "orgWork.eventsAction", actionHref: "/create/moment" },
  "/organizer/check-ins": { eyebrow: "orgWork.checkEyebrow", title: "orgWork.checkTitle", description: "orgWork.checkDesc", action: "orgWork.checkAction", actionHref: "/dashboard/activity" },
  "/organizer/tickets": { eyebrow: "orgWork.ticketsEyebrow", title: "orgWork.ticketsTitle", description: "orgWork.ticketsDesc", action: "orgWork.ticketsAction", actionHref: "/wallet" },
  "/organizer/revenue": { eyebrow: "orgWork.revenueEyebrow", title: "orgWork.revenueTitle", description: "orgWork.revenueDesc", action: "orgWork.revenueAction", actionHref: "/wallet" },
  "/organizer/promoters": { eyebrow: "orgWork.promoEyebrow", title: "orgWork.promoTitle", description: "orgWork.promoDesc", action: "orgWork.promoAction", actionHref: "/promopush" },
  "/organizer/communities": { eyebrow: "orgWork.scenesEyebrow", title: "orgWork.scenesTitle", description: "orgWork.scenesDesc", action: "orgWork.scenesAction", actionHref: "/scenes" },
  "/organizer/scenes": { eyebrow: "orgWork.scenesEyebrow", title: "orgWork.scenesTitle", description: "orgWork.scenesDesc", action: "orgWork.scenesAction", actionHref: "/scenes" },
  "/organizer/analytics": { eyebrow: "orgWork.analyticsEyebrow", title: "orgWork.analyticsTitle", description: "orgWork.analyticsDesc", action: "orgWork.analyticsAction", actionHref: "/dashboard/analytics" },
  "/organizer/settings": { eyebrow: "orgWork.settingsEyebrow", title: "orgWork.settingsTitle", description: "orgWork.settingsDesc", action: "orgWork.settingsAction", actionHref: "/dashboard/settings" },
};

export default function OrganizerWorkspace() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const activeView = viewMeta[pathname];

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const metrics: Array<{ label: TranslationKey; value: string; sub: TranslationKey | string; icon: typeof DollarSign; delta: string; subIsKey?: boolean }> = [
    { label: "orgWork.metricRevenue", value: "248,590 Gems", sub: "JMD $248,590", icon: DollarSign, delta: "+18.2%" },
    { label: "orgWork.metricTickets", value: "1,248", sub: "orgWork.metricEntries", icon: Ticket, delta: "+23.6%", subIsKey: true },
    { label: "orgWork.metricCheckIns", value: "1,102", sub: "orgWork.metricProof", icon: CheckCircle2, delta: "+20.4%", subIsKey: true },
    { label: "orgWork.metricFollowers", value: "+342", sub: "orgWork.metricGrowth", icon: Users, delta: "+15.3%", subIsKey: true },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title={t("orgWork.seoTitle")}
        description={t("orgWork.seoDescription")}
      />
      <section className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/[0.03] p-5 lg:block">
          <p className="text-xl font-black">Promorang</p>
          <div className="mt-8 space-y-2">
            <Link to="/organizer" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
              <BarChart3 className="h-5 w-5" />
              {t("orgWork.dashboard")}
            </Link>
            {organizerRoutes.map((route) => (
              <Link key={route.label} to={route.href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${pathname === route.href ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"}`}>
                <route.icon className="h-5 w-5" />
                {t(route.label)}
              </Link>
            ))}
          </div>
        </aside>

        <section className="px-6 pb-12 pt-24 lg:pt-10">
          {/* Top Story Rail */}
          <StoryGamificationRail
            onOpenWheel={() => setWheelOpen(true)}
            onOpenStreak={() => setStreakOpen(true)}
          />

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{activeView ? t(activeView.eyebrow) : t("orgWork.fallbackEyebrow")}</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">{activeView ? t(activeView.title) : t("orgWork.fallbackTitle")}</h1>
              <p className="mt-3 max-w-2xl text-white/58">{activeView ? t(activeView.description) : t("orgWork.fallbackDesc")}</p>
            </div>
            <div className="flex gap-3">
              <Link to={activeView?.actionHref || "/create/moment"} className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white">{activeView ? t(activeView.action) : t("orgWork.fallbackAction")}</Link>
              <Link to="/dashboard/analytics" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-black">{t("orgWork.exportReport")}</Link>
            </div>
          </div>

          {/* 3-Column Desktop Layout */}
          <div className="mt-8 flex gap-8 items-start">
            <div className="flex-1 min-w-0 space-y-8">
              <div className="grid gap-4 md:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-lg">
                    <metric.icon className="mb-3 h-7 w-7 rounded-lg bg-primary/15 p-1.5 text-primary" />
                    <p className="text-xs text-white/55 font-bold uppercase">{t(metric.label)}</p>
                    <p className="mt-1 text-2xl font-black text-white">{metric.value}</p>
                    <p className="text-[10px] font-semibold text-white/40">{metric.subIsKey ? t(metric.sub as TranslationKey) : metric.sub}</p>
                    <p className="mt-2 text-xs font-bold text-emerald-400">{metric.delta}</p>
                  </div>
                ))}
              </div>

              {/* Enhanced Visual Revenue Chart */}
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("orgWork.revenueOverview")}</p>
                    <p className="mt-1 text-3xl font-black text-white">248,590 Gems <span className="text-xs font-normal text-zinc-400">(JMD $248,590)</span></p>
                  </div>
                  <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">{t("orgWork.thisWeek")}</span>
                </div>

                <div className="h-64 rounded-xl border border-zinc-800 bg-gradient-to-b from-orange-500/10 to-transparent p-4 flex items-end gap-3">
                  {[32, 46, 40, 58, 70, 62, 78, 92, 86, 74, 96].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col justify-end h-full group cursor-pointer">
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-md group-hover:brightness-125 transition-all shadow-lg shadow-orange-500/20"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Moments */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black">{t("orgWork.upcoming")}</h2>
                  <Link to="/dashboard?tab=moments" className="text-sm font-bold text-primary">{t("orgWork.seeAll")}</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cultureEvents.slice(0, 4).map((event) => (
                    <Link key={event.slug} to={`/events/${event.slug}`} className="flex gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 transition hover:border-primary/40">
                      <img src={event.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-sm text-white">{event.title}</p>
                        <p className="text-xs text-white/50">{event.date}, {event.time}</p>
                        <p className="text-xs text-white/50">{event.place}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-white">{event.attending}</p>
                        <p className="text-xs text-emerald-400 font-bold">{t("orgWork.going")}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Persistent Right Utility Sidebar */}
            <RightUtilityRail
              onOpenSlashModal={() => setSlashOpen(true)}
              onOpenStreakModal={() => setStreakOpen(true)}
            />
          </div>
        </section>
      </section>

      {/* Gamification Modals */}
      <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
      <TeamSlashModal isOpen={slashOpen} onClose={() => setSlashOpen(false)} />
      <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
    </main>
  );
}
