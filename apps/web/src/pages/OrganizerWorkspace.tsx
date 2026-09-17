import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  QrCode,
  Radio,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useCanonicalMomentFeed } from "@/hooks/useCanonicalMomentFeed";
import { momentLifecycleLabel } from "@/services/moment-feed";

type ViewMeta = {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  actionHref: string;
};

const viewMeta: Record<string, ViewMeta> = {
  "/organizer/events": { eyebrow: "Host · Moments", title: "Build the rooms people remember.", description: "Create, publish, fill, and operate every Moment from one place.", action: "Create Moment", actionHref: "/create/moment" },
  "/organizer/check-ins": { eyebrow: "Host · Door proof", title: "Know who truly showed up.", description: "Run the door from the same Host workspace. A guest presents their PromoCard; each accepted arrival becomes trusted proof.", action: "Open door scanner", actionHref: "/staff/scanner" },
  "/organizer/tickets": { eyebrow: "Host · Entry", title: "Move people from interest to entry.", description: "See demand, ticket movement, and entry without losing the Moment behind the totals.", action: "Open wallet", actionHref: "/wallet" },
  "/organizer/revenue": { eyebrow: "Host · Return", title: "See what participation creates.", description: "Track sales, payouts, rewards, and the value retained across your Scene.", action: "Open wallet", actionHref: "/wallet" },
  "/organizer/promoters": { eyebrow: "Host · Distribution", title: "Give the right people something worth carrying.", description: "Coordinate creator drops and attributed distribution around live Moments.", action: "Open PromoPush", actionHref: "/promopush" },
  "/organizer/communities": { eyebrow: "Host · Scenes", title: "Build belonging beyond one event.", description: "Connect recurring Moments, people, and places into a Scene that compounds.", action: "Open Scenes", actionHref: "/scenes" },
  "/organizer/scenes": { eyebrow: "Host · Scenes", title: "Build belonging beyond one event.", description: "Connect recurring Moments, people, and places into a Scene that compounds.", action: "Open Scenes", actionHref: "/scenes" },
  "/organizer/analytics": { eyebrow: "Host · Performance", title: "Read the movement, not just the totals.", description: "Understand conversion, proof, return behavior, and where momentum is forming.", action: "Detailed analytics", actionHref: "/dashboard/analytics" },
  "/organizer/settings": { eyebrow: "Host · Workspace", title: "Shape how your operation appears.", description: "Manage organizer identity, team access, notifications, payouts, and account controls.", action: "Account settings", actionHref: "/dashboard/settings" },
};

const proofSteps = [
  { label: "Moment", copy: "Choose the room you are operating.", icon: CalendarDays },
  { label: "PromoCard", copy: "The guest presents their live pass.", icon: CreditCard },
  { label: "Arrival", copy: "Scan or verify the person at the door.", icon: QrCode },
  { label: "Proof", copy: "The accepted record becomes auditable.", icon: ShieldCheck },
];

