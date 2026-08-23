import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown, ArrowRight, Building2, CalendarCheck2, CheckCircle2, Clock3,
  MapPin, PlayCircle, ShieldCheck, Sparkles, Users, UserRoundPlus,
} from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { cultureCreators, cultureEvents } from "@/data/culture-demo";
import { API_BASE_URL } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

const paths = [
  { icon: Users, role: "Active members", action: "Show up with intent", detail: "Meaningful activity, participation, and qualified engagement build your record.", points: "Up to 30 contribution weight / day", href: "/discover" },
  { icon: PlayCircle, role: "Creators", action: "Make attention move", detail: "Publish original work that brings people into Moments, places, and missions.", points: "25+ / reviewed work", href: "/for-creators" },
  { icon: CalendarCheck2, role: "Moment hosts", action: "Create rooms worth returning to", detail: "Completed Moments, turnout, retention, and participant quality become contribution signal.", points: "100+ / Moment", href: "/for-communities" },
  { icon: Building2, role: "Venues", action: "Give culture somewhere to happen", detail: "Onboard your place, facilitate Moments, or host experiences yourself.", points: "500 contribution weight", href: "/for-merchants" },
  { icon: UserRoundPlus, role: "Connectors", action: "Bring the right people", detail: "Invite friends who become meaningfully active and strengthen the network.", points: "50 / qualified person", href: "/auth?mode=signup" },
];

const trail = [
  { time: "Tonight", person: "Maya hosted", object: "Open Mic at Harbour House", proof: "47 counted arrivals", points: "+100 contribution pending", image: cultureEvents[3].image },
  { time: "Yesterday", person: "Nia created", object: "Kingston After Dark route", proof: "18 people moved", points: "+25 contribution verified", image: cultureCreators[0].avatar },
  { time: "This week", person: "The Courtyard facilitated", object: "3 community Moments", proof: "126 total check-ins", points: "+375 contribution verified", image: cultureEvents[1].image },
];

