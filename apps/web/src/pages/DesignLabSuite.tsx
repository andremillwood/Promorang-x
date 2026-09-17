import { resolveMomentJourney } from "@promorang/shared";
import { ParticipantProofArtifact } from "@/components/proof/ParticipantProofArtifact";
import { Link } from "react-router-dom";
import DesignLab from "@/pages/DesignLab";
import { CanonicalConsumerScreensV2 } from "@/design-system/consumer/CanonicalConsumerScreensV2";
import { CanonicalYouScreen } from "@/design-system/consumer/CanonicalYouScreen";
import { CrossDomainStressTest } from "@/design-system/consumer/CrossDomainStressTest";
import { WorldClassConsumerStudy } from "@/design-system/consumer/WorldClassConsumerStudy";
import { WorldClassConsumerStudyV2 } from "@/design-system/consumer/WorldClassConsumerStudyV2";
import { PromorangBrandGrammarStudyV2 } from "@/design-system/consumer/PromorangBrandGrammarStudyV2";
import { PromorangBrandGrammarFinal } from "@/design-system/consumer/PromorangBrandGrammarFinal";

const GOVERNANCE = [
  { object: "Discovery", family: "World · editorial signal", route: "/discover", truth: "Proposal ≠ approval · vote ≠ attendance" },
  { object: "Scene", family: "World · place / context", route: "/scenes", truth: "Membership ≠ attendance · Scene ≠ Moment" },
  { object: "Moment", family: "World · cinematic invitation", route: "/discover?tab=moments", truth: "RSVP ≠ attendance" },
  { object: "PromoCard", family: "Object · credential", route: "/card", truth: "Entitlement ≠ redeemed" },
  { object: "Proof", family: "Object · evidence artifact", route: "/dashboard", truth: "Submission ≠ approval" },
  { object: "Piece / Memory", family: "Object · retained artifact", route: "/vault", truth: "Memory ≠ financial asset" },
  { object: "Return", family: "World + Object · consequence", route: "/dashboard", truth: "Intended ≠ issued" },
];

function CanonicalProductionBridge() {
  return (
    <section className="mt-20 border-y border-white/10 py-16" aria-labelledby="canonical-production-bridge">
      <div className="grid gap-8 xl:grid-cols-[.72fr_1.28fr] xl:items-start">
        <div className="xl:sticky xl:top-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">07 · Design governance</p>
          <h2 id="canonical-production-bridge" className="mt-4 max-w-xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-6xl">
            The lab is not a parallel product.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
            Canonical truth defines what the object is. Design Lab defines how it can feel. The role lens decides emphasis. Production composes the object into the journey without inventing a new state.
          </p>
          <div className="mt-8 border-l border-[#f6d48a]/35 pl-5">
            <p className="font-serif text-xl font-bold text-[#f6d48a]">Canonical meaning → Lab expression → Role lens → Production journey</p>
            <p className="mt-2 text-xs leading-5 text-white/35">ONE MOVE · OBJECTS &gt; CARDS · WORLD &gt; DASHBOARD · UTILITY IS QUIET</p>
          </div>
        </div>

        <div className="border-t border-white/10">
          {GOVERNANCE.map((item, index) => (
            <article key={item.object} className="group grid gap-3 border-b border-white/10 py-6 sm:grid-cols-[44px_1fr_1fr] sm:gap-5">
              <span className="font-mono text-xs text-white/25">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-serif text-2xl font-bold text-white">{item.object}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#f6d48a]/70">{item.family}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs leading-5 text-white/40">{item.truth}</p>
                <Link to={item.route} className="mt-2 inline-flex min-h-9 items-center text-sm font-bold text-primary transition group-hover:translate-x-1">
                  Inspect production →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DesignLabSuite() {
  return (
    <div className="dark min-h-screen bg-[#0b0b0c] text-white selection:bg-primary selection:text-black">
      <DesignLab />
      <section className="mx-auto max-w-[1800px] border-t border-white/10 px-5 pb-32 pt-20 sm:px-8 lg:px-12">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">06 · Canonical consumer screens · iteration 02</p>
            <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">
              Make the world different from the objects.
            </h2>
          </div>
          <div className="border-l border-primary/35 pl-5">
            <p className="font-serif text-2xl font-bold text-[#f6d48a]">Today → Discover → Card → Vault → You</p>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Iteration 02 deliberately removes repeated dark-card composition. World surfaces are spatial and editorial; owned things retain object-specific material; utility stays quiet.
            </p>
          </div>
        </div>

        <CanonicalConsumerScreensV2 />
        <CanonicalProductionBridge />
        <section className="mt-16 border-t border-white/10 pt-10" aria-labelledby="proof-state-study">
          <p className="pr-world-kicker">Production component · illustrative states only</p>
          <h2 id="proof-state-study" className="mt-4 font-serif text-4xl font-bold">A claim is not a decision.</h2>
          <p className="mt-4 max-w-2xl text-sm text-white/60">The same participant evidence component used in Moment and check-in. These fixtures are for visual review only; they do not represent live participation.</p>
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">{(["pending", "verified", "rejected"] as const).map((proof_state) => <ParticipantProofArtifact key={proof_state} showAction={false} journey={resolveMomentJourney({ moment_id: "design-lab-example", proof_state, joined_at: "2026-09-17", proof_submission_id: `ILLUSTRATIVE-${proof_state}` })} />)}</div>
        </section>

        <div className="mt-16 border-t border-white/10 pt-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">05 · You</p>
            <h3 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-white">Identity without turning the user into a dashboard.</h3>
            <p className="mt-4 text-sm leading-6 text-white/45">Belonging, verified participation, and account utility are visible; configuration and vanity metrics stay quiet.</p>
          </div>
          <CanonicalYouScreen />
        </div>

        <div className="mt-20"><CrossDomainStressTest /></div>
        <div className="mt-20"><WorldClassConsumerStudy /></div>
        <div className="mt-20"><WorldClassConsumerStudyV2 /></div>
        <div className="mt-20"><PromorangBrandGrammarStudyV2 /></div>
        <div className="mt-20"><PromorangBrandGrammarFinal /></div>
      </section>
    </div>
  );
}
