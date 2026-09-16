import {
  ArrowRight,
  Bookmark,
  CarFront,
  ChefHat,
  Clock3,
  Compass,
  CreditCard,
  Globe2,
  Home,
  LockKeyhole,
  MapPin,
  Scissors,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import { PromoCardFace } from "@/components/promorang/PromoCardObject";

const stock = {
  food: {
    image: "https://images.pexels.com/photos/9219285/pexels-photo-9219285.jpeg?auto=compress&dpr=1&h=900&w=1400",
    source: "https://www.pexels.com/photo/elegant-brunette-woman-eating-lunch-in-restaurant-9219285/",
  },
  automotive: {
    image: "https://images.pexels.com/photos/7144200/pexels-photo-7144200.jpeg?auto=compress&dpr=1&h=900&w=1400",
    source: "https://www.pexels.com/photo/people-sitting-inside-a-car-7144200/",
  },
  beauty: {
    image: "https://images.pexels.com/photos/10600178/pexels-photo-10600178.jpeg?auto=compress&dpr=1&h=900&w=1400",
    source: "https://www.pexels.com/photo/a-woman-at-a-beauty-salon-10600178/",
  },
  community: {
    image: "https://images.pexels.com/photos/18999145/pexels-photo-18999145/free-photo-of-people-sitting-in-meeting-in-office.jpeg?auto=compress&dpr=1&h=900&w=1400",
    source: "https://www.pexels.com/photo/people-sitting-in-meeting-in-office-18999145/",
  },
  digital: {
    image: "https://images.pexels.com/photos/5083606/pexels-photo-5083606.jpeg?auto=compress&dpr=1&h=900&w=1400",
    source: "https://www.pexels.com/photo/a-laptop-beside-a-microphone-in-a-studio-5083606/",
  },
} as const;

const nav = [
  [Home, "Today"],
  [Compass, "Discover"],
  [CreditCard, "Card"],
  [LockKeyhole, "Vault"],
  [UserRound, "You"],
] as const;

function ConsumerNav({ active = "Today" }: { active?: string }) {
  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-black/95 px-2 pb-2 pt-3" aria-label="Consumer navigation specimen">
      {nav.map(([Icon, label]) => (
        <button
          key={label}
          type="button"
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-bold ${active === label ? "text-primary" : "text-white/38"}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}

function Phone({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="mx-auto flex min-h-[850px] w-full max-w-[414px] flex-col overflow-hidden rounded-[2.65rem] border border-white/15 bg-black shadow-[0_32px_90px_rgba(0,0,0,.58)]">
      <div className="flex-1 overflow-hidden">{children}</div>
      <ConsumerNav active={active} />
    </div>
  );
}

function Metric({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/72">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function TodayStudy() {
  return (
    <Phone active="Today">
      <section className="relative min-h-[650px] overflow-hidden">
        <img src={stock.food.image} alt="Restaurant lunch placeholder" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 pt-7">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/70">Kingston · 12:18 PM</p>
            <p className="mt-1 text-xs text-white/55">Liguanea · 8 min away</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-black/35 backdrop-blur-md"><UserRound className="h-4 w-4" /></div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-black">Use by 3 PM</span>
            <span className="rounded-full bg-black/45 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/75 backdrop-blur">Food</span>
          </div>
          <p className="text-xs font-bold text-white/70">Broken Plate · Liguanea</p>
          <h3 className="mt-2 max-w-[330px] font-serif text-[2.8rem] font-bold leading-[0.88] tracking-[-0.055em]">Lunch worth leaving the office for.</h3>
          <p className="mt-3 text-xl font-black text-[#f6d48a]">20% off the chef's lunch menu</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <Metric icon={Star}>4.8 · 212 verified uses</Metric>
            <Metric icon={MapPin}>0.7 km</Metric>
            <Metric icon={Clock3}>42 min left</Metric>
          </div>
          <button type="button" className="mt-5 flex min-h-13 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-black text-black">
            <span>Use PromoCard</span><ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-[10px] leading-4 text-white/42">Stock placeholder · merchant imagery would replace this in production.</p>
        </div>
      </section>

      <div className="px-5 pb-7 pt-6">
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/32">Why this is here</p>
        <p className="mt-2 font-serif text-xl font-bold">Because you used two lunch benefits nearby.</p>
        <p className="mt-2 text-xs leading-5 text-white/42">Personalization explains itself quietly instead of becoming another dashboard module.</p>
      </div>
    </Phone>
  );
}

const discoveries = [
  {
    category: "AUTOMOTIVE",
    title: "Drive this today.",
    merchant: "Flash Motors",
    value: "Priority Geely test-drive access",
    meta: "Kingston · 3 slots left",
    image: stock.automotive.image,
    Icon: CarFront,
  },
  {
    category: "BEAUTY",
    title: "An appointment just opened.",
    merchant: "Barbican beauty partner",
    value: "Complimentary treatment add-on",
    meta: "1.1 km · today",
    image: stock.beauty.image,
    Icon: Scissors,
  },
  {
    category: "COMMUNITY",
    title: "A room is forming around this.",
    merchant: "New Kingston workshop",
    value: "Reserved seat with PromoCard",
    meta: "Saturday · 2 PM",
    image: stock.community.image,
    Icon: UsersRound,
  },
  {
    category: "DIGITAL",
    title: "Something useful just unlocked.",
    merchant: "Creator drop",
    value: "Subscriber-only download",
    meta: "Anywhere · 48 hours",
    image: stock.digital.image,
    Icon: Globe2,
  },
] as const;

function DiscoverStudy() {
  return (
    <Phone active="Discover">
      <div className="px-5 pt-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-primary">For you · Kingston</p>
            <h3 className="mt-2 font-serif text-[2.55rem] font-bold leading-[0.9] tracking-[-0.05em]">Worth your attention.</h3>
          </div>
          <Bookmark className="mt-1 h-5 w-5 text-white/45" />
        </div>
        <p className="mt-3 text-sm leading-6 text-white/46">Places, brands and people become the visual hierarchy. PROMORANG stays in the action layer.</p>
      </div>

      <div className="mt-6 space-y-1">
        {discoveries.map(({ category, title, merchant, value, meta, image, Icon }, index) => (
          <article key={category} className={`relative overflow-hidden ${index === 0 ? "min-h-[300px]" : "min-h-[205px]"}`}>
            <img src={image} alt={`${category.toLowerCase()} stock placeholder`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-primary"><Icon className="h-3.5 w-3.5" />{category}</span>
                <Bookmark className="h-4 w-4 text-white/55" />
              </div>
              <p className="mt-3 text-xs font-bold text-white/60">{merchant}</p>
              <h4 className="mt-1 max-w-[320px] font-serif text-3xl font-bold leading-[0.92] tracking-[-0.035em]">{title}</h4>
              <p className="mt-2 text-sm font-bold text-[#f6d48a]">{value}</p>
              <p className="mt-2 text-[11px] text-white/48">{meta}</p>
            </div>
          </article>
        ))}
      </div>
    </Phone>
  );
}

export function WorldClassConsumerStudy() {
  return (
    <section className="border-t border-white/10 pt-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_.58fr] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">08 · Image-led consumer study</p>
          <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.88] tracking-[-0.06em] md:text-7xl">Let the opportunity become the interface.</h2>
        </div>
        <div className="border-l border-primary/35 pl-5">
          <p className="font-serif text-2xl font-bold text-[#f6d48a]">Less decoration. More reality.</p>
          <p className="mt-3 text-sm leading-6 text-white/48">Stock imagery is temporary, but the hierarchy is intentional: real context, issuer, value, trust signals, urgency and one next move.</p>
        </div>
      </div>

      <div className="mt-14 grid gap-10 xl:grid-cols-2">
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Today · image-first</p>
          <TodayStudy />
        </div>
        <div>
          <p className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Discover · content-first</p>
          <DiscoverStudy />
        </div>
      </div>

      <div className="mt-14 grid gap-8 border-t border-white/10 pt-10 xl:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Object continuity</p>
          <h3 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em]">The world changes. Your access object does not.</h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">The imagery, merchant and opportunity can change radically while PromoCard remains the recognizable access layer.</p>
        </div>
        <PromoCardFace
          available="20% off lunch"
          limit="Broken Plate · until 3 PM"
          holder="Andre"
          places="LIGUANEA LUNCH"
          action="USE THIS"
          sceneMark="FOOD & TASTE"
          interactive={false}
          className="max-w-none"
        />
      </div>

      <p className="mt-10 text-[10px] leading-5 text-white/28">Placeholder photography: Pexels free-to-use source images for design evaluation only. Replace with merchant/brand-owned media in production.</p>
    </section>
  );
}
