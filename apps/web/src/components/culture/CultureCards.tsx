import { Link, useLocation } from "react-router-dom";
import { Bell, Bookmark, Flame, Home, MapPin, Search, User, WalletCards } from "lucide-react";
import { ContentProvenanceBadge } from "@/components/content/ContentProvenance";

type CultureEvent = {
  isSample?: boolean;
  slug: string;
  momentId?: string;
  title: string;
  shortTitle: string;
  description?: string;
  date: string;
  time?: string;
  place: string;
  city: string;
  image: string;
  category: string;
  proof: string;
  attending: string;
};

type Scene = {
  isSample?: boolean;
  slug: string;
  title: string;
  tagline: string;
  image: string;
  members: string;
  momentsHosted: string;
  checkIns: string;
  tags: string[];
};

type Creator = {
  isSample?: boolean;
  handle: string;
  name: string;
  role: string;
  location: string;
  image: string;
  avatar: string;
  followers: string;
  events: string;
  checkIns: string;
};

export function ExperienceCard({ event, compact = false }: { event: CultureEvent; compact?: boolean }) {
  return (
    <Link to={`/events/${event.slug}`} className="group block">
      <article className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${compact ? "h-48" : "h-64"}`}>
        <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end p-4">
          <div className="mb-auto flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-black uppercase text-white">{event.date}</span>
              {event.isSample && <ContentProvenanceBadge compact />}
            </div>
            <span className="rounded-full bg-black/45 p-2 text-white/80 backdrop-blur">
              <Bookmark className="h-4 w-4" />
            </span>
          </div>
          <h3 className="font-sans text-3xl font-black uppercase leading-[0.86] tracking-[-0.06em] text-white">{event.shortTitle}</h3>
          <p className="mt-3 text-sm font-bold text-white">{event.place}</p>
          <p className="text-xs text-white/60">{event.city}</p>
          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em]">
            <span className="text-white/55">{event.category}</span>
            <span className="text-primary">{event.proof}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function SceneCard({ scene }: { scene: Scene }) {
  return (
    <Link to={`/scenes/${scene.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] transition hover:border-primary/50">
        <div className="relative h-56 overflow-hidden">
          <img src={scene.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-4">
            {scene.isSample && <ContentProvenanceBadge className="absolute left-4 top-4" compact />}
            <h3 className="font-sans text-4xl font-black uppercase leading-[0.86] tracking-[-0.06em] text-white">{scene.title}</h3>
            <p className="mt-2 text-sm text-white/70">{scene.tagline}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 text-center">
          <div>
            <p className="text-lg font-black text-white">{scene.members}</p>
            <p className="text-[10px] text-white/50">Members</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{scene.momentsHosted}</p>
            <p className="text-[10px] text-white/50">Moments</p>
          </div>
          <div>
            <p className="text-lg font-black text-white">{scene.checkIns}</p>
            <p className="text-[10px] text-white/50">Check-ins</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export const CommunityCard = ({ community }: { community: Scene }) => <SceneCard scene={community} />;

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link to={`/creators/${creator.handle}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] transition hover:border-primary/50">
        <div className="relative h-56">
          <img src={creator.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <img src={creator.avatar} alt="" className="absolute bottom-4 left-4 h-20 w-20 rounded-full border-2 border-white object-cover" />
          {creator.isSample && <ContentProvenanceBadge className="absolute right-4 top-4" compact />}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-black text-white">{creator.name}</h3>
          <p className="text-sm text-white/60">{creator.role}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-white/55">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {creator.location}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-black text-white">{creator.followers}</p>
              <p className="text-[10px] text-white/45">Followers</p>
            </div>
            <div>
              <p className="font-black text-white">{creator.events}</p>
              <p className="text-[10px] text-white/45">Events</p>
            </div>
            <div>
              <p className="font-black text-white">{creator.checkIns}</p>
              <p className="text-[10px] text-white/45">Check-ins</p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const items = [
    { label: "Home", icon: Home, href: "/" },
    { label: "PromoCard", icon: WalletCards, href: "/wallet" },
    { label: "Discover", icon: Search, href: "/discover" },
    { label: "Inbox", icon: Bell, href: "/notifications" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <nav aria-label="Primary mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-safe pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-5 px-2 text-[10px] font-bold text-white/55">
        {items.map((item) => {
          const active = item.href === "/" ? location.pathname === "/" : location.pathname.startsWith(item.href);
          return (
            <Link key={item.label} to={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-1 transition active:bg-white/10 ${active ? "text-primary" : ""}`}>
              <item.icon className="h-[19px] w-[19px]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CultureShellHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black px-6 pb-12 pt-28 text-white">
      <div className="container">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-sans text-5xl font-black uppercase leading-[0.86] tracking-[-0.075em] md:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">{copy}</p>
      </div>
    </section>
  );
}
