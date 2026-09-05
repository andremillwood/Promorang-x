import { Link } from "react-router-dom";
import { ArrowRight, Check, MapPin, ScanLine, Sparkles, WalletCards, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type MobileOffer = {
  id: string;
  title: string;
  merchant: string;
  image: string;
  href: string;
  price?: string;
};

type MobileMoment = {
  id: string;
  title: string;
  location: string;
  image: string | null;
  href: string;
  date?: string;
};

export function MobilePromoHome({ offers, moments }: { offers: MobileOffer[]; moments: MobileMoment[] }) {
  const { user } = useAuth();
  const primaryHref = user ? "/card" : "/auth?mode=signup&next=/card";

  return (
    <div className="bg-[#f3efe6] text-[#14120f] md:hidden">
      <section className="px-5 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a34a1a]">Use it nearby</p>
            <h2 className="mt-2 max-w-[15rem] font-serif text-[2rem] font-black leading-[0.96] tracking-[-0.04em]">
              Your next outing can cost less.
            </h2>
          </div>
          <Link to="/shop" className="mb-1 shrink-0 text-xs font-black text-[#a34a1a]">See all</Link>
        </div>

        <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(offers.length ? offers.slice(0, 4) : fallbackOffers).map((offer) => (
            <Link key={offer.id} to={offer.href} className="group w-[78vw] max-w-[19rem] shrink-0 snap-start overflow-hidden rounded-[1.35rem] bg-[#171512] shadow-[0_18px_45px_rgba(46,31,17,0.16)]">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={offer.image} alt="" className="h-full w-full object-cover transition duration-500 group-active:scale-[1.02]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-[#f3efe6]/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#3d2a1e]">PromoCard place</span>
              </div>
              <div className="p-4 text-white">
                <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f6ad72]">{offer.merchant}</p>
                <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight">{offer.title}</h3>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-xs text-white/60">View offer before you go</span>
                  <ArrowRight className="h-4 w-4 text-[#ff6a1a]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[#625a50]">Offers, minimum spend and availability are always shown before checkout.</p>
      </section>

      <section className="bg-[#171512] px-5 py-14 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6ad72]">One simple loop</p>
        <h2 className="mt-2 max-w-xs font-serif text-[2rem] font-black leading-[0.98] tracking-[-0.04em]">Use value. Show up. Earn more.</h2>
        <div className="mt-8 space-y-7">
          {[
            ["01", ScanLine, "Apply your PromoCard", "See the exact promotional value you can use, then pay any remainder normally."],
            ["02", MapPin, "Make a verified visit", "Check in, join a Moment or complete an eligible action at a participating place."],
            ["03", Zap, "Recharge your value", "Qualified actions can restore promotional spending balance for your next move."],
          ].map(([number, Icon, title, copy]) => {
            const StepIcon = Icon as typeof ScanLine;
            return (
              <div key={number as string} className="grid grid-cols-[2.75rem_1fr] gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-[#ff6a1a]/35 bg-[#ff6a1a]/10">
                  <StepIcon className="h-4 w-4 text-[#ff7a2d]" />
                </div>
                <div className="border-b border-white/10 pb-7">
                  <p className="text-[9px] font-black tracking-[0.18em] text-white/35">STEP {number as string}</p>
                  <h3 className="mt-1 text-base font-black">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{copy as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {moments.length > 0 && (
        <section className="px-5 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a34a1a]">More ways to participate</p>
              <h2 className="mt-2 font-serif text-[2rem] font-black leading-none tracking-[-0.04em]">Happening nearby.</h2>
            </div>
            <Link to="/discover" className="mb-1 shrink-0 text-xs font-black text-[#a34a1a]">Discover</Link>
          </div>
          <div className="mt-6 space-y-3">
            {moments.slice(0, 3).map((moment) => (
              <Link key={moment.id} to={moment.href} className="grid min-h-[6rem] grid-cols-[5.5rem_1fr] overflow-hidden rounded-[1.2rem] bg-white shadow-[0_10px_30px_rgba(46,31,17,0.08)] active:scale-[0.99]">
                {moment.image ? <img src={moment.image} alt="" className="h-full w-full object-cover" /> : <div className="grid place-items-center bg-[#241d18]"><Sparkles className="h-5 w-5 text-[#ff6a1a]" /></div>}
                <div className="min-w-0 p-3.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#a34a1a]">{moment.date || "Coming up"}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-black leading-tight">{moment.title}</h3>
                  <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#756b5f]"><MapPin className="h-3 w-3" />{moment.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] pt-4">
        <div className="rounded-[1.5rem] bg-[#e8ddc9] p-5">
          <WalletCards className="h-6 w-6 text-[#a34a1a]" />
          <h2 className="mt-5 font-serif text-2xl font-black leading-tight">Ready when your next plan is.</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#51483e]">
            {["No cash repayment", "Offer shown before checkout", "Merchant terms stay visible"].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-700" />{item}</li>)}
          </ul>
          <Link to={primaryHref} className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#171512] px-5 text-sm font-black text-white active:scale-[0.98]">
            {user ? "Open my PromoCard" : "Get my PromoCard"}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {!user && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-[#f3efe6]/95 px-4 pb-[max(.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
          <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-2">
            <Link to={primaryHref} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ed5a10] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(237,90,16,0.28)] active:scale-[0.98]">
              <WalletCards className="h-4 w-4" />Get PromoCard
            </Link>
            <Link to="/shop" aria-label="Find participating places" className="grid min-h-12 min-w-12 place-items-center rounded-xl border border-black/10 bg-white text-[#171512] active:bg-black/5"><MapPin className="h-5 w-5" /></Link>
          </div>
        </div>
      )}
    </div>
  );
}

const fallbackOffers: MobileOffer[] = [
  { id: "food", title: "Food, drinks and local experiences", merchant: "Participating places", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=900", href: "/shop" },
  { id: "night", title: "Make more of your next night out", merchant: "Restaurants & events", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=900", href: "/discover" },
];
