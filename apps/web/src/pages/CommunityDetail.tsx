import { Link, useParams } from "react-router-dom";
import { ArrowRight, Award, CalendarDays, CheckCircle2, Gem, MessageCircle, Share2, Star, Trophy, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { ExperienceCard, MobileBottomNav } from "@/components/culture/CultureCards";
import { cultureScenes, cultureEvents } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";

export default function CommunityDetail() {
  const { slug } = useParams();
  const scene = cultureScenes.find((item) => item.slug === slug) || cultureScenes[0];
  const proofRail = [
    { label: "Show up", body: "Join Moments and be part of what the Scene is building.", icon: CalendarDays },
    { label: "Prove it", body: "Check in, post, refer, or submit proof when the Moment asks for it.", icon: CheckCircle2 },
    { label: "Rise", body: "Build status, eligibility, Vault memories, rewards, and future access.", icon: Trophy },
  ];

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={`${scene.title} - Promorang Scene`}
        description={scene.description}
      />

      <section className="relative overflow-hidden border-b border-white/10 pt-24">
        <img src={scene.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.76)_52%,rgba(0,0,0,0.44)_100%)]" />
        <div className="container relative z-10 grid gap-8 px-6 pb-10 pt-12 md:grid-cols-[180px_1fr_320px] md:items-center">
          <div className="h-40 w-40 overflow-hidden rounded-3xl border border-white/20 bg-black/50 p-3">
            <img src={scene.logoImage} alt="" className="h-full w-full rounded-2xl object-cover" />
          </div>
          <div>
            <ContentProvenanceBadge />
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] md:text-7xl">{scene.title}</h1>
            <p className="mt-3 max-w-xl text-lg leading-8 text-white/78">{scene.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {scene.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Status layer</p>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {scene.tagline} The deeper you move inside this Scene, the more proof, memories, eligibility, and status can follow you across Promorang.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/auth" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-black text-white">
                Join scene
              </Link>
              <button type="button" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-black text-white">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Proof", "+6"],
                ["Vault", "live"],
                ["Rewards", "open"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-center">
                  <p className="text-sm font-black text-white">{value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 bg-black/70">
          <div className="container flex gap-6 overflow-x-auto px-6 scrollbar-none">
            {[
              ["Home", Users],
              ["Moments", CalendarDays],
              ["Feed", MessageCircle],
              ["Members", Users],
              ["Sponsors", Star],
            ].map(([label, Icon], index) => (
              <button key={label as string} className={`inline-flex min-w-fit items-center gap-2 border-b-2 px-2 py-4 text-sm font-bold ${index === 0 ? "border-primary text-primary" : "border-transparent text-white/60"}`}>
                <Icon className="h-4 w-4" />
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="container px-6 pt-6">
        <SampleContentNotice noun="scene profile and activity" />
      </div>

      <section className="container grid gap-8 px-6 py-10 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-10 grid gap-3 md:grid-cols-3">
            {proofRail.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <item.icon className="h-5 w-5 text-primary" />
                <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-primary">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">Upcoming moments</h2>
            <Link to="/discover/moments" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cultureEvents.slice(0, 4).map((event) => (
              <ExperienceCard key={event.slug} event={event} compact />
            ))}
          </div>

          <div className="mt-10">
            <h2 className="mb-5 text-2xl font-black uppercase tracking-[-0.03em]">Scene proof feed</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {["Last night was legendary! Big up everyone who showed up.", "The energy is unmatched when hip hop unites us."].map((post, index) => (
                <article key={post} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-center gap-3">
                    <img src={index === 0 ? scene.logoImage : cultureEvents[2].image} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="font-bold">{index === 0 ? "joyrideja" : "selectajerome"}</p>
                      <p className="text-xs text-white/45">{index === 0 ? "2h ago" : "1d ago"}</p>
                    </div>
                  </div>
                  <img src={index === 0 ? cultureEvents[0].image : cultureEvents[3].image} alt="" className="mt-4 h-52 w-full rounded-xl object-cover" />
                  <p className="mt-4 text-sm leading-6 text-white/72">{post}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">proof-ready</span>
                    <span className="rounded-full bg-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Vault memory</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Scene stats</p>
            {[
              ["Members", scene.members],
              ["Moments hosted", scene.momentsHosted],
              ["Check-ins", scene.checkIns],
              ["Rating", scene.rating],
            ].map(([label, value]) => (
              <div key={label} className="mt-4">
                <p className="text-2xl font-black">{value}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Unlock path</p>
            <p className="mt-3 text-sm leading-6 text-white/65">
              PromoShare, Pieces, rewards, and Vault stay contextual here: activated through posts, Moments, referrals, and verified Scene movement.
            </p>
            <div className="mt-4 space-y-2">
              {[
                ["Attend", Award],
                ["Prove", CheckCircle2],
                ["Earn", Gem],
              ].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-sm font-bold">{label as string}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <MobileBottomNav />
    </main>
  );
}
