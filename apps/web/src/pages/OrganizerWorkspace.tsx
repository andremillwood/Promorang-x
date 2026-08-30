import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BarChart3, CalendarDays, CheckCircle2, DollarSign, Home, Megaphone, Settings, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureEvents } from "@/data/culture-demo";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";

const organizerRoutes = [
  { label: "Moments", href: "/organizer/events", icon: CalendarDays },
  { label: "Check-ins", href: "/organizer/check-ins", icon: CheckCircle2 },
  { label: "Tickets/Sales", href: "/organizer/tickets", icon: Ticket },
  { label: "Promoters", href: "/organizer/promoters", icon: Megaphone },
  { label: "Scenes", href: "/organizer/communities", icon: Users },
  { label: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  { label: "Settings", href: "/organizer/settings", icon: Settings },
];

const viewMeta: Record<string, { eyebrow: string; title: string; description: string; action: string; actionHref: string }> = {
  "/organizer/events": { eyebrow: "Moments", title: "Build the rooms people remember.", description: "Create, publish, fill, and operate every moment from one place.", action: "Create moment", actionHref: "/create/moment" },
  "/organizer/check-ins": { eyebrow: "Live proof", title: "Know who truly showed up.", description: "Monitor arrivals, verify exceptions, and turn attendance into trusted proof.", action: "Open live activity", actionHref: "/dashboard/activity" },
  "/organizer/tickets": { eyebrow: "Tickets & sales", title: "Move people from interest to entry.", description: "See demand, ticket movement, and revenue without losing the moment behind the numbers.", action: "Open wallet", actionHref: "/wallet" },
  "/organizer/revenue": { eyebrow: "Revenue", title: "See what participation creates.", description: "Track sales, payouts, rewards, and the value retained across your scene.", action: "Open wallet", actionHref: "/wallet" },
  "/organizer/promoters": { eyebrow: "Distribution", title: "Give the right people something worth carrying.", description: "Coordinate promoters, creator drops, and attributed distribution around live moments.", action: "Open PromoPush", actionHref: "/promopush" },
  "/organizer/communities": { eyebrow: "Scenes", title: "Build belonging beyond one event.", description: "Connect recurring moments, people, and places into a scene that compounds.", action: "Open scenes", actionHref: "/scenes" },
  "/organizer/scenes": { eyebrow: "Scenes", title: "Build belonging beyond one event.", description: "Connect recurring moments, people, and places into a scene that compounds.", action: "Open scenes", actionHref: "/scenes" },
  "/organizer/analytics": { eyebrow: "Performance", title: "Read the movement, not just the totals.", description: "Understand conversion, proof, return behavior, and where momentum is forming.", action: "Detailed analytics", actionHref: "/dashboard/analytics" },
  "/organizer/settings": { eyebrow: "Workspace", title: "Shape how your operation appears.", description: "Manage organizer identity, team access, notifications, payouts, and account controls.", action: "Account settings", actionHref: "/dashboard/settings" },
};

export default function OrganizerWorkspace() {
  const { pathname } = useLocation();
  const activeView = viewMeta[pathname];

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title="Organizer Workspace - Promorang"
        description="Manage moments, tickets, check-ins, promoters, scenes, revenue, and performance."
      />
      <section className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/[0.03] p-5 lg:block">
          <Link
            to="/today"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary transition hover:text-orange-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Promorang
          </Link>
          <p className="mt-4 text-xl font-black">Host ops</p>
          <div className="mt-8 space-y-2">
            <Link to="/dashboard" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
              <Home className="h-5 w-5" />
              Host dashboard
            </Link>
            {organizerRoutes.map((route) => (
              <Link key={route.label} to={route.href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${pathname === route.href ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"}`}>
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
        </aside>

        <section className="px-6 pb-12 pt-6 lg:pt-10">
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Link
              to="/today"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Promorang
            </Link>
            <Link to="/dashboard" className="text-xs font-bold text-primary">
              Host dashboard
            </Link>
          </div>
          {/* Top Story Rail */}
          <StoryGamificationRail
            onOpenWheel={() => setWheelOpen(true)}
            onOpenStreak={() => setStreakOpen(true)}
          />

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{activeView?.eyebrow || "Operations layer"}</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">{activeView?.title || "Welcome back, organizer."}</h1>
              <p className="mt-3 max-w-2xl text-white/58">{activeView?.description || "Manage culture without making the consumer experience feel operational."}</p>
            </div>
            <div className="flex gap-3">
              <Link to={activeView?.actionHref || "/create/moment"} className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white">{activeView?.action || "Create Moment"}</Link>
              <Link to="/dashboard/analytics" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-black">Export Report</Link>
            </div>
          </div>

          {/* 3-Column Desktop Layout */}
          <div className="mt-8 flex gap-8 items-start">
            <div className="flex-1 min-w-0 space-y-8">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Revenue", value: "248,590 Gems", sub: "JMD $248,590", icon: DollarSign, delta: "+18.2%" },
                  { label: "Tickets Sold", value: "1,248", sub: "Total entries", icon: Ticket, delta: "+23.6%" },
                  { label: "Check-ins", value: "1,102", sub: "Verified proof", icon: CheckCircle2, delta: "+20.4%" },
                  { label: "New Followers", value: "+342", sub: "Scene growth", icon: Users, delta: "+15.3%" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-lg">
                    <metric.icon className="mb-3 h-7 w-7 rounded-lg bg-primary/15 p-1.5 text-primary" />
                    <p className="text-xs text-white/55 font-bold uppercase">{metric.label}</p>
                    <p className="mt-1 text-2xl font-black text-white">{metric.value}</p>
                    <p className="text-[10px] font-semibold text-white/40">{metric.sub}</p>
                    <p className="mt-2 text-xs font-bold text-emerald-400">{metric.delta}</p>
                  </div>
                ))}
              </div>

              {/* Enhanced Visual Revenue Chart */}
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Revenue Overview</p>
                    <p className="mt-1 text-3xl font-black text-white">248,590 Gems <span className="text-xs font-normal text-zinc-400">(JMD $248,590)</span></p>
                  </div>
                  <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">This Week</span>
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
                  <h2 className="text-xl font-black">Upcoming Moments</h2>
                  <Link to="/dashboard?tab=moments" className="text-sm font-bold text-primary">See all</Link>
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
                        <p className="text-xs text-emerald-400 font-bold">Going</p>
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
