import { Link, useParams } from "react-router-dom";
import { ArrowRight, Play, ShieldCheck, Sparkles, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureCreators, cultureEvents } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";

const ALLOW_DEMO_PROFILE = import.meta.env.DEV || import.meta.env.MODE === "test";

export default function CreatorDetail() {
  const { handle } = useParams();

  if (!ALLOW_DEMO_PROFILE) {
    return (
      <main className="min-h-screen bg-black px-6 py-28 text-white">
        <SEO
          title="Creator profile | Promorang"
          description="Creator profiles will show verified creator identity, work, attribution, and opportunities when live profile data is available."
        />
        <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" /> No verified profile loaded
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            This creator profile is not available as a verified production record.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            PROMORANG will not substitute a sample creator, follower count, check-in history, booking address, or commission offer when the requested creator does not have a real profile source behind this route.
          </p>
          {handle && <p className="mt-3 text-xs text-white/35">Requested handle: @{handle}</p>}

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["Identity", "Creator identity should come from a real account/profile record."],
              ["Work", "Published releases and deliverables should come from actual creator activity."],
              ["Proof", "Attributed actions and earnings should appear only when recorded by PROMORANG."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="mt-3 text-sm font-black">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-white/50">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/content-drops" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground">
              Find live creator opportunities <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/discover" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-5 text-sm font-black text-white">
              Discover live activity
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const creator = cultureCreators.find((item) => item.handle === handle) || cultureCreators[0];

  return (
    <main className="min-h-screen bg-black pb-20 pt-24 text-white">
      <SEO title={`${creator.name} — Sample creator profile`} description={creator.bio} />
      <section className="container px-6">
        <SampleContentNotice noun="creator profile, metrics, activity, and opportunities" />

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
          <div className="relative h-64 overflow-hidden bg-black">
            <img src={creator.image} alt="" className="h-full w-full object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <ContentProvenanceBadge />
              <h1 className="mt-3 text-4xl font-black">{creator.name}</h1>
              <p className="mt-1 text-sm text-white/55">@{creator.handle} · sample only</p>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_300px] lg:p-7">
            <div>
              <p className="max-w-2xl text-sm leading-7 text-white/60">{creator.bio}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Sample audience", creator.followers],
                  ["Sample events", creator.events],
                  ["Sample check-ins", creator.checkIns],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="mt-3 text-xl font-black">{value}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{label}</p>
                  </div>
                ))}
              </div>

              <h2 className="mt-8 text-xl font-black">Sample upcoming activity</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {cultureEvents.slice(0, 2).map((event) => (
                  <article key={event.slug} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <img src={event.image} alt="" className="h-36 w-full object-cover" />
                    <div className="p-4">
                      <Play className="h-4 w-4 text-primary" />
                      <p className="mt-2 font-black">{event.shortTitle}</p>
                      <p className="mt-1 text-xs text-white/40">Development fixture — not a live opportunity.</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Demo behavior only</p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Follow, messaging, commission, booking, earnings, and PromoShare actions are intentionally disabled on this sample profile. Production creator actions require a real creator identity and real offer terms.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
