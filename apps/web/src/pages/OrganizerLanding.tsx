import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Radio, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureEvents } from "@/data/culture-demo";
import { HostSyndicateSimulator } from "@/components/value/HostSyndicateSimulator";

const operatingLoop = [
  { icon: Radio, label: "Publish", text: "Put a moment into the world with a clear reason to show up." },
  { icon: Ticket, label: "Fill the room", text: "Coordinate tickets, promoters, and the path from interest to entry." },
  { icon: CheckCircle2, label: "Prove turnout", text: "Turn check-ins and participation into a trusted record." },
  { icon: BarChart3, label: "Build the next one", text: "Read what moved, retain the audience, and repeat what worked." },
];

export default function OrganizerLanding() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title="Organizer Workspace - Promorang"
        description="Operate moments, check-ins, ticket movement, promoters, and repeat attendance from one connected workspace."
      />

      <section className="relative min-h-[680px] overflow-hidden border-b border-white/10 pt-20">
        <img src={cultureEvents[3].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,106,0,.22),transparent_30%),linear-gradient(90deg,#050505_5%,rgba(5,5,5,.92)_50%,rgba(5,5,5,.35))]" />
        <div className="container relative grid min-h-[600px] gap-10 px-6 py-16 lg:grid-cols-[1fr_390px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Operations layer</p>
            <h1 className="mt-5 max-w-4xl text-6xl font-black uppercase leading-[0.82] tracking-[-0.075em] md:text-8xl">
              Run the room.<br /><span className="text-primary">Keep the momentum.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              Promorang connects the work before doors open, the proof created while people are there, and the audience that returns after the night ends.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/organizer/events" className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                Open your workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/create/moment" className="rounded-xl border border-white/20 bg-black/35 px-5 py-3 text-sm font-black">
                Create a moment
              </Link>
            </div>
          </div>

          <div className="border-l border-primary/50 bg-black/60 p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">One operating view</p>
            <div className="mt-6 space-y-5">
              {[
                ["Tonight", cultureEvents[0].shortTitle],
                ["People moving", cultureEvents[0].attending],
                ["Proof layer", cultureEvents[0].proof],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="mt-1 text-xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Production & Syndicate Breakeven Simulator */}
      <section className="container px-6 py-12">
        <HostSyndicateSimulator />
      </section>

      <section className="container px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">From listing to legacy</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">Operations should strengthen the culture—not bury it.</h2>
            <p className="mt-4 leading-7 text-white/55">A connected workflow for organizers, venues, hosts, and teams who need the room and the numbers to tell the same story.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {operatingLoop.map((item, index) => (
              <div key={item.label} className="bg-[#111] p-6">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-black text-white/25">0{index + 1}</span>
                </div>
                <h3 className="mt-10 text-2xl font-black">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <img src={cultureEvents[1].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55" />
          <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div>
              <Users className="h-7 w-7 text-primary" />
              <h2 className="mt-5 max-w-2xl text-4xl font-black">See who showed up—and give them a reason to return.</h2>
            </div>
            <Link to="/organizer/events" className="inline-flex shrink-0 items-center gap-2 font-black text-primary">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