export default function Pioneers() {
  const { t, formatNumber } = useI18n();
  const { user } = useAuth();
  const [leaderType, setLeaderType] = useState("host");
  const primaryHref = user ? "/growth/pioneer" : "/auth?mode=signup&next=/growth/pioneer";
  const leaderboard = useQuery({
    queryKey: ["pioneer-public-leaderboard", leaderType],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/pioneer-points/public/leaderboard?type=${leaderType}&limit=10`);
      if (!response.ok) throw new Error("Leaderboard unavailable");
      return response.json() as Promise<{ season: { ends_at: string } | null; entries: Array<{ beneficiary_id: string; rank: number; verified_points: number; identity: { name: string; avatar_url?: string; location?: string } }> }>;
    },
  });

  useEffect(() => {
    const key = "promorang_pioneer_anon";
    const anonymousId = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, anonymousId);
    fetch(`${API_BASE_URL}/pioneer-points/public/analytics`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_name: "landing_view", anonymous_id: anonymousId, source: document.referrer || "direct" }),
    }).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <SEO
        title={t("pioneersPage.seoTitle")}
        description={t("pioneersPage.seoDesc")}
      />

      <section className="relative min-h-[760px] overflow-hidden border-b border-white/10 pt-20">
        <img src={cultureEvents[0].image} alt="People gathering at a live cultural Moment" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_5%,rgba(5,5,5,.88)_48%,rgba(5,5,5,.25))]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/25" />
        <div className="container relative grid min-h-[680px] gap-12 px-6 py-16 lg:grid-cols-[1fr_390px] lg:items-end">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-black/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary backdrop-blur">
              <Sparkles className="h-4 w-4" />{t("pioneersPage.badge")}
            </div>
            <h1 className="mt-7 text-6xl font-black uppercase leading-[0.82] tracking-[-0.075em] sm:text-7xl md:text-8xl">
              {t("pioneersPage.heroTitlePart1")}<br />{t("pioneersPage.heroTitlePart2")}<br /><span className="text-primary">{t("pioneersPage.heroTitlePart3")}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
              {t("pioneersPage.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryHref} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-black text-primary-foreground">
                {user ? t("pioneersPage.ctaRecord") : t("pioneersPage.ctaJoin")}<ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/25 px-6 py-4 text-sm font-black backdrop-blur">
                {t("pioneersPage.ctaHow")}<ArrowDown className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-black/55 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{t("pioneersPage.trailTitle")}</p>
              <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{t("pioneersPage.recording")}</span>
            </div>
            <div className="mt-5 space-y-5">
              {trail.map((item, index) => (
                <div key={item.object} className="relative flex gap-3">
                  {index < trail.length - 1 && <span className="absolute left-5 top-10 h-12 w-px bg-white/10" />}
                  <img src={item.image} alt="" className="h-10 w-10 rounded-full border border-white/15 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-primary">{item.time}</p>
                    <p className="mt-1 text-sm"><strong>{item.person}</strong> <span className="text-white/48">{item.object}</span></p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px]"><span className="text-white/35">{item.proof}</span><span className="font-black text-primary">{item.points}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-white/10 pt-4 text-[10px] leading-5 text-white/35">{t("pioneersPage.trailDisclaimer")}</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pioneersPage.howEyebrow")}</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-6xl">{t("pioneersPage.howTitle")}</h2>
          <p className="mt-5 text-base leading-7 text-white/52">{t("pioneersPage.howSubtitle")}</p>
        </div>
        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {paths.map((path, index) => (
            <Link key={path.role} to={path.href} className="group grid gap-4 py-6 transition hover:bg-white/[0.025] md:grid-cols-[64px_1fr_1.25fr_180px_28px] md:items-center md:px-4">
              <span className="text-xs font-black text-white/20">0{index + 1}</span>
              <div><path.icon className="mb-2 h-5 w-5 text-primary" /><p className="font-black">{path.role}</p><p className="text-xs text-primary">{path.action}</p></div>
              <p className="text-sm leading-6 text-white/50">{path.detail}</p>
              <p className="text-xs font-black uppercase tracking-wider text-white/35">{path.points}</p>
              <ArrowRight className="h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0a0908]">
        <div className="container grid px-6 py-20 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-28">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pioneersPage.journeyEyebrow")}</p>
            <h2 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em]">{t("pioneersPage.journeyTitlePart1")}<br />{t("pioneersPage.journeyTitlePart2")}<br /><span className="text-primary">{t("pioneersPage.journeyTitlePart3")}</span></h2>
          </div>
          <div className="mt-12 space-y-10 lg:mt-0">
            {[
              ["01", "Find your next useful move", "Join a Moment, publish original work, host a room, activate a venue, or invite someone who will genuinely participate."],
              ["02", "Leave credible contribution", "Check-ins, completion, attribution, quality signals, and trust checks turn activity into a pending receipt."],
              ["03", "Watch the receipt verify", "Eligible work moves from pending to verified. Duplicate, manipulated, cancelled, or unverifiable activity does not count."],
              ["04", "Keep your season record", "At the season snapshot, your contribution record freezes for review. If a future pool is funded, its exact terms are announced separately."],
            ].map(([number, title, text]) => (
              <article key={number} className="grid grid-cols-[46px_1fr] gap-4 border-t border-white/10 pt-6">
                <span className="text-xs font-black text-primary">{number}</span>
                <div><h3 className="text-2xl font-black">{title}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-white/50">{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 py-20 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pioneersPage.leadersEyebrow")}</p><h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.05em] md:text-6xl">{t("pioneersPage.leadersTitle")}</h2><p className="mt-3 text-sm text-white/45">{t("pioneersPage.leadersSubtitle")}</p></div>
          <div className="flex flex-wrap gap-2">{["host","venue","creator","referrer","member"].map((type) => <button key={type} onClick={() => setLeaderType(type)} className={`rounded-full px-4 py-2 text-xs font-black capitalize ${leaderType===type?"bg-primary text-primary-foreground":"border border-white/15 text-white/55"}`}>{type}</button>)}</div>
        </div>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {leaderboard.isLoading && <div className="h-40 animate-pulse bg-white/[0.03]" />}
          {!leaderboard.isLoading && !leaderboard.data?.entries.length && <div className="py-12 text-center text-sm text-white/40">{t("pioneersPage.leadersEmpty", { type: leaderType })}</div>}
          {leaderboard.data?.entries.map((entry) => <div key={entry.beneficiary_id} className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 py-4">
            <span className="text-lg font-black text-white/25">{String(entry.rank).padStart(2,"0")}</span>
            {entry.identity.avatar_url?<img src={entry.identity.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />:<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></div>}
            <div><p className="font-black">{entry.identity.name}</p>{entry.identity.location&&<p className="text-xs text-white/35">{entry.identity.location}</p>}</div>
            <p className="font-black text-primary">{t("pioneersPage.contributionUnit", { count: formatNumber(entry.verified_points) })}</p>
          </div>)}
        </div>
      </section>

      <section className="container px-6 py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img src={cultureEvents[2].image} alt="A local venue hosting a community experience" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent" />
            <div className="absolute bottom-0 p-6"><div className="flex items-center gap-2 text-xs font-black text-primary"><MapPin className="h-4 w-4" />{t("pioneersPage.venueBadge")}</div><p className="mt-2 max-w-md text-2xl font-black">{t("pioneersPage.venueQuote")}</p></div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pioneersPage.principlesEyebrow")}</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em]">{t("pioneersPage.principlesTitle")}</h2>
            <div className="mt-7 space-y-5">
              {[
                ["Non-purchasable", "Nobody can buy their place in the Genesis record."],
                ["Non-transferable", "Your contribution stays attached to the person or venue that earned it."],
                ["Auditable", "Every unit begins with a source, status, time, and verification trail."],
                ["Separately funded", "No cash value or reward is represented until a real pool and its terms are formally announced."],
              ].map(([title, text]) => <div key={title} className="flex gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><p className="font-black">{title}</p><p className="mt-1 text-sm leading-6 text-white/45">{text}</p></div></div>)}
            </div>
            <Link to="/terms" className="mt-8 inline-flex items-center text-sm font-black text-primary">{t("pioneersPage.readTerms")}<ArrowRight className="ml-2 h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20 text-center md:py-28">
        <Clock3 className="mx-auto h-7 w-7 text-primary" />
        <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pioneersPage.endNotice")}</p>
        <h2 className="mx-auto mt-5 max-w-3xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] md:text-7xl">{t("pioneersPage.finalTitle")}</h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/50">{t("pioneersPage.finalSubtitle")}</p>
        <Link to={primaryHref} className="mt-8 inline-flex items-center rounded-full bg-primary px-7 py-4 text-sm font-black text-primary-foreground">
          {user ? t("pioneersPage.finalCtaUser") : t("pioneersPage.finalCtaGuest")}<ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
