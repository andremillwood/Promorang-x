import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Gift, ShieldCheck, Store, WalletCards } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useCommerceActions } from "@/hooks/useCommerceActions";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

export default function OfferDetail() {
  const { id } = useParams();
  const actions = useCommerceActions();
  const q = useQuery({
    queryKey: ["offer", id],
    queryFn: async () => {
      const unifiedResponse = await fetch(`${API_BASE_URL}/offers/public/${id}`);
      const unifiedPayload = await unifiedResponse.json().catch(() => null);
      if (unifiedResponse.ok && unifiedPayload?.data) return { ...unifiedPayload.data, system: "unified" };
      const couponResponse = await fetch(`${API_BASE_URL}/coupons/public/${id}`);
      const couponPayload = await couponResponse.json();
      if (!couponResponse.ok) throw new Error(couponPayload.message || "Offer unavailable");
      return { ...(couponPayload.data?.coupon || couponPayload.coupon || couponPayload.data), system: "coupon" };
    },
    enabled: Boolean(id),
  });

  const relationshipQuery = useQuery({
    queryKey: ["offer-public-relationships", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("view_public_reward_directory")
        .select("venue_slug,venue_name,city,country,brand_slug,brand_name")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as {
        venue_slug: string | null;
        venue_name: string | null;
        city: string | null;
        country: string | null;
        brand_slug: string | null;
        brand_name: string | null;
      } | null;
    },
    enabled: Boolean(id),
    retry: 1,
  });

  const x = q.data;
  if (q.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] text-white">Opening Offer…</main>;
  if (q.isError || !x) return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div><Gift className="mx-auto h-8 w-8 text-orange-400"/><h1 className="mt-4 text-4xl font-black">Offer unavailable.</h1><p className="mt-3 text-sm text-white/45">We couldn’t load this offer right now.</p><Link to="/discover/rewards" className="mt-6 inline-flex items-center gap-2 text-orange-300"><ArrowLeft className="h-4 w-4"/>Browse perks</Link></div></main>;

  const value = x.discount_value || x.value || x.value_amount;
  const merchantId = x.merchant_stores?.user_id || x.merchant_user_id || x.merchant_id || x.owner_id;
  const merchantName = x.merchant_stores?.store_name || x.merchant_name || null;
  const image = x.image_url || x.cover_image || null;
  const relationships = relationshipQuery.data;
  const expiresAt = x.end_date || x.expires_at;
  const isExpired = Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
  const unifiedRemaining = typeof x.quantity_total === "number" ? x.quantity_total - Number(x.quantity_reserved || 0) - Number(x.quantity_redeemed || 0) : null;
  const isExhausted = typeof x.quantity_remaining === "number" ? x.quantity_remaining <= 0 : unifiedRemaining !== null && unifiedRemaining <= 0;
  const canClaim = !isExpired && !isExhausted;
  const availabilityLabel = isExpired ? "Ended" : isExhausted ? "Fully claimed" : "Available Offer";
  const authClaim = !actions.busy && canClaim ? () => actions.claim(String(id), x.system === "unified" ? "unified" : "coupon") : undefined;

  return <main className="marketing-cinematic public-object-page min-h-screen bg-[#050505] text-white">
    <SEO title={x.title || x.name || "Offer"} description={x.description || "Available access on PROMORANG."} />
    <section className="public-object-hero relative border-b border-white/10 px-5 pb-10 pt-14 sm:px-6 md:pt-20">
      <CurrentArc variant="hero" className="marketing-hero-current" />
      <div className="relative mx-auto max-w-[1280px]">
        <Link to="/discover/rewards" className="inline-flex items-center gap-2 text-xs font-bold text-white/48 hover:text-white"><ArrowLeft className="h-4 w-4"/>Perks & access</Link>
        <div className="mt-5 grid overflow-hidden border border-white/10 bg-[#090909] lg:grid-cols-[.9fr_1.1fr_320px]">
          <div className="public-object-hero__media">{image ? <img src={image} alt="" /> : <div className="grid h-full min-h-[380px] place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,90,0,.2),transparent_40%),#0a0a0a]"><Gift className="h-14 w-14 text-orange-400/45"/></div>}<span className="public-object-hero__state">{availabilityLabel}</span></div>
          <div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Perk / Offer</p><h1 className="mt-4 text-4xl font-black leading-[.92] tracking-[-.05em] sm:text-6xl">{x.title || x.name}</h1>{x.description ? <p className="mt-5 text-sm leading-7 text-white/58">{x.description}</p> : null}<div className="mt-7 border-t border-white/10 pt-5"><p className="text-4xl font-black text-orange-300">{value}{x.discount_type === "percentage" || x.value_unit === "percentage" ? "%" : ""}</p><p className="mt-2 text-xs text-white/38">{expiresAt ? `${isExpired ? "Ended" : "Available until"} ${new Date(expiresAt).toLocaleDateString()}` : "While available"}</p></div></div>
          <aside className="border-t border-white/10 bg-black/35 p-6 lg:border-l lg:border-t-0"><p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">{canClaim ? "Get it" : "Availability"}</p><h2 className="mt-3 text-2xl font-black">{canClaim ? "Add this access to your world." : isExpired ? "This offer has ended." : "Every available claim has been taken."}</h2><button type="button" disabled={!!actions.busy || !canClaim} onClick={authClaim} className="mt-5 inline-flex min-h-12 w-full items-center justify-between bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black disabled:opacity-50">{actions.busy ? "Claiming…" : canClaim ? "Claim to PromoCard" : availabilityLabel}<ArrowRight className="h-4 w-4"/></button><p className="mt-3 flex gap-2 text-[10px] leading-5 text-white/35"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0"/>{canClaim ? "Claim it to your PromoCard first. You’ll still need to follow the offer terms when you use it." : "Browse current perks to find access that is still available."}</p>{!canClaim ? <Link to="/discover/rewards" className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300">Browse current perks <ArrowRight className="h-4 w-4"/></Link> : null}</aside>
        </div>
      </div>
    </section>

    <section className="px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-3">
      <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">You get</p><h2 className="mt-3 text-2xl font-black">{value ? `${value}${x.discount_type === "percentage" || x.value_unit === "percentage" ? "%" : ""} value` : "What’s included"}</h2></div>
      <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">Use by</p><h2 className="mt-3 text-2xl font-black">{x.end_date ? new Date(x.end_date).toLocaleDateString() : "While available"}</h2></div>
      <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">State</p><h2 className="mt-3 text-2xl font-black">Available → Claim → Use</h2></div>
    </div></section>

    <section className="border-y border-white/10 bg-[#090909] px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1080px]"><p className="marketing-kicker">How to use it</p><div className="mt-7 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">{[["01","Claim","Claim the offer and add it to your PromoCard."],["02","Go / use","Follow the merchant’s terms when you’re ready to use it."],["03","Redeem","Redeem it with the merchant when you use the offer."]].map(([n,t,b])=><article key={n} className="bg-[#090909] p-6"><p className="text-xs font-black text-orange-300">{n}</p><h3 className="mt-8 text-xl font-black">{t}</h3><p className="mt-2 text-xs leading-5 text-white/42">{b}</p></article>)}</div></div></section>

    {merchantId ? <section className="px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1080px] border border-white/10 p-6 sm:flex sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><Store className="h-3.5 w-3.5"/>From this merchant</p><h2 className="mt-2 text-2xl font-black">{merchantName || "Open merchant storefront"}</h2></div><Link to={`/storefront/${merchantId}`} className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300 sm:mt-0">Visit storefront <ArrowRight className="h-4 w-4"/></Link></div></section> : null}

    {relationships?.venue_slug || relationships?.brand_slug ? <section className="border-t border-white/10 px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1080px]"><p className="marketing-kicker">Connected to this offer</p><h2 className="mt-3 text-3xl font-black">Keep moving through the world around it.</h2><div className="mt-7 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">{relationships.venue_slug ? <Link to={`/venues/${relationships.venue_slug}`} className="group bg-[#090909] p-6 transition hover:bg-white/[.04]"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><CalendarDays className="h-3.5 w-3.5"/>Available here</p><h3 className="mt-3 text-2xl font-black">{relationships.venue_name || "Open place"}</h3><p className="mt-2 text-xs text-white/42">{[relationships.city, relationships.country].filter(Boolean).join(", ") || "See the place connected to this offer."}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300">Open place <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></Link> : null}{relationships.brand_slug ? <Link to={`/brands/${relationships.brand_slug}`} className="group bg-[#090909] p-6 transition hover:bg-white/[.04]"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><Store className="h-3.5 w-3.5"/>Made possible by</p><h3 className="mt-3 text-2xl font-black">{relationships.brand_name || "Open brand"}</h3><p className="mt-2 text-xs text-white/42">See the public profile connected to this offer.</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300">Open profile <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/></span></Link> : null}</div></div></section> : null}

    <section className="border-t border-white/10 bg-white/[.02] px-5 py-10 sm:px-6"><div className="mx-auto flex max-w-[1080px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><WalletCards className="h-3.5 w-3.5"/>PromoCard</p><h2 className="mt-2 text-2xl font-black">{canClaim ? "Claim it. Keep it close." : "Find something available now."}</h2></div>{canClaim ? <button type="button" disabled={!!actions.busy} onClick={authClaim} className="inline-flex min-h-11 items-center gap-2 border border-orange-400/40 px-5 text-xs font-black uppercase tracking-[.08em] text-orange-300 disabled:opacity-50">Claim Offer <ArrowRight className="h-4 w-4"/></button> : <Link to="/discover/rewards" className="inline-flex min-h-11 items-center gap-2 border border-orange-400/40 px-5 text-xs font-black uppercase tracking-[.08em] text-orange-300">Browse current perks <ArrowRight className="h-4 w-4"/></Link>}</div></section>
  </main>;
}
