import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  UserRoundPlus,
} from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { useI18n } from "@/i18n/I18nContext";

const paths = [
  {
    icon: Users,
    role: "Member",
    action: "Participate meaningfully",
    detail: "Join and complete useful actions. Only activity that can be credibly recorded should contribute to your record.",
    href: "/discover",
  },
  {
    icon: PlayCircle,
    role: "Creator",
    action: "Make attention move",
    detail: "Publish original work that can be connected to verified audience or customer action.",
    href: "/for-creators",
  },
  {
    icon: CalendarCheck2,
    role: "Host",
    action: "Create rooms worth showing up for",
    detail: "Run Moments, verify attendance, and build a record from people who actually participate.",
    href: "/for-communities",
  },
  {
    icon: Building2,
    role: "Place",
    action: "Give participation somewhere to happen",
    detail: "Make a real place available for Moments, claims, visits, or other verifiable actions.",
    href: "/for-merchants",
  },
  {
    icon: UserRoundPlus,
    role: "Connector",
    action: "Bring the right person",
    detail: "An introduction matters when the person goes on to do something useful—not merely because a link was sent.",
    href: "/auth?mode=signup",
  },
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
      return response.json() as Promise<{
        season: { ends_at: string } | null;
        entries: Array<{
          beneficiary_id: string;
          rank: number;
          verified_points: number;
          identity: { name: string; avatar_url?: string; location?: string };
        }>;
      }>;
    },
  });

  useEffect(() => {
    const key = "promorang_pioneer_anon";
    const anonymousId = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, anonymousId);
    fetch(`${API_BASE_URL}/pioneer-points/public/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "landing_view",
        anonymous_id: anonymousId,
        source: document.referrer || "direct",
      }),
    }).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <SEO title={t("pioneersPage.seoTitle")} description={t("pioneersPage.seoDesc")} />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,106,0,0.16),transparent_42%)] pt-24">
        <div className="container grid gap-8 px-6 pb-14 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-4 w-4" /> Verified contribution
            </div>
            <h1 className="mt-7 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-7xl">
              Build a record from <span className="text-primary">what actually happened.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">
              Pioneers is for contribution PROMORANG can credibly attribute or verify. There is no illustrative “live trail” on this page: public rankings come from the leaderboard service, and an empty season stays empty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={primaryHref} className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-black text-primary-foreground">
                {user ? "Open my contribution record" : "Join PROMORANG"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-4 text-sm font-black text-white">
                How contribution works
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Proof contract</p>
            <div className="mt-4 space-y-3">
              {[
                "Activity must be attributable to a real account or organization.",
                "Where proof is required, the proof must be accepted before stronger claims are made.",
                "Duplicate, cancelled, manipulated, or unverifiable activity should not count.",
                "Future funded pools must publish their own terms separately.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/60">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container px-6 py-16">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Choose the job</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">Different roles leave different proof.</h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {paths.map((path, index) => {
            const Icon = path.icon;
            return (
              <Link key={path.role} to={path.href} className="group grid gap-4 py-6 transition hover:bg-white/[0.02] md:grid-cols-[54px_1fr_1.5fr_28px] md:items-center md:px-4">
                <span className="text-xs font-black text-white/20">0{index + 1}</span>
                <div>
                  <Icon className="mb-2 h-5 w-5 text-primary" />
                  <p className="font-black">{path.role}</p>
                  <p className="text-xs text-primary">{path.action}</p>
                </div>
                <p className="text-sm leading-6 text-white/50">{path.detail}</p>
                <ArrowRight className="h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="container px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-4xl font-black tracking-[-0.04em]">Contribution becomes useful when it can survive review.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["1", "Do something useful", "Attend, host, create, refer, facilitate, or complete another recognized action."],
                ["2", "Leave evidence", "Check-in, attribution, accepted proof, fulfillment, or another appropriate record supports the action."],
                ["3", "Let it verify", "Eligible records can move into verified contribution; unsupported claims do not."],
                ["4", "Use the record", "Your verified history can support ranking, recognition, eligibility, or a future explicitly funded program."],
              ].map(([number, title, copy]) => (
                <article key={number} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="text-xs font-black text-primary">{number}</span>
                  <h3 className="mt-3 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container px-6 py-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Live leaderboard</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em]">Only records returned by the service.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">No sample people or fabricated check-in counts are inserted when the leaderboard is empty.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["host", "venue", "creator", "referrer", "member"].map((type) => (
              <button
                key={type}
                onClick={() => setLeaderType(type)}
                className={`rounded-full px-4 py-2 text-xs font-black capitalize ${leaderType === type ? "bg-primary text-primary-foreground" : "border border-white/15 text-white/55"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {leaderboard.isLoading && <div className="h-40 animate-pulse bg-white/[0.03]" />}
          {leaderboard.isError && (
            <div className="py-12 text-center text-sm text-red-300">The leaderboard could not be loaded. No fallback rankings are being shown.</div>
          )}
          {!leaderboard.isLoading && !leaderboard.isError && !leaderboard.data?.entries.length && (
            <div className="py-12 text-center text-sm text-white/40">No verified {leaderType} contribution is ranked for this season yet.</div>
          )}
          {leaderboard.data?.entries.map((entry) => (
            <div key={entry.beneficiary_id} className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 py-4">
              <span className="text-lg font-black text-white/25">{String(entry.rank).padStart(2, "0")}</span>
              {entry.identity.avatar_url ? (
                <img src={entry.identity.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Sparkles className="h-4 w-4 text-primary" /></div>
              )}
              <div>
                <p className="font-black">{entry.identity.name}</p>
                {entry.identity.location && <p className="text-xs text-white/35">{entry.identity.location}</p>}
              </div>
              <p className="font-black text-primary">{t("pioneersPage.contributionUnit", { count: formatNumber(entry.verified_points) })}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
