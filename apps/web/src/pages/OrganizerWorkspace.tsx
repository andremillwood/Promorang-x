import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, DollarSign, Megaphone, Settings, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureEvents } from "@/data/culture-demo";

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
  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title="Organizer Workspace - Promorang"
        description="Manage moments, tickets, check-ins, promoters, scenes, revenue, and performance."
      />
      <section className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-white/[0.03] p-5 lg:block">
          <p className="text-xl font-black">Promorang</p>
          <div className="mt-8 space-y-2">
            <Link to="/organizer" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </Link>
            {organizerRoutes.map((route) => (
              <Link key={route.label} to={route.href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${pathname === route.href ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"}`}>
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
        </aside>

        <section className="px-6 pb-12 pt-24 lg:pt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { label: "Revenue", value: "JMD $248,590", icon: DollarSign, delta: "+18.2%" },
              { label: "Tickets Sold", value: "1,248", icon: Ticket, delta: "+23.6%" },
              { label: "Check-ins", value: "1,102", icon: CheckCircle2, delta: "+20.4%" },
              { label: "New Followers", value: "+342", icon: Users, delta: "+15.3%" },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
                <metric.icon className="mb-5 h-7 w-7 rounded-md bg-primary/15 p-1.5 text-primary" />
                <p className="text-sm text-white/55">{metric.label}</p>
                <p className="mt-1 text-3xl font-black">{metric.value}</p>
                <p className="mt-2 text-sm font-bold text-green-400">{metric.delta}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white/55">Revenue Overview</p>
                  <p className="mt-1 text-4xl font-black">JMD $248,590</p>
                </div>
                <span className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold">This Week</span>
              </div>
              <div className="mt-8 h-64 rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(255,106,0,0.18),transparent)] p-4">
                <div className="flex h-full items-end gap-3">
                  {[32, 46, 40, 58, 70, 62, 78, 92, 86, 74, 96].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col justify-end">
                      <div className="rounded-t bg-primary" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">Upcoming Moments</h2>
                <Link to="/dashboard?tab=moments" className="text-sm font-bold text-primary">See all</Link>
              </div>
              <div className="space-y-3">
                {cultureEvents.slice(0, 4).map((event) => (
                  <Link key={event.slug} to={`/events/${event.slug}`} className="flex gap-3 rounded-lg border border-white/10 bg-black/30 p-3 transition hover:border-primary/40">
                    <img src={event.image} alt="" className="h-16 w-16 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{event.title}</p>
                      <p className="text-xs text-white/50">{event.date}, {event.time}</p>
                      <p className="text-xs text-white/50">{event.place}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{event.attending}</p>
                      <p className="text-xs text-green-400">Going</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/dashboard?tab=moments" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-black">
                Manage existing dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
