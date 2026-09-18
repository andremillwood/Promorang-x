import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Gift, ShieldCheck, Store, WalletCards } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useCommerceActions } from "@/hooks/useCommerceActions";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function OfferDetail() {
  const { id } = useParams();
  const actions = useCommerceActions();
  const q = useQuery({
    queryKey: ["offer", id],
    queryFn: async () => {
      const r = await fetch(`${API_BASE_URL}/coupons/public/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Offer unavailable");
      return d.data?.coupon || d.coupon || d.data;
    },
  });

  const x = q.data;
  if (q.isLoading) return <main className="grid min-h-screen place-items-center bg-[#050505] text-white">Opening Offer…</main>;
  if (q.isError || !x) return <main className="grid min-h-screen place-items-center bg-[#050505] px-6 text-center text-white"><div><Gift className="mx-auto h-8 w-8 text-orange-400"/><h1 className="mt-4 text-4xl font-black">Offer unavailable.</h1><p className="mt-3 text-sm text-white/45">PROMORANG cannot confirm this public Offer right now.</p><Link to="/discover/rewards" className="mt-6 inline-flex items-center gap-2 text-orange-300"><ArrowLeft className="h-4 w-4"/>Browse perks</Link></div></main>;

  const value = x.discount_value || x.value;
  const merchantId = x.merchant_user_id || x.merchant_id || x.owner_id;
  const image = x.image_url || x.cover_image || null;
  const authClaim = !actions.busy ? () => actions.claim(String(id)) : undefined;

  return <main className="marketing-cinematic public-object-page min-h-screen bg-[#050505] text-white">
    <section className="public-object-hero relative border-b border-white/10 px-5 pb-10 pt-14 sm:px-6 md:pt-20">
      <CurrentArc variant="hero" className="marketing-hero-current" />
      <div className="relative mx-auto max-w-[1280px]">
        <Link to="/discover/rewards" className="inline-flex items-center gap-2 text-xs font-bold text-white/48 hover:text-white"><ArrowLeft className="h-4 w-4"/>Perks & access</Link>
        <div className="mt-5 grid overflow-hidden border border-white/10 bg-[#090909] lg:grid-cols-[.9fr_1.1fr_320px]">
          <div className="public-object-hero__media">{image ? <img src={image} alt="" /> : <div className="grid h-full min-h-[380px] place-items-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,90,0,.2),transparent_40%),#0a0a0a]"><Gift className="h-14 w-14 text-orange-400/45"/></div>}<span className="public-object-hero__state">Available Offer</span></div>
          <div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Perk / Offer</p><h1 className="mt-4 text-4xl font-black leading-[.92] tracking-[-.05em] sm:text-6xl">{x.title || x.name}</h1>{x.description ? <p className="mt-5 text-sm leading-7 text-white/58">{x.description}</p> : null}<div className="mt-7 border-t border-white/10 pt-5"><p className="text-4xl font-black text-orange-300">{value}{x.discount_type === "percentage" || x.value_unit === "percentage" ? "%" : ""}</p><p className="mt-2 text-xs text-white/38">{x.end_date ? `Available until ${new Date(x.end_date).toLocaleDateString()}` : "While available"}</p></div></div>
          <aside className="border-t border-white/10 bg-black/35 p-6 lg:border-l lg:border-t-0"><p className="text-[9px] font-black uppercase tracking-[.16em] text-orange-300">Get it</p><h2 className="mt-3 text-2xl font-black">Add this access to your world.</h2><button type="button" disabled={!!actions.busy} onClick={authClaim} className="mt-5 inline-flex min-h-12 w-full items-center justify-between bg-orange-500 px-5 text-xs font-black uppercase tracking-[.08em] text-black disabled:opacity-50">{actions.busy ? "Claiming…" : "Claim to PromoCard"}<ArrowRight className="h-4 w-4"/></button><p className="mt-3 flex gap-2 text-[10px] leading-5 text-white/35"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0"/>Eligibility is checked before a redemption code is issued. Claim is not redemption.</p></aside>
        </div>
      </div>
    </section>

    <section className="px-5 py-14 sm:px-6 md:py-20"><div className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-3">
      <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">You get</p><h2 className="mt-3 text-2xl font-black">{value ? `${value}${x.discount_type === "percentage" || x.value_unit === "percentage" ? "%" : ""} value` : "The recorded Offer benefit"}</h2></div>
      <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">Use by</p><h2 className="mt-3 text-2xl font-black">{x.end_date ? new Date(x.end_date).toLocaleDateString() : "While available"}</h2></div>
      <div><p className="text-[9px] font-black uppercase tracking-[.15em] text-orange-300">State</p><h2 className="mt-3 text-2xl font-black">Available → Claim → Use</h2></div>
    </div></section>

    <section className="border-y border-white/10 bg-[#090909] px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1080px]"><p className="marketing-kicker">How to use it</p><div className="mt-7 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">{[["01","Claim","Eligibility is checked and access is issued only if the claim succeeds."],["02","Go / use","Follow the real fulfillment or merchant conditions attached to the Offer."],["03","Redeem","Only a successful redemption advances the Offer to used history."]].map(([n,t,b])=><article key={n} className="bg-[#090909] p-6"><p className="text-xs font-black text-orange-300">{n}</p><h3 className="mt-8 text-xl font-black">{t}</h3><p className="mt-2 text-xs leading-5 text-white/42">{b}</p></article>)}</div></div></section>

    {merchantId ? <section className="px-5 py-14 sm:px-6"><div className="mx-auto max-w-[1080px] border border-white/10 p-6 sm:flex sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><Store className="h-3.5 w-3.5"/>From this merchant</p><h2 className="mt-2 text-2xl font-black">{x.merchant_name || "Open merchant storefront"}</h2></div><Link to={`/store/${merchantId}`} className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-orange-300 sm:mt-0">Visit storefront <ArrowRight className="h-4 w-4"/></Link></div></section> : null}

    <section className="border-t border-white/10 bg-white/[.02] px-5 py-10 sm:px-6"><div className="mx-auto flex max-w-[1080px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-orange-300"><WalletCards className="h-3.5 w-3.5"/>PromoCard</p><h2 className="mt-2 text-2xl font-black">Claim real access. Keep real history.</h2></div><button type="button" disabled={!!actions.busy} onClick={authClaim} className="inline-flex min-h-11 items-center gap-2 border border-orange-400/40 px-5 text-xs font-black uppercase tracking-[.08em] text-orange-300 disabled:opacity-50">Claim Offer <ArrowRight className="h-4 w-4"/></button></div></section>
  </main>;
}
