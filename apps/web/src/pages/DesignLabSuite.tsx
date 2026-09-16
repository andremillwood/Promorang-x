import DesignLab from "@/pages/DesignLab";
import { CanonicalConsumerScreensV2 } from "@/design-system/consumer/CanonicalConsumerScreensV2";
import { CanonicalYouScreen } from "@/design-system/consumer/CanonicalYouScreen";
import { CrossDomainStressTest } from "@/design-system/consumer/CrossDomainStressTest";
import { WorldClassConsumerStudy } from "@/design-system/consumer/WorldClassConsumerStudy";
import { WorldClassConsumerStudyV2 } from "@/design-system/consumer/WorldClassConsumerStudyV2";
import { PromorangBrandGrammarStudyV2 } from "@/design-system/consumer/PromorangBrandGrammarStudyV2";
import { PromorangBrandGrammarFinal } from "@/design-system/consumer/PromorangBrandGrammarFinal";
import { PromorangEconomyLab } from "@/design-system/economy/PromorangEconomyLab";
import { PromorangEconomyLabV2 } from "@/design-system/economy/PromorangEconomyLabV2";
import { PromorangEconomyLabV3 } from "@/design-system/economy/PromorangEconomyLabV3";
import { PromorangEconomyLabV4 } from "@/design-system/economy/PromorangEconomyLabV4";
import { PromorangMarketplaceOpsV4 } from "@/design-system/economy/PromorangMarketplaceOpsV4";
import { StakeholderExperienceLab } from "@/design-system/stakeholders/StakeholderExperienceLab";
import { StakeholderLifecycleLab } from "@/design-system/stakeholders/StakeholderLifecycleLab";
import { StakeholderWorkflowProofLab } from "@/design-system/stakeholders/StakeholderWorkflowProofLab";
import { CrossRoleProofChainLab } from "@/design-system/stakeholders/CrossRoleProofChainLab";
import { StakeholderResilienceLab } from "@/design-system/stakeholders/StakeholderResilienceLab";
import { CanonicalEventGraphLab } from "@/design-system/stakeholders/CanonicalEventGraphLab";

export default function DesignLabSuite() {
  return (
    <div className="dark min-h-screen bg-[#0b0b0c] text-white selection:bg-primary selection:text-black">
      <DesignLab />
      <section className="mx-auto max-w-[1800px] border-t border-white/10 px-5 pb-32 pt-20 sm:px-8 lg:px-12">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_.55fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">06 · Canonical consumer screens · iteration 02</p>
            <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">Make the world different from the objects.</h2>
          </div>
          <div className="border-l border-primary/35 pl-5">
            <p className="font-serif text-2xl font-bold text-[#f6d48a]">Today → Discover → Card → Vault → You</p>
            <p className="mt-3 text-sm leading-6 text-white/45">Iteration 02 deliberately removes repeated dark-card composition. World surfaces are spatial and editorial; owned things retain object-specific material; utility stays quiet.</p>
          </div>
        </div>

        <CanonicalConsumerScreensV2 />

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

        <div className="mt-24">
          <div className="mb-16 grid gap-6 border-t border-white/10 pt-20 lg:grid-cols-[1fr_.52fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">PROMORANG economy · dedicated system design</p>
              <h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">The shell is not the product.</h2>
            </div>
            <div className="border-l border-primary/35 pl-5">
              <p className="font-serif text-2xl font-bold text-[#f6d48a]">Objects → states → trust → economics → return</p>
              <p className="mt-3 text-sm leading-6 text-white/45">The five persistent destinations stay simple. The systems underneath them get their own product and interaction language before any production-route convergence.</p>
            </div>
          </div>
          <PromorangEconomyLab />
          <div className="mt-32 border-t border-white/10 pt-24"><PromorangEconomyLabV2 /></div>
          <div className="mt-32 border-t border-white/10 pt-24">
            <div className="mb-16 grid gap-6 lg:grid-cols-[1fr_.52fr] lg:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">PROMORANG economy · material & artifact depth</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">Believable instruments, not beautiful panels.</h2></div><div className="border-l border-primary/35 pl-5"><p className="font-serif text-2xl font-bold text-[#f6d48a]">Material → edge → residue → consequence</p><p className="mt-3 text-sm leading-6 text-white/45">The receipt is the benchmark: every object should feel produced by a process, carry evidence of its state, and retain a believable trace of what happened.</p></div></div>
            <PromorangEconomyLabV3 />
          </div>
          <div className="mt-32 border-t border-white/10 pt-24">
            <div className="mb-16 grid gap-6 lg:grid-cols-[1fr_.52fr] lg:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">PROMORANG economy · operational artifacts</p><h2 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-[-0.055em] text-white md:text-7xl">Every mark should prove something happened.</h2></div><div className="border-l border-primary/35 pl-5"><p className="font-serif text-2xl font-bold text-[#f6d48a]">Identify → authenticate → time → record → transform</p><p className="mt-3 text-sm leading-6 text-white/45">V4 replaces theory rows with operating evidence: responders, serials, validation stamps, transfer residue, ticket locks, custody records and ledgers.</p></div></div>
            <PromorangEconomyLabV4 />
            <div className="mt-32"><PromorangMarketplaceOpsV4 /></div>
          </div>
          <div className="mt-40 border-t border-white/10 pt-24"><StakeholderExperienceLab /></div>
          <div className="mt-40 border-t border-white/10 pt-24"><StakeholderLifecycleLab /></div>
          <div className="mt-40 border-t border-white/10 pt-24"><StakeholderWorkflowProofLab /></div>
          <div className="mt-40 border-t border-white/10 pt-24"><CrossRoleProofChainLab /></div>
          <div className="mt-40 border-t border-white/10 pt-24"><StakeholderResilienceLab /></div>
          <div className="mt-40 border-t border-white/10 pt-24"><CanonicalEventGraphLab /></div>
        </div>
      </section>
    </div>
  );
}
