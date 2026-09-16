import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Award, Coins, Film, Link2, Target, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CreatorReleaseWorkspaceBridge from "@/components/creator/CreatorReleaseWorkspaceBridge";
import CreatorAttributionMap from "@/components/creator/CreatorAttributionMap";
import CreatorEarningsVault from "@/components/creator/CreatorEarningsVault";
import CreatorReputationDeck from "@/components/creator/CreatorReputationDeck";

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
    { id: "demand", label: "Audience demand", hint: "What people are asking for", icon: Vote, count: "Listen" },
    { id: "missions", label: "Opportunities", hint: "Real release work", icon: Target, count: "Choose" },
    { id: "studio", label: "Create & submit", hint: "Publish through the release workspace", icon: Film, count: "Create" },
    { id: "attribution", label: "Attributed actions", hint: "What your work caused", icon: Link2, count: "Prove" },
    { id: "earnings", label: "Earnings", hint: "Approved rewards and value", icon: Coins, count: "Review" },
    { id: "reputation", label: "Reputation", hint: "What your proven work unlocks", icon: Award, count: "Build" },
  ];

  return (
    <div className="space-y-6 pb-16 text-white animate-in fade-in-50 duration-300">
      <section className="rounded-3xl border border-purple-500/20 bg-purple-950/15 p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Creator tools</p>
        <h2 className="mt-2 text-2xl font-black text-white">Choose useful work, publish through the real workspace, prove the result.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
          PROMORANG should help you find real work and operate it clearly. The primary Creator path now uses live release records instead of sample bounty and portfolio data.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex min-h-[112px] flex-col justify-between rounded-3xl border p-4 text-left transition ${
                isActive
                  ? "border-purple-500 bg-purple-950/35 ring-1 ring-purple-500/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-2xl p-2 ${isActive ? "bg-purple-500 text-white" : "bg-white/5 text-purple-400"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50">{tab.count}</span>
              </div>
              <div>
                <h3 className="text-xs font-black text-white">{tab.label}</h3>
                <p className="mt-0.5 text-[10px] text-white/50">{tab.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="sr-only">
          <TabsTrigger value="demand">Demand</TabsTrigger>
          <TabsTrigger value="missions">Opportunities</TabsTrigger>
          <TabsTrigger value="studio">Create</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
        </TabsList>
        <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="creator" /></TabsContent>
        <TabsContent value="missions" className="mt-0"><CreatorReleaseWorkspaceBridge mode="work" /></TabsContent>
        <TabsContent value="studio" className="mt-0"><CreatorReleaseWorkspaceBridge mode="create" /></TabsContent>
        <TabsContent value="attribution" className="mt-0"><CreatorAttributionMap /></TabsContent>
        <TabsContent value="earnings" className="mt-0"><CreatorEarningsVault /></TabsContent>
        <TabsContent value="reputation" className="mt-0"><CreatorReputationDeck /></TabsContent>
      </Tabs>
    </div>
  );
}

export default CreatorDashboardV2;
