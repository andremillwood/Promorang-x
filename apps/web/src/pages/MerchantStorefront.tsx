import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CalendarClock, Globe2, MapPin, Package, Sparkles, Store, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

const kindIcon = (item: any) => item.discount_value ? Tag : item.fulfillment_mode === "booking" ? CalendarClock : Package;

export default function MerchantStorefront() {
  const { t, locale } = useI18n();
  const { merchantId } = useParams();
  const q = useQuery({
    queryKey: ["storefront", merchantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("view_public_commerce_directory").select("*").eq("merchant_user_id", merchantId).eq("is_active", true).eq("visibility", "public").limit(120);
      if (error) throw error;
      return data || [];
    },
  });

  const items = useMemo(() => [...(q.data || [])].sort((a: any,b: any) => {
    const ar=a.discount_value?0:a.fulfillment_mode==="booking"?1:2, br=b.discount_value?0:b.fulfillment_mode==="booking"?1:2;
    return ar-br || new Date(b.created_at||0).getTime()-new Date(a.created_at||0).getTime();
  }), [q.data]);
  const merchant=items[0];
  const offers=items.filter((x:any)=>x.discount_value);
  const services=items.filter((x:any)=>x.fulfillment_mode==="booking"||x.listing_kind==="service");
  const products=items.filter((x:any)=>!offers.includes(x)&&!services.includes(x));
  const hero=offers[0]||services[0]||items[0];
  const places=Array.from(new Map(items.filter((x:any)=>x.venue_slug).map((x:any)=>[x.venue_slug,x])).values()).slice(0,4) as any[];
  const linkedMoments=Array.from(new Map(items.filter((x:any)=>x.linked_moment_slug).map((x:any)=>[x.linked_moment_slug,x])).values()).slice(0,4) as any[];
  const hasAround=places.length>0||linkedMoments.length>0;

  if(q.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] text-white">Opening storefront…</main>;
  if(q.isError) return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div><Store className="mx-auto h-8 w-8 text-orange-400"/><h1 className="mt-4 text-4xl font-black">Storefront unavailable.</h1><p className="mt-3 text-sm text-white/45">PROMORANG cannot confirm this merchant's public inventory right now.</p></div></main>;
  if(!merchant) return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div><Store className="mx-auto h-8 w-8 text-orange-400"/><h1 className="mt-4 text-4xl font-black">Nothing public here yet.</h1><p className="mt-3 text-sm text-white/45">This merchant has no active public commerce inventory in the storefront source.</p></div></main>;

  const offerLabel=(item:any)=>item.discount_value?t("storefront.off",{value:`${item.discount_value}${item.discount_type==="percentage"?"%":""}`}):null;
  const money=(x:any)=>typeof x.price==="number"?new Intl.NumberFormat(locale,{style:"currency",currency:x.currency||"USD"}).format(x.price):x.points_cost?`${x.points_cost} pts`:t("market.open");

  const Rail=({title,eyebrow,data}:{title:string;eyebrow:string;data:any[]}) => data.length ? <section className="border-t border-white/10 px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1320px]"><div className="marketing-section-head"><div><p className="marketing-kicker">{eyebrow}</p><h2 className="mt-3 text-4xl font-black">{title}</h2></div><span className="text-[10px] font-black uppercase tracking-[.14em] text-white/35">{data.length} available</span></div><div className="merchant-object-grid">{data.map((x:any)=>{const Icon=kindIcon(x);return <Link key={x.listing_id} to={x.discount_value&&x.offer_id?`/offers/${x.offer_id}`:`/shop/${encodeURIComponent(x.listing_id)}`} className="merchant-object-card group"><div className="merchant-object-card__media">{x.image_url?<img src={x.image_url} alt=""/>:<div className="grid h-full place-items-center bg-white/[.04]"><Icon className="h-8 w-8 text-white/20"/></div>}{offerLabel(x)?<span>{offerLabel(x)}</span>:null}</div><div className="p-5"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">{x.listing_kind||x.fulfillment_mode||"Available"}</p><h3 className="mt-2 text-xl font-black">{x.name}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/42">{x.description}</p><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><b className="text-sm">{money(x)}</b><ArrowRight className="h-4 w-4 text-orange-300"/></div></div></Link>})}</div></div></section> : null;

  return <main className="marketing-cinematic merchant-public-world min-h-screen bg-[#050505] text-white">
    <section className="public-object-hero relative border-b border-white/10 px-5 pb-10 pt-14 sm:px-6 md:pt-20">
      <CurrentArc variant="hero" className="marketing-hero-current"/>
      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid overflow-hidden border border-white/10 bg-[#090909] lg:grid-cols-[.9fr_1.1fr]">
          <div className="public-object-hero__media">{hero?.image_url?<img src={hero.image_url} alt=""/>:<div className="grid h-full min-h-[430px] place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,90,0,.2),transparent_40%),#090909]"><Store className="h-14 w-14 text-orange-400/35"/></div>}<span className="public-object-hero__state">Merchant storefront</span></div>
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12"><p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Available on PROMORANG</p><h1 className="mt-4 text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">{merchant.merchant_name||t("storefront.local")}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/52">{merchant.description||t("storefront.copy")}</p><div className="mt-6 flex flex-wrap gap-4 text-xs text-white/55">{merchant.location?<span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-400"/>{merchant.location}</span>:null}<span>{offers.length} offer{offers.length===1?"":"s"}</span><span>{services.length} bookable</span></div><div className="mt-7 flex flex-wrap gap-3">{merchant.merchant_website?<a href={merchant.merchant_website} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 text-xs font-black uppercase tracking-[.08em]">Website <Globe2 className="h-4 w-4"/></a>:null}<a href="#available" className="inline-flex min-h-11 items-center gap-2 bg-orange-500 px-4 text-xs font-black uppercase tracking-[.08em] text-black">See what's available <ArrowRight className="h-4 w-4"/></a></div></div>
        </div>
      </div>
    </section>

    <nav className="public-object-tabs border-b border-white/10 bg-black/92 px-5 sm:px-6"><div className="mx-auto flex max-w-[1320px] gap-7 overflow-x-auto py-4 text-[10px] font-black uppercase tracking-[.12em] text-white/48"><a href="#available" className="text-orange-300">Available</a>{offers.length?<a href="#offers">Perks</a>:null}{services.length?<a href="#services">Book</a>:null}{products.length?<a href="#products">Products</a>:null}{hasAround?<a href="#around">Around</a>:null}</div></nav>

    {hero ? <section id="available" className="px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto grid max-w-[1120px] overflow-hidden border border-white/10 bg-[#090909] md:grid-cols-[1.1fr_.9fr]"><div className="aspect-[16/10] overflow-hidden bg-white/[.04]">{hero.image_url?<img src={hero.image_url} alt="" className="h-full w-full object-cover"/>:null}</div><div className="flex flex-col justify-center p-7"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><Sparkles className="h-3.5 w-3.5"/>Featured now</p><h2 className="mt-3 text-3xl font-black">{hero.name}</h2><p className="mt-3 text-sm leading-7 text-white/48">{hero.description}</p><Link to={hero.discount_value&&hero.offer_id?`/offers/${hero.offer_id}`:`/shop/${encodeURIComponent(hero.listing_id)}`} className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300">Open <ArrowRight className="h-4 w-4"/></Link></div></div></section>:null}

    <div id="offers"><Rail eyebrow="Perks & offers" title="A reason to come in." data={offers}/></div>
    <div id="services"><Rail eyebrow="Book / reserve" title="Things you can arrange here." data={services}/></div>
    <div id="products"><Rail eyebrow="Shop" title="Available from this merchant." data={products}/></div>

    {hasAround?<section id="around" className="border-t border-white/10 px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto max-w-[1120px]"><div className="marketing-section-head"><div><p className="marketing-kicker">Around this merchant</p><h2 className="mt-3 text-4xl font-black">Go where the inventory is connected.</h2></div></div><div className="grid gap-3 md:grid-cols-2">{places.map((x:any)=><Link key={`place-${x.venue_slug}`} to={`/venues/${x.venue_slug}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">Around this place</p><h3 className="mt-3 text-xl font-black">{x.venue_name||x.location||"Open place"}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>{x.city||"Place"}</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300"/></div></Link>)}{linkedMoments.map((x:any)=><Link key={`moment-${x.linked_moment_slug}`} to={`/moments/${x.linked_moment_slug}`} className="group border border-white/10 p-5 transition hover:border-orange-400/35"><p className="text-[9px] font-black uppercase tracking-[.14em] text-orange-300">Happening around this</p><h3 className="mt-3 text-xl font-black">{x.linked_moment_title||"Open Moment"}</h3><div className="mt-5 flex items-center justify-between text-xs text-white/42"><span>Moment</span><ArrowRight className="h-4 w-4 transition group-hover:text-orange-300"/></div></Link>)}</div></div></section>:null}

    <section className="border-t border-white/10 bg-[#090909] px-5 py-12 sm:px-6"><div className="mx-auto flex max-w-[1120px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">Merchant on PROMORANG</p><h2 className="mt-2 text-2xl font-black">Come back when something changes.</h2><p className="mt-2 text-xs text-white/42">Storefront inventory stays source-backed. PROMORANG does not manufacture an Offer, product or booking just to fill a section.</p></div><Link to="/discover" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300">Keep exploring <ArrowRight className="h-4 w-4"/></Link></div></section>
  </main>;
}
