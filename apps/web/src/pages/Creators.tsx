import { Link } from "react-router-dom";
import { ArrowRight, Camera, Music2, Radio, Search, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { CreatorCard, MobileBottomNav } from "@/components/culture/CultureCards";
import { cultureCreators } from "@/data/culture-demo";
import { SampleContentNotice } from "@/components/content/ContentProvenance";

export default function Creators() {
  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title="Promorang Creators - Follow The Culture Makers"
        description="Discover creators, DJs, hosts, photographers, promoters, and ambassadors moving culture through Promorang."
      />
      <section className="relative min-h-[560px] overflow-hidden border-b border-white/10 pt-24">
        <img src={cultureCreators[0].image} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />
        <div className="container relative flex min-h-[464px] items-end px-6 pb-12">
          <div className="grid w-full gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Follow the signal</p>
              <h1 className="mt-4 max-w-5xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.07em] md:text-8xl">Meet the people<br /><span className="text-primary">moving culture.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">Discover creators through what they make happen: content, rooms, scenes, appearances, proof, and the people who move with them.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/55 p-4 backdrop-blur-xl">
              <Link to="/search" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white/50"><Search className="h-4 w-4 text-primary" />Search creators and talent</Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {["DJs", "Hosts", "Visual", "Promoters", "Nearby"].map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-6 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Sample creators</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">People worth following.</h2>
          </div>
          <Link to="/discover/content" className="hidden items-center gap-2 text-sm font-bold text-white/55 hover:text-primary sm:inline-flex">
            Discover content
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <SampleContentNotice noun="creator profiles and activity" className="mb-6" />
        <div className="grid gap-5 md:grid-cols-2">
          {cultureCreators.map((creator) => (
            <CreatorCard key={creator.handle} creator={creator} />
          ))}
        </div>
      </section>

      <section className="container px-6 py-8">
        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5 md:grid-cols-4">
          {[
            { icon: Music2, title: "Perform", text: "Appearances, lineups, and bookings." },
            { icon: Camera, title: "Publish", text: "Content drops that move people." },
            { icon: Radio, title: "Promote", text: "Promoshare, referrals, and campaigns." },
            { icon: Users, title: "Build", text: "Communities that remember who showed up." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <item.icon className="mb-4 h-6 w-6 text-primary" />
              <h3 className="font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
