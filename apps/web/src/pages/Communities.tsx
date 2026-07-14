import { Link } from "react-router-dom";
import { ArrowRight, Flame, Search, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { SceneCard, MobileBottomNav } from "@/components/culture/CultureCards";
import { cultureScenes, cultureEvents } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";

export default function Communities() {
  return (
    <main className="min-h-full flex-1 bg-black pb-24 text-white">
      <SEO
        title="Promorang Scenes - Join The Culture"
        description="Find scenes built around moments, creators, places, proof, and rewards."
      />
      <section className="relative min-h-[560px] overflow-hidden border-b border-white/10 pt-24">
        <img src={cultureScenes[0].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
        <div className="container relative flex min-h-[464px] items-end px-6 pb-12">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Find your people</p>
              <h1 className="mt-4 max-w-5xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] md:text-8xl">Culture lives<br /><span className="text-primary">in scenes.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">Follow the rooms, rituals, creators, and places that keep pulling people back. Join through a moment, prove your presence, and become part of the story.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-xl">
              <Link to="/search" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/50"><Search className="h-4 w-4 text-primary" />Search scenes, people, places</Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Music", "Food", "Wellness", "Drops", "Nearby"].map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-6 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Sample scenes</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Find your scene.</h2>
          </div>
          <Link to="/discover" className="hidden items-center gap-2 text-sm font-bold text-white/55 hover:text-primary sm:inline-flex">
            Discover all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <SampleContentNotice noun="scenes and activity" className="mb-6" />
        <div className="grid gap-5 md:grid-cols-2">
          {cultureScenes.map((scene) => (
            <SceneCard key={scene.slug} scene={scene} />
          ))}
        </div>
      </section>

      <section className="container px-6 py-8">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Scene signal</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Presence makes belonging visible.</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              People do more than follow a Scene. They check in, share, attend, refer, unlock, and help show what is actually moving.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Users, value: "6.3K", label: "people represented" },
              { icon: Flame, value: "137", label: "moments mapped" },
              { icon: ArrowRight, value: "147K", label: "participation signals" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <stat.icon className="mb-4 h-5 w-5 text-primary" />
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="mt-1 text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-[-0.04em]">Moments moving through scenes</h2>
          <Link to="/discover" className="text-sm font-bold text-primary">View moments</Link>
        </div>
        <div className="grid grid-flow-col auto-cols-[72%] gap-4 overflow-x-auto pb-3 scrollbar-none md:auto-cols-[32%] lg:auto-cols-[24%]">
          {cultureEvents.map((event) => (
            <Link key={event.slug} to={`/events/${event.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
              <div className="relative">
                <img src={event.image} alt="" className="h-32 w-full rounded-xl object-cover" />
                <ContentProvenanceBadge className="absolute left-2 top-2" compact />
              </div>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-primary">{event.date}</p>
              <h3 className="mt-1 text-lg font-black">{event.shortTitle}</h3>
              <p className="text-sm text-white/55">{event.place}</p>
            </Link>
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
