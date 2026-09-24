import { ArrowRight, BadgeDollarSign, CheckCircle2, Gift, KeyRound, Megaphone, Share2, Sparkles, Target, Ticket, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import cookingClass from "@/assets/moments/cooking-class.jpg";
import concert from "@/assets/moment-concert.jpg";
import boardGames from "@/assets/moments/board-games.jpg";
import openMic from "@/assets/moments/open-mic.jpg";
import streetArt from "@/assets/moments/street-art.jpg";

type ParticipationEconomyProps = {
  variant?: "public" | "participant" | "operator" | "card";
  points?: number | null;
  promoKeys?: number | null;
  className?: string;
};

const stages = [
  { label: "DESIRE", title: "What do you want?", copy: "Taste, Wants and the things you keep close tell PROMORANG what matters.", icon: Sparkles },
  { label: "MOTIVATION", title: "What would move you?", copy: "Access, a complimentary extra, savings, Points, a Key, a paid Gig or a special experience can change the decision.", icon: Gift },
  { label: "OPPORTUNITY", title: "What can you do?", copy: "Offers, Moments, Challenges, Gigs and Content Drops turn interest into a real next move.", icon: Target },
  { label: "ACTION", title: "What did you actually do?", copy: "Claim, reserve, visit, attend, create, distribute, buy or complete—with proof where the opportunity requires it.", icon: CheckCircle2 },
  { label: "DISTRIBUTION", title: "What can you help move?", copy: "Share, refer, remix or distribute things worth spreading. PROMORANG can attribute the movement when the path is real.", icon: Share2 },
];

const opportunityTypes = [
  { label: "Challenges", copy: "Structured objectives with progress, proof and a clear completion state.", href: "/earn?kind=challenge", image: boardGames, icon: Trophy },
  { label: "Gigs", copy: "Limited compensated work with a deliverable, deadline and proof.", href: "/earn?kind=gig", image: openMic, icon: BadgeDollarSign },
  { label: "Content Drops", copy: "Content released for people to watch, share, remix, distribute or act on.", href: "/content-drops", image: concert, icon: Megaphone },
  { label: "Offers", copy: "Real value that can be claimed or used under clear terms.", href: "/discover?tab=perks", image: cookingClass, icon: Gift },
  { label: "Moments", copy: "Things happening at a real time and place that people can choose to join.", href: "/discover?tab=moments", image: streetArt, icon: Ticket },
];

const createTypes = [
  { label: "Create Challenge", copy: "Set the objective, proof, participant value and completion rules.", href: "/create/campaign?participation=challenge", icon: Trophy },
  { label: "Create Gig", copy: "Define paid work, deliverables, eligibility, slots and proof.", href: "/create/campaign?participation=gig", icon: BadgeDollarSign },
  { label: "Publish Content Drop", copy: "Release content with a distribution objective, attribution and rewards.", href: "/content-drops?tab=create", icon: Megaphone },
  { label: "Open an Offer", copy: "Make real inventory or access available under clear terms.", href: "/give", icon: Gift },
  { label: "Create a Moment", copy: "Give people a real time, place and reason to show up.", href: "/create/moment", icon: Users },
];

export function ParticipationEconomy({ variant = "public", points = null, promoKeys = null, className = "" }: ParticipationEconomyProps) {
  const operator = variant === "operator";
  const compact = variant === "card";

  return (
    <section className={className || (compact ? "" : "border-b border-white/10 bg-[#070707] px-5 py-14 text-white sm:px-6 md:py-20")}>
      <div className={compact ? "" : "mx-auto max-w-[1440px]"}>
        <div className={compact ? "" : "grid gap-8 xl:grid-cols-[.7fr_1.3fr] xl:items-end"}>
          <div>
            <p className="marketing-kicker">Participation economy</p>
            <h2 className={compact ? "font-serif text-3xl font-bold tracking-[-0.04em] text-white" : "mt-3 max-w-4xl text-4xl font-black sm:text-5xl"}>
              Desire + Motivation + Opportunity + Action + Distribution.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              PROMORANG is not just a place to claim Offers. It learns what people want, what makes action worthwhile, what they can participate in, what they actually did, and how they helped something move.
            </p>
          </div>

          {!compact ? (
            <div className="grid gap-px overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-5">
              {stages.map((stage) => (
                <div key={stage.label} className="bg-[#0d0d0d] p-5">
                  <stage.icon className="h-5 w-5 text-orange-400" />
                  <p className="mt-5 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-orange-300">{stage.label}</p>
                  <h3 className="mt-2 text-sm font-black text-white">{stage.title}</h3>
                  <p className="mt-2 text-[11px] leading-5 text-white/42">{stage.copy}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className={compact ? "mt-6 grid gap-3 sm:grid-cols-2" : "mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5"}>
          {(operator ? createTypes : opportunityTypes).map((item) => (
            <Link key={item.label} to={item.href} className="group relative min-h-[220px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035]">
              {!operator && "image" in item ? <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
              <div className="relative flex min-h-[220px] flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-orange-300" />
                  <ArrowRight className="h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">{item.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/52">{item.copy}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={compact ? "mt-6 grid gap-3 sm:grid-cols-2" : "mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-4"}>
          <Link to="/wallet" className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">PromoPoints</p><p className="mt-2 font-serif text-3xl font-bold text-white">{points == null ? "Earned by participation" : points.toLocaleString()}</p></div>
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">Points mark useful participation and progression. They are not cash. Verified actions should matter more than empty clicks.</p>
          </Link>

          <Link to="/wallet" className="rounded-[1.4rem] border border-orange-300/20 bg-orange-300/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">PromoKeys</p><p className="mt-2 font-serif text-3xl font-bold text-white">{promoKeys == null ? "Access that opens something" : promoKeys.toLocaleString()}</p></div>
              <KeyRound className="h-6 w-6 text-orange-300" />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">A Key should mean something concrete: this person has the right to unlock or pursue a gated opportunity.</p>
          </Link>

          <Link to="/earn" className="rounded-[1.4rem] border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">Master Key</p><p className="mt-2 font-serif text-3xl font-bold text-white">Unlock earning access</p></div>
              <BadgeDollarSign className="h-6 w-6 text-emerald-300" />
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">Build a verified participation record first. The Master Key is the gate into funded Gigs, Drops and earning opportunities—not a promise that every action pays.</p>
          </Link>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">How value circulates</p>
            <p className="mt-2 font-serif text-2xl font-bold text-white">Move → prove → earn → unlock → spread → return.</p>
            <p className="mt-3 text-xs leading-5 text-white/45">A Move can award Points. Points build participation proof and can progress toward Keys. Keys open gated access. The Master Key gates funded earning opportunities. Content Drops spread what is worth moving, and PromoCard keeps the relationship connected.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ParticipationEconomy;
