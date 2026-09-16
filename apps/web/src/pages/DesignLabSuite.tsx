import DesignLab from "@/pages/DesignLab";
import { CanonicalConsumerScreensV2 } from "@/design-system/consumer/CanonicalConsumerScreensV2";
import { CanonicalYouScreen } from "@/design-system/consumer/CanonicalYouScreen";
import { CrossDomainStressTest } from "@/design-system/consumer/CrossDomainStressTest";

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

        <div className="mt-16 border-t border-white/10 pt-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">05 · You</p>
            <h3 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-white">Identity without turning the user into a dashboard.</h3>
            <p className="mt-4 text-sm leading-6 text-white/45">Belonging, verified participation, and account utility are visible; configuration and vanity metrics stay quiet.</p>
          </div>
          <CanonicalYouScreen />
        </div>

        <div className="mt-20">
          <CrossDomainStressTest />
        </div>
      </section>
    </div>
  );
}
