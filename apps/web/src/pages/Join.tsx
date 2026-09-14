import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ArrowRight, Building2, CalendarDays, Megaphone, Store, Users, UserRound, Briefcase } from "lucide-react";

const paths = [
  {
    eyebrow: "I want in",
    title: "Participate",
    description: "Discover things worth doing, show up, contribute, earn recognition, and unlock more from the places and communities around you.",
    href: "/auth?mode=signup&role=participant&next=/home",
    cta: "Join as a participant",
    icon: UserRound,
  },
  {
    eyebrow: "I create or influence",
    title: "Creator",
    description: "Turn attention into measurable action and build proof of the movement your content creates.",
    href: "/for-creators",
    cta: "Explore creator tools",
    icon: Megaphone,
  },
  {
    eyebrow: "I bring people together",
    title: "Host or organizer",
    description: "Create Moments, organize experiences, coordinate participation, and build repeat attendance around what you host.",
    href: "/hosting",
    cta: "Explore hosting",
    icon: CalendarDays,
  },
  {
    eyebrow: "I run a place or business",
    title: "Merchant or venue",
    description: "Turn visits, offers, customer actions, and repeat behavior into something you can see and grow.",
    href: "/for-merchants",
    cta: "Explore merchant tools",
    icon: Store,
  },
  {
    eyebrow: "I need an outcome",
    title: "Brand",
    description: "Fund actions you can verify across creators, customers, places, communities, and campaigns.",
    href: "/for-brands",
    cta: "Explore brand activations",
    icon: Building2,
  },
  {
    eyebrow: "I manage clients",
    title: "Agency",
    description: "Operate campaigns and client growth from one system while keeping each client relationship and result clear.",
    href: "/for-agencies",
    cta: "Explore agency tools",
    icon: Briefcase,
  },
  {
    eyebrow: "I lead a community",
    title: "Community or Scene lead",
    description: "Coordinate people around shared interests, repeat rituals, places, causes, and local culture.",
    href: "/for-communities",
    cta: "Explore community tools",
    icon: Users,
  },
  {
    eyebrow: "I represent an organization",
    title: "Enterprise",
    description: "Use Promorang across teams, locations, partners, audiences, and larger operational programs.",
    href: "/for-enterprise",
    cta: "Explore enterprise",
    icon: Building2,
  },
];

const Join = () => {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO
        title="Build with Promorang"
        description="Choose what you want to make happen with Promorang — participate, create, host, grow a business, activate a brand, manage clients, or lead a community."
      />

      <section className="border-b border-white/10 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Build with Promorang</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.04em] md:text-6xl">
            What are you trying to make happen?
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65 md:text-xl">
            Promorang connects people, places, creators, communities, and organizations around actions that create measurable value. Start with the job you need done — not a platform role you have to understand first.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.title}
                to={path.href}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-primary/40 hover:bg-white/[0.06] md:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/35 transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p className="mt-7 text-[11px] font-black uppercase tracking-[0.18em] text-white/40">{path.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">{path.title}</h2>
                <p className="mt-3 max-w-xl leading-7 text-white/60">{path.description}</p>
                <p className="mt-6 text-sm font-black text-primary">{path.cta}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-14">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.035] p-7 md:flex-row md:items-center md:p-9">
          <div>
            <p className="text-xl font-black">Not sure which path fits?</p>
            <p className="mt-2 text-white/55">Start by seeing how Promorang works, then choose when the job becomes clear.</p>
          </div>
          <Link to="/how-it-works" className="inline-flex items-center gap-2 text-sm font-black text-primary">
            See how Promorang works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Join;
