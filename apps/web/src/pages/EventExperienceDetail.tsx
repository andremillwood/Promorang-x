import { Link, useParams } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, MapPin, ShieldCheck, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { ExperienceCard, MobileBottomNav } from "@/components/culture/CultureCards";
import { cultureScenes, cultureEvents } from "@/data/culture-demo";
import { ContentProvenanceBadge, SampleContentNotice } from "@/components/content/ContentProvenance";

const ticketOptions = [
  { label: "Early Bird", detail: "Limited time offer", price: "JMD $1,500" },
  { label: "General Admission", detail: "More at the door", price: "JMD $2,000" },
  { label: "VIP Access", detail: "Fast lane + VIP area", price: "JMD $4,000" },
];

export default function EventExperienceDetail() {
  const { slug } = useParams();
  const event = cultureEvents.find((item) => item.slug === slug) || cultureEvents[0];
  const host = cultureScenes[0];

  return (
    <main className="min-h-screen bg-black pb-24 text-white">
      <SEO
        title={`${event.title} - Promorang Moment`}
        description={`Join ${event.title} at ${event.place}. Show up, prove the moment, and unlock what comes next.`}
      />

      <section className="container grid gap-5 px-6 pb-10 pt-28 lg:grid-cols-[1.2fr_0.8fr_280px]">
        <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10">
          <img src={event.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6">
            <ContentProvenanceBadge className="mb-auto w-fit" />
            <h1 className="max-w-xl font-sans text-6xl font-black uppercase leading-[0.84] tracking-[-0.07em]">{event.shortTitle}</h1>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
            Sample moment
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">{event.title}</h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            {event.description || "A real-world moment with a proof action, a reason to show up, and value that can carry forward."}
          </p>
          <div className="mt-6 grid gap-3 border-y border-white/10 py-5 sm:grid-cols-3">
            <div>
              <CalendarDays className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-bold">{event.date}</p>
              <p className="text-xs text-white/45">{event.time}</p>
            </div>
            <div>
              <MapPin className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-bold">{event.place}</p>
              <p className="text-xs text-white/45">{event.city}</p>
            </div>
            <div>
              <Users className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-bold">{event.attending}</p>
              <p className="text-xs text-white/45">Going</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <img src={host.logoImage} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-bold">{host.title}</p>
              <p className="text-xs text-white/45">{host.members} followers</p>
            </div>
            <Link to={`/scenes/${host.slug}`} className="ml-auto rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">
              Scene
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Get in</p>
          <p className="mt-2 text-sm text-white/60">Choose how you want to enter the moment.</p>
          <div className="mt-4 space-y-3">
            {ticketOptions.map((ticket) => (
              <div key={ticket.label} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{ticket.label}</p>
                    <p className="text-xs text-white/45">{ticket.detail}</p>
                  </div>
                  <p className="font-black">{ticket.price}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/auth" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-4 text-sm font-black text-white">
            Act on this moment
          </Link>
          <Link to="/auth" className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-primary px-5 py-4 text-sm font-black text-white">
            Save moment
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/45">
            <ShieldCheck className="h-4 w-4" />
            Secure checkout via Promorang
          </p>
        </aside>
      </section>
      <div className="container px-6">
        <SampleContentNotice noun="moment details, attendance, and pricing" />
      </div>

      <section className="container grid gap-6 px-6 py-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <h2 className="text-2xl font-black">About</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">{event.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              ["Proof", event.proof],
              ["Action", event.expectedAction || "Show up and verify"],
              ["Reward", event.reward || event.price],
              ["Hosted by", event.host || host.title],
            ].map(([label, value]) => (
              <div key={label}>
                <Ticket className="mb-2 h-4 w-4 text-primary" />
                <p className="text-xs font-bold">{label}</p>
                <p className="text-xs text-white/45">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <h2 className="text-2xl font-black">Promorang proof layer</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">
            This is where Promoshare, referrals, Pieces, and proof become contextual. Users should see what check-ins unlock, who moved the room, and what status carries forward after the moment.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Check in", event.proof],
              ["Unlock", "Access + rewards"],
              ["Return", "Build status"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <Clock className="mb-3 h-5 w-5 text-primary" />
                <p className="font-black">{label}</p>
                <p className="text-xs text-white/45">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-[-0.03em]">You might also like</h2>
          <Link to="/events" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {cultureEvents.filter((item) => item.slug !== event.slug).slice(0, 4).map((item) => (
            <ExperienceCard key={item.slug} event={item} compact />
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </main>
  );
}
