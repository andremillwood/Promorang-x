import { ArrowRight, Compass, MapPin, Radio, ShieldCheck, Sparkles, Users } from "lucide-react";
import heroMoments from "@/assets/hero-moments.jpg";
import jazzNight from "@/assets/moments/jazz-night.jpg";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import streetArt from "@/assets/moments/street-art.jpg";
import openMic from "@/assets/moments/open-mic.jpg";

const vibes = [
  { label: "Music", image: jazzNight },
  { label: "Food", image: cookingClass },
  { label: "Creative", image: streetArt },
  { label: "Social", image: heroMoments },
];

const truthSteps = [
  ["01", "Discovery", "Approved knowledge", "Proposal ≠ approval"],
  ["02", "Demand", "Recorded signal", "Vote ≠ attendance"],
  ["03", "Scene", "Persistent context", "Scene ≠ Moment"],
  ["04", "Moment", "Concrete action", "RSVP ≠ attendance"],
  ["05", "History", "Verified consequence", "Observed ≠ verified"],
] as const;

export function DiscoverySceneMarketWorldStudy() {
  return (
    <section className="mt-20 border-y border-white/10 py-16" aria-labelledby="market-world-study">
      <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_.6fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">08 · Discovery + Scene market world</p>
          <h2 id="market-world-study" className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">
            Borrow the energy. Keep the truth.
          </h2>
        </div>
        <div className="border-l border-[#f6d48a]/35 pl-5">
          <p className="font-serif text-2xl font-bold text-[#f6d48a]">Reference grammar, not reference data.</p>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Use the visual confidence of an editorial culture homepage—strong imagery, rails, identity cues and world density—without flattening Discovery, demand, Scene, Moment and retained history into one content feed.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black">
        <div className="relative min-h-[560px] overflow-hidden border-b border-white/10">
          <img src={heroMoments} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.82)_43%,rgba(0,0,0,.2)_80%),linear-gradient(0deg,rgba(0,0,0,.88)_0%,transparent_60%)]" />
          <div className="relative z-10 flex min-h-[560px] max-w-4xl flex-col justify-between p-6 sm:p-10 lg:p-14">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6500] shadow-[0_0_14px_rgba(255,101,0,.9)]" />
              Design Lab · illustrative only
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-white/60">Find → signal → enter context → act → keep</p>
              <h3 className="mt-4 max-w-3xl font-['Anton'] text-[3.6rem] font-normal uppercase leading-[.86] tracking-[-.035em] text-white sm:text-[5rem] lg:text-[6rem]">
                Find what moves people. <span className="text-[#ff6500]">Then enter the world around it.</span>
              </h3>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                The homepage can feel culturally dense and immediate while the product still preserves every state boundary underneath it.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" className="inline-flex min-h-12 items-center gap-8 rounded-md bg-[#ff6500] px-5 text-sm font-black text-black">
                  Explore the market <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" className="inline-flex min-h-12 items-center gap-8 rounded-md border border-white/20 bg-black/35 px-5 text-sm font-black text-white/80 backdrop-blur">
                  Enter a Scene <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.22em] text-white/35">Identity lens</p>
              <h3 className="mt-2 text-3xl font-black tracking-[-.04em]">What kind of person are you?</h3>
            </div>
            <p className="hidden max-w-xs text-xs leading-5 text-white/40 sm:block">A taxonomy can personalize discovery without pretending it is live market activity.</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {vibes.map((vibe) => (
              <article key={vibe.label} className="group relative min-h-[170px] overflow-hidden rounded-xl border border-white/10 bg-white/[.03]">
                <img src={vibe.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <Compass className="h-5 w-5 text-white" />
                  <p className="mt-2 text-sm font-black text-white">{vibe.label}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/40">Filter, not evidence</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid border-b border-white/10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-[9px] font-black uppercase tracking-[.22em] text-[#ff8a45]">Signal · what is worth noticing</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="min-h-[220px] rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <Sparkles className="h-5 w-5 text-[#ff8a45]" />
                <p className="mt-12 text-[9px] font-black uppercase tracking-[.18em] text-white/35">Approved Discovery</p>
                <h4 className="mt-2 font-serif text-3xl font-bold leading-none">A piece of local knowledge enters the graph.</h4>
                <p className="mt-4 text-sm leading-6 text-white/45">Editorial weight, source/provenance visible, no implied offer or conversion.</p>
              </article>
              <article className="min-h-[220px] rounded-2xl border border-[#f6d48a]/20 bg-[#f6d48a]/[.035] p-5">
                <Radio className="h-5 w-5 text-[#f6d48a]" />
                <p className="mt-12 text-[9px] font-black uppercase tracking-[.18em] text-white/35">Demand question</p>
                <h4 className="mt-2 font-serif text-3xl font-bold leading-none">What do people actually want?</h4>
                <p className="mt-4 text-sm leading-6 text-white/45">Votes accumulate as signal. Thresholds do not manufacture supply.</p>
              </article>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[9px] font-black uppercase tracking-[.22em] text-emerald-300">Scene · persistent context</p>
            <div className="relative mt-5 min-h-[460px] overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
              <img src={streetArt} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
              <div className="relative z-10 flex min-h-[460px] flex-col justify-between p-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-white/70 backdrop-blur">
                  <Users className="h-3.5 w-3.5" /> Persistent world
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-white/35">Scene specimen</p>
                  <h4 className="mt-2 font-serif text-4xl font-bold leading-[.92]">Context survives when tonight is empty.</h4>
                  <p className="mt-4 text-sm leading-6 text-white/50">People, places, Discoveries, rituals and linked Moments can accumulate here without Scene becoming any one of them.</p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-200"><MapPin className="h-4 w-4" /> Enter context →</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-white/10 sm:grid-cols-5">
          {truthSteps.map(([index, object, meaning, truth]) => (
            <article key={object} className="bg-[#0a0a0b] p-5 sm:min-h-[170px]">
              <p className="font-mono text-[10px] text-white/25">{index}</p>
              <p className="mt-5 font-serif text-xl font-bold text-white">{object}</p>
              <p className="mt-2 text-xs text-white/45">{meaning}</p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.12em] text-[#f6d48a]/70"><ShieldCheck className="h-3.5 w-3.5" />{truth}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_.8fr] lg:p-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.22em] text-primary">Action · a separate canonical object</p>
            <div className="relative mt-4 min-h-[330px] overflow-hidden rounded-2xl border border-white/10">
              <img src={openMic} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[9px] font-black uppercase tracking-[.18em] text-emerald-300">Moment</p>
                <h4 className="mt-2 font-serif text-4xl font-bold leading-[.92]">A concrete thing someone can actually do.</h4>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">It can be visually adjacent to a Scene without being the Scene itself.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[.025] p-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.22em] text-purple-300">Keep · retained history</p>
              <h4 className="mt-4 font-serif text-4xl font-bold leading-[.92]">What happened becomes part of what comes next.</h4>
              <p className="mt-4 text-sm leading-7 text-white/45">Proof, Pieces, entitlements, entries and memory remain separate retained objects. The reference image’s dense world can therefore gain continuity without inventing synthetic activity.</p>
            </div>
            <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-6 text-white/35">
              Production rule: empty remains empty. No fake attendees, no fallback Moments, no seeded votes, no invented rewards.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
