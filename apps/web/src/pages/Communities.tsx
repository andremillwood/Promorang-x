import { Link } from "react-router-dom";
import { ArrowRight, Heart, MapPin, Search, Users } from "lucide-react";
import { sceneLocation } from "@promorang/shared";
import SEO from "@/components/SEO";
import { MobileBottomNav } from "@/components/culture/CultureCards";
import { useScenes } from "@/hooks/useScenes";
import { getSiteUrl } from "@/lib/discovery";
import { generateLocationCollectionSchema } from "@/lib/seo-schemas";

export default function Communities() {
  const scenes = useScenes();
  const featured = scenes.data?.[0];
  return (
    <main className="min-h-full flex-1 bg-black pb-24 text-white">
      <SEO title="Promorang Scenes — Find Your People" description="Find the people, places, rituals and Moments that feel like your world." url={getSiteUrl("/scenes")} schema={generateLocationCollectionSchema("Promorang Scenes", getSiteUrl("/scenes"), (scenes.data || []).map((scene) => ({ title: scene.title, url: getSiteUrl(`/scenes/${scene.slug}`) })))} />
      <section className="relative min-h-[620px] overflow-hidden border-b border-white/10 pt-24">
        {featured?.image_url ? <img src={featured.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" /> : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_22%,rgba(249,115,22,.24),transparent_30%),linear-gradient(100deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.76)_52%,rgba(0,0,0,.26)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1600px] items-end px-6 pb-14 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Scenes on Promorang</p>
              <h1 className="mt-5 max-w-6xl font-serif text-6xl font-bold leading-[.84] tracking-[-.06em] sm:text-8xl lg:text-[7.5rem] xl:text-[9rem]">Find the world<br /><em className="font-normal text-primary">that feels like yours.</em></h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">A Scene is the people, places and rituals you want to return to—not another category to follow.</p>
            </div>
            <div className="border-y border-white/15 py-5">
              <Link to="/search" className="flex min-h-12 items-center gap-3 text-sm text-white/55 transition hover:text-white"><Search className="h-4 w-4 text-primary" />Search people, places and Scenes</Link>
              <p className="border-t border-white/10 pt-4 text-xs leading-5 text-white/38">Look for the welcome, the feeling, familiar faces and the next gathering—not the biggest number.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-14 sm:py-20 lg:px-8 xl:px-12 2xl:px-16">
        <div className="mb-9 flex items-end justify-between gap-5 border-b border-white/10 pb-7">
          <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-primary">Living Scenes</p><h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Where people keep coming back.</h2></div>
          <Link to="/discover" className="hidden items-center gap-2 text-sm font-bold text-white/50 hover:text-primary sm:flex">Discover more <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {scenes.isLoading ? <div className="grid gap-4 md:grid-cols-2"><div className="h-[440px] animate-pulse rounded-[2rem] bg-white/[.05]" /><div className="h-[440px] animate-pulse rounded-[2rem] bg-white/[.05]" /></div> : scenes.data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12">
            {scenes.data.map((scene, index) => (
              <Link key={scene.id} to={`/scenes/${scene.slug}`} className={`group relative isolate min-h-[440px] overflow-hidden rounded-[2rem] border border-white/10 ${index % 3 === 0 ? "xl:col-span-7" : "xl:col-span-5"}`}>
                {scene.image_url ? <img src={scene.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,.32),transparent_34%),#15110e]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9"><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-primary"><MapPin className="h-3.5 w-3.5" />{sceneLocation(scene)}</p><h3 className="mt-4 font-serif text-4xl font-bold leading-none sm:text-5xl">{scene.title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-white/58">{scene.metadata.tagline || scene.description}</p></div>
                <span className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur transition group-hover:bg-primary group-hover:text-black"><ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 border-y border-white/10 py-14 md:grid-cols-[1fr_1.2fr] md:items-center"><div><Heart className="h-8 w-8 text-primary" /><h3 className="mt-5 font-serif text-4xl font-bold">The first public Scene is still taking shape.</h3></div><div><p className="max-w-xl text-sm leading-7 text-white/50">A Scene appears when real Moments, people and places begin forming a recognizable reason to return. Until then, discover the gatherings already happening.</p><Link to="/discover" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Find a Moment worth joining <ArrowRight className="h-4 w-4" /></Link></div></div>
        )}
      </section>
      <section className="mx-auto max-w-[1600px] px-6 pb-12 lg:px-8 xl:px-12 2xl:px-16"><div className="grid gap-6 border-t border-white/10 py-10 sm:grid-cols-3">{[[Users,"People","Who welcomes newcomers and keeps showing up."],[MapPin,"Places","The rooms and corners where the Scene feels most itself."],[Heart,"Rituals","The reasons people know when and why to return."]].map(([Icon,title,body]) => { const C=Icon as typeof Users; return <div key={title as string} className="border-l border-white/10 pl-5"><C className="h-4 w-4 text-primary"/><h3 className="mt-5 font-serif text-xl font-bold">{title as string}</h3><p className="mt-2 text-xs leading-5 text-white/42">{body as string}</p></div>; })}</div></section>
      <MobileBottomNav />
    </main>
  );
}
