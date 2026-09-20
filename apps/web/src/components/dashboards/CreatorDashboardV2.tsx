import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Award, Coins, FileCheck2, Film, Link2, Target, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CreatorReleaseWorkspaceBridge from "@/components/creator/CreatorReleaseWorkspaceBridge";
import CreatorAttributionMap from "@/components/creator/CreatorAttributionMap";
import CreatorEarningsVault from "@/components/creator/CreatorEarningsVault";
import CreatorReputationDeck from "@/components/creator/CreatorReputationDeck";
import CreatorProofDossier from "@/components/creator/CreatorProofDossier";
import openMic from "@/assets/moments/open-mic.jpg";
import { CommerceResponsibilityMap } from "@/components/business/CommerceResponsibilityMap";

export function CreatorDashboardV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "missions";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab) setActiveTab(requestedTab);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("tab", value);
      return next;
    });
  };

  const tabs = [
    { id: "demand", label: "Audience demand", hint: "What people are asking for", icon: Vote, action: "Listen" },
    { id: "missions", label: "Opportunities", hint: "Real release work", icon: Target, action: "Choose" },
    { id: "studio", label: "Create & submit", hint: "Publish through the release workspace", icon: Film, action: "Create" },
    { id: "proof", label: "Proof dossier", hint: "Release → attribution → value", icon: FileCheck2, action: "Defend" },
    { id: "attribution", label: "Attributed actions", hint: "What your work caused", icon: Link2, action: "Prove" },
    { id: "earnings", label: "Earnings", hint: "Approved and settled value", icon: Coins, action: "Review" },
    { id: "reputation", label: "Reputation", hint: "What your proven work unlocks", icon: Award, action: "Build" },
  ];
  const active = tabs.find((tab) => tab.id === activeTab) || tabs[1];

  return (
    <div className="space-y-8 pb-16 text-white animate-in fade-in-50 duration-300">
      <CommerceResponsibilityMap highlight="creator" compact />
      <section className="group relative min-h-[420px] overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
        <img src={openMic} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-[1.015]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.84)_52%,rgba(0,0,0,.38)_100%),linear-gradient(0deg,rgba(0,0,0,.94),transparent_62%)]" />
        <div className="relative z-10 flex min-h-[420px] max-w-[760px] flex-col justify-between p-6 sm:p-9 lg:p-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#ff7a35]">Creator workspace · release → proof → value</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Your work should move something real. PROMORANG keeps release, attribution, verification, earning and settlement distinct.</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-white/45">Your move now</p>
            <h2 className="mt-3 max-w-2xl font-['Anton'] text-[3.3rem] font-normal uppercase leading-[.9] tracking-[-.03em] text-white sm:text-[4.5rem]">{active.label}</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">{active.hint}</p>
            <button type="button" onClick={() => handleTabChange(active.id)} className="mt-6 inline-flex min-h-12 items-center gap-8 rounded-md bg-[#ff6500] px-5 text-sm font-black text-black transition hover:bg-[#ff7a20]">
              {active.action} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="creator-work-rail">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-white/35">Creator operating rail</p><h2 id="creator-work-rail" className="mt-2 font-serif text-3xl font-bold tracking-[-.04em]">What needs you.</h2></div>
          <p className="hidden max-w-[260px] text-xs leading-5 text-white/35 sm:block">One chain, different strengths of truth.</p>
        </div>
        <div className="pr-scroll-rail mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className={`group min-h-[170px] w-[220px] shrink-0 snap-start rounded-xl border p-5 text-left transition ${isActive ? "border-[#ff6500]/55 bg-[#ff6500]/10" : "border-white/10 bg-white/[.025] hover:border-white/20 hover:bg-white/[.045]"}`}>
                <div className="flex items-center justify-between"><Icon className={`h-5 w-5 ${isActive ? "text-[#ff7a35]" : "text-white/45"}`} /><span className="text-[9px] font-black uppercase tracking-[.15em] text-white/30">{tab.action}</span></div>
                <h3 className="mt-10 font-serif text-xl font-bold leading-tight text-white">{tab.label}</h3>
                <p className="mt-2 text-[11px] leading-5 text-white/42">{tab.hint}</p>
              </button>
            );
          })}
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="sr-only">
          <TabsTrigger value="demand">Demand</TabsTrigger><TabsTrigger value="missions">Opportunities</TabsTrigger><TabsTrigger value="studio">Create</TabsTrigger><TabsTrigger value="proof">Proof dossier</TabsTrigger><TabsTrigger value="attribution">Attribution</TabsTrigger><TabsTrigger value="earnings">Earnings</TabsTrigger><TabsTrigger value="reputation">Reputation</TabsTrigger>
        </TabsList>
        <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="creator" /></TabsContent>
        <TabsContent value="missions" className="mt-0"><CreatorReleaseWorkspaceBridge mode="work" /></TabsContent>
        <TabsContent value="studio" className="mt-0"><CreatorReleaseWorkspaceBridge mode="create" /></TabsContent>
        <TabsContent value="proof" className="mt-0"><CreatorProofDossier /></TabsContent>
        <TabsContent value="attribution" className="mt-0"><CreatorAttributionMap /></TabsContent>
        <TabsContent value="earnings" className="mt-0"><CreatorEarningsVault /></TabsContent>
        <TabsContent value="reputation" className="mt-0"><CreatorReputationDeck /></TabsContent>
      </Tabs>
    </div>
  );
}

export default CreatorDashboardV2;