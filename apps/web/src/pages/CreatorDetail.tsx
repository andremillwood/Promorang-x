import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarDays, Compass, MapPin, Sparkles, UserRound } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { PublicContentCard, type PublicContentItem } from "@/components/content/PublicContentCard";

export default function CreatorDetail() {
  const { handle = "" } = useParams<{ handle: string }>();

  const profileQuery = useQuery({
    queryKey: ["public-creator", handle],
    enabled: Boolean(handle),
    queryFn: async () => {
      const { data: roles, error: roleError } = await supabase.from("user_roles").select("user_id").eq("role", "creator");
      if (roleError) throw roleError;
      const creatorIds = new Set((roles || []).map((row) => row.user_id));
      const { data, error } = await supabase.from("profiles").select("id,user_id,full_name,display_name,username,avatar_url,bio,location").or(`username.eq.${handle},user_id.eq.${handle},id.eq.${handle}`).limit(1).maybeSingle();
      if (error) throw error;
      if (!data || !creatorIds.has(data.user_id)) return null;
      return data as any;
    },
  });

  const creator = profileQuery.data;
  const contentQuery = useQuery({
    queryKey: ["public-creator-content", creator?.user_id],
    enabled: Boolean(creator?.user_id),
    queryFn: async () => {
      const { data, error } = await supabase.from("view_public_content_directory").select("*").eq("creator_id", creator.user_id).order("posted_at", { ascending: false, nullsFirst: false }).limit(12);
      if (error) throw error;
      return (data || []) as PublicContentItem[];
    },
  });

  const momentsQuery = useQuery({
    queryKey: ["public-creator-moments", creator?.user_id],
    enabled: Boolean(creator?.user_id),
    queryFn: async () => {
      const { data, error } = await supabase.from("view_public_moment_directory").select("*").eq("host_id", creator.user_id).eq("is_active", true).order("starts_at", { ascending: true, nullsFirst: false }).limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  const discoveriesQuery = useQuery({
    queryKey: ["public-creator-discoveries", creator?.user_id],
    enabled: Boolean(creator?.user_id),
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("discoveries").select("id,slug,title,cover_image,city,country,category").eq("creator_id", creator.user_id).eq("verification_status", "approved").order("updated_at", { ascending: false }).limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  if (profileQuery.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] text-white">Opening creator…</main>;
  if (profileQuery.isError || !creator) return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div className="max-w-xl"><UserRound className="mx-auto h-9 w-9 text-orange-400"/><h1 className="mt-5 text-4xl font-black">Creator unavailable.</h1><p className="mt-3 text-sm leading-6 text-white/48">PROMORANG does not have a verified creator-role profile behind this route. No sample creator, audience count, earnings or opportunity is being substituted.</p><Link to="/creators" className="mt-6 inline-flex items-center gap-2 font-black text-orange-300"><ArrowLeft className="h-4 w-4"/>Browse creators</Link></div></main>;

  const name=creator.display_name||creator.full_name||creator.username||"Creator";
  const content=contentQuery.data||[];
  const moments=momentsQuery.data||[];
  const discoveries=discoveriesQuery.data||[];

  return <main className="marketing-cinematic public-object-page min-h-screen bg-[#050505] pb-20 text-white">
    <SEO title={`${name} — PROMORANG Creator`} description={creator.bio || `Explore ${name} on PROMORANG.`} />
    <section className="public-object-hero relative border-b border-white/10 px-5 pb-10 pt-16 sm:px-6 md:pt-20">
      <CurrentArc variant="hero" className="marketing-hero-current"/>
      <div className="relative mx-auto max-w-[1180px]">
        <Link to="/creators" className="inline-flex items-center gap-2 text-xs font-bold text-white/48"><ArrowLeft className="h-4 w-4"/>Creators</Link>
        <div className="mt-6 grid border border-white/10 bg-[#090909] md:grid-cols-[340px_1fr]">
          <div className="aspect-square overflow-hidden bg-white/[.04]">{creator.avatar_url?<img src={creator.avatar_url} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center"><UserRound className="h-16 w-16 text-white/20"/></div>}</div>
          <div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Creator on PROMORANG</p><h1 className="mt-4 text-5xl font-black leading-[.9] tracking-[-.05em] sm:text-7xl">{name}</h1>{creator.username?<p className="mt-3 text-sm font-bold text-white/38">@{creator.username}</p>:null}{creator.bio?<p className="mt-5 max-w-2xl text-sm leading-7 text-white/58">{creator.bio}</p>:null}{creator.location?<p className="mt-5 flex items-center gap-2 text-xs text-white/45"><MapPin className="h-4 w-4 text-orange-400"/>{creator.location}</p>:null}</div>
        </div>
      </div>
    </section>
    <section className="px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-[1180px]"><div className="marketing-section-head"><div><p className="marketing-kicker">From this creator</p><h2 className="mt-3 text-4xl font-black">Work worth opening.</h2></div><span className="text-[10px] font-black uppercase tracking-[.14em] text-white/35">{content.length} public</span></div>{contentQuery.isLoading?<p className="text-sm text-white/45">Loading public work…</p>:content.length?<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{content.map((item)=><PublicContentCard key={item.id} item={item}/>)}</div>:<div className="border-y border-white/10 py-12"><Sparkles className="h-6 w-6 text-orange-400"/><h3 className="mt-4 text-2xl font-black">No public work connected yet.</h3><p className="mt-2 text-sm text-white/42">PROMORANG is not filling this profile with sample releases.</p></div>}</div></section>
    {moments.length?<section className="border-t border-white/10 px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-[1180px]"><div className="marketing-section-head"><div><p className="marketing-kicker">Moments</p><h2 className="mt-3 text-4xl font-black">More from this host.</h2></div></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{moments.map((moment:any)=><Link key={moment.id} to={`/moments/${moment.slug||moment.id}`} className="group border border-white/10 bg-white/[.025] p-5 transition hover:border-orange-400/35"><CalendarDays className="h-5 w-5 text-orange-300"/><h3 className="mt-5 text-xl font-black">{moment.title}</h3><p className="mt-2 text-xs text-white/42">{moment.venue_name||moment.location||"Place on Moment"}</p><div className="mt-5 flex justify-end"><ArrowRight className="h-4 w-4 text-white/30 transition group-hover:text-orange-300"/></div></Link>)}</div></div></section>:null}
    {discoveries.length?<section className="border-t border-white/10 px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-[1180px]"><div className="marketing-section-head"><div><p className="marketing-kicker">Discoveries</p><h2 className="mt-3 text-4xl font-black">Knowledge this person put into the market.</h2></div></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{discoveries.map((discovery:any)=><Link key={discovery.id} to={`/discoveries/${discovery.slug}`} className="group overflow-hidden border border-white/10 bg-white/[.025]"><div className="aspect-[4/3] overflow-hidden bg-white/[.04]">{discovery.cover_image?<img src={discovery.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>:<div className="grid h-full place-items-center"><Compass className="h-7 w-7 text-white/20"/></div>}</div><div className="p-5"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">{discovery.category||"Discovery"}</p><h3 className="mt-2 text-xl font-black">{discovery.title}</h3><p className="mt-2 text-xs text-white/42">{[discovery.city,discovery.country].filter(Boolean).join(", ")}</p></div></Link>)}</div></div></section>:null}
    <section className="border-t border-white/10 bg-white/[.02] px-5 py-10 sm:px-6"><div className="mx-auto flex max-w-[1180px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">Keep exploring</p><h2 className="mt-2 text-2xl font-black">See what else is moving.</h2></div><Link to="/discover" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300">Discover <ArrowRight className="h-4 w-4"/></Link></div></section>
  </main>;
}