export default function OrganizerWorkspace() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const momentFeed = useCanonicalMomentFeed();
  const activeView = viewMeta[pathname] || viewMeta["/organizer/events"];
  const isDoorView = pathname === "/organizer/check-ins";
  const ownedMoments = (momentFeed.data?.moments || []).filter((moment) =>
    Boolean(user?.id) && (moment.host_id === user?.id || moment.organizer_id === user?.id),
  );
  const activeMoments = ownedMoments.filter((moment) => moment.lifecycle !== "recently_ended");
  const recordedParticipants = ownedMoments.reduce((total, moment) => total + Number(moment.participant_count || 0), 0);
  const qualityIssues = ownedMoments.reduce((total, moment) => total + (moment.data_quality_issues?.length || 0), 0);
  const operationalMetrics = [
    { label: "Live Moments", value: String(ownedMoments.filter((moment) => moment.lifecycle === "live").length), helper: "recorded live now", icon: Radio },
    { label: "Starting soon", value: String(ownedMoments.filter((moment) => moment.lifecycle === "starting_soon").length), helper: "recorded schedule", icon: CheckCircle2 },
    { label: "Participants", value: String(recordedParticipants), helper: "participation records · not attendance", icon: Users },
    { label: "Needs attention", value: String(qualityIssues), helper: "source-quality issues", icon: CircleAlert },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#080808] text-white">
      <SEO title={`${activeView.title} - Promorang`} description={activeView.description} />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,91,22,.22),transparent_32%),linear-gradient(120deg,#090909_0%,#0b0b0b_60%,#160c07_100%)]" />
        <div className="relative mx-auto grid max-w-[1240px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-end lg:py-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-500">{activeView.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[0.92] tracking-[-0.045em] sm:text-6xl">{activeView.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">{activeView.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={activeView.actionHref} className="inline-flex min-h-12 items-center gap-8 rounded-lg bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400">
                {activeView.action}<ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/happened" className="inline-flex min-h-12 items-center gap-8 rounded-lg border border-white/15 bg-black/25 px-5 text-sm font-black transition hover:bg-white/10">
                View recorded proof<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <Link to="/card" className="group rounded-2xl border border-[#d7ad55]/45 bg-[radial-gradient(circle_at_80%_10%,rgba(226,180,90,.22),transparent_30%),linear-gradient(135deg,#111,#090909_70%)] p-6 shadow-[0_24px_70px_rgba(0,0,0,.55)] transition hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full border border-orange-500/35 bg-black text-xl font-black text-orange-500">P</span><div><p className="text-[8px] font-black uppercase tracking-[.25em] text-[#d7ad55]">Promorang</p><p className="font-serif text-2xl font-bold">PromoCard</p></div></div>
              <span className="h-7 w-10 rounded-md bg-gradient-to-br from-[#ffe291] to-[#ad741e]" />
            </div>
            <p className="mt-10 text-[9px] font-black uppercase tracking-[.2em] text-white/55">The pass at the door</p>
            <p className="mt-2 font-serif text-3xl font-bold leading-none text-[#efc363]">Every arrival starts here.</p>
            <p className="mt-4 text-xs leading-5 text-white/45">Access, benefit, identity, and evidence of use remain separate records connected to the participant.</p>
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] space-y-10 px-5 py-10 sm:px-8">
        {isDoorView ? (
          <section aria-labelledby="door-loop-title">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div><p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-500">Canonical loop</p><h2 id="door-loop-title" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">One door. One proof chain.</h2></div>
              <p className="max-w-sm text-xs leading-5 text-white/40">RSVP, arrival, verification, and retained proof remain distinct states.</p>
            </div>
            <div className="mt-5 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[.025] sm:grid-cols-2 lg:grid-cols-4">
              {proofSteps.map((step, index) => <div key={step.label} className="border-b border-white/10 p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"><div className="flex items-center justify-between"><step.icon className="h-5 w-5 text-orange-500" /><span className="text-[10px] font-black text-white/25">0{index + 1}</span></div><p className="mt-6 font-bold">{step.label}</p><p className="mt-2 text-xs leading-5 text-white/40">{step.copy}</p></div>)}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="signals-title">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-500">Recorded operating signals</p>
          <h2 id="signals-title" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">What needs attention.</h2>
          {momentFeed.isError ? <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Moment state is unavailable right now. No fallback activity is being substituted.</p> : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {operationalMetrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="flex items-center justify-between"><p className="text-[9px] font-black uppercase tracking-[.18em] text-white/40">{metric.label}</p><metric.icon className="h-4 w-4 text-orange-500" /></div><p className="mt-7 text-4xl font-black">{momentFeed.isLoading ? "—" : metric.value}</p><p className="mt-1 text-xs text-white/35">{metric.helper}</p></div>)}
          </div>
        </section>

        <section aria-labelledby="moments-title">
          <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-500">Moment inventory</p><h2 id="moments-title" className="mt-2 font-serif text-4xl font-bold tracking-[-.04em]">Choose the room.</h2></div><Link to="/create/moment" className="hidden text-sm font-bold text-orange-400 sm:inline-flex">Create Moment <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
          <div className="mt-5">
            {momentFeed.isLoading ? <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[.025]" /> : momentFeed.isError ? <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6 text-sm text-white/45">We could not load your recorded Moments.</div> : activeMoments.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {activeMoments.slice(0, 6).map((moment) => <Link key={moment.id} to={`/moments/${moment.slug || moment.id}`} className="group grid min-h-48 overflow-hidden rounded-2xl border border-white/10 bg-white/[.025] sm:grid-cols-[180px_1fr]">{moment.image_url ? <img src={moment.image_url} alt="" className="h-48 w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90 sm:h-full" /> : <div className="grid h-48 place-items-center bg-white/[.035] sm:h-full"><CalendarDays className="h-8 w-8 text-white/18" /></div>}<div className="flex flex-col justify-end p-5"><p className={`text-[9px] font-black uppercase tracking-[.18em] ${moment.lifecycle === "live" ? "text-emerald-300" : "text-orange-300"}`}>{momentLifecycleLabel(moment.lifecycle)}</p><h3 className="mt-2 font-serif text-2xl font-bold leading-tight">{moment.title}</h3><p className="mt-3 text-xs text-white/40">{new Date(moment.starts_at).toLocaleString("en-JM", { timeZone: "America/Jamaica", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}{moment.venue_name || moment.location ? ` · ${moment.venue_name || moment.location}` : ""}</p><span className="mt-5 inline-flex items-center text-xs font-black text-orange-400">Open Moment <ArrowRight className="ml-2 h-4 w-4" /></span></div></Link>)}
              </div>
            ) : <div className="rounded-2xl border border-white/10 bg-white/[.025] p-8"><p className="font-serif text-2xl font-bold">No active Moments recorded for this workspace.</p><p className="mt-2 max-w-xl text-sm leading-6 text-white/40">Production absence is preserved. Create a Moment when there is something real to operate.</p><Link to="/create/moment" className="mt-5 inline-flex min-h-11 items-center text-sm font-black text-orange-400">Create Moment <ArrowRight className="ml-2 h-4 w-4" /></Link></div>}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[.025] p-6 sm:grid-cols-3 sm:p-8">
          <div><BarChart3 className="h-5 w-5 text-orange-500" /><p className="mt-4 font-bold">Performance follows proof</p><p className="mt-2 text-xs leading-5 text-white/40">Reports describe recorded participation rather than decorative engagement totals.</p></div>
          <div><Ticket className="h-5 w-5 text-orange-500" /><p className="mt-4 font-bold">Entry stays distinct</p><p className="mt-2 text-xs leading-5 text-white/40">RSVP or a pass may establish intent or access; neither silently becomes attendance.</p></div>
          <div><ShieldCheck className="h-5 w-5 text-orange-500" /><p className="mt-4 font-bold">Exceptions remain visible</p><p className="mt-2 text-xs leading-5 text-white/40">Manual decisions belong in an auditable queue instead of disappearing into a dashboard total.</p></div>
        </section>
      </div>
    </main>
  );
}
