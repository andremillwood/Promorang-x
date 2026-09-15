import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Award, Coins, Film, Link2, Target, Vote, ArrowRight } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NextMove,
  OutcomeProgress,
  PageLead,
} from "@/components/promorang-v2";

import CreatorStudioConsole from "@/components/creator/CreatorStudioConsole";
import CreatorMissionsHub from "@/components/creator/CreatorMissionsHub";
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
    { id: "missions", label: "Opportunities", hint: "Work worth taking", icon: Target },
    { id: "studio", label: "Current work", hint: "Create and submit", icon: Film },
    { id: "attribution", label: "Results", hint: "What your work caused", icon: Link2 },
    { id: "earnings", label: "Earnings", hint: "Approved value", icon: Coins },
    { id: "demand", label: "Audience demand", hint: "What people are asking for", icon: Vote },
    { id: "reputation", label: "Reputation", hint: "What proven work unlocks", icon: Award },
  ];

  const stages = [
    { id: "choose", label: "Choose useful work", status: "current" as const },
    { id: "create", label: "Create / get approved", status: "upcoming" as const },
    { id: "action", label: "Cause verified action", status: "upcoming" as const },
    { id: "settle", label: "Settle value", status: "upcoming" as const },
    { id: "repeat", label: "Earn stronger repeat work", status: "upcoming" as const },
  ];

  return (
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)] pb-16" data-role="creator">
      <div className="pr-v2-page space-y-8 py-2 sm:py-4">
        <PageLead
          eyebrow="Creator · Home"
          title="Useful work first."
          description="Choose an opportunity, deliver the work, prove the action it caused, then settle the value. Creator tools stay secondary to that sequence."
        />

        <NextMove
          title="Choose one opportunity worth taking."
          description="PROMORANG should not ask you to manage a creator toolbox before there is useful work to do."
          action={
            <button
              type="button"
              onClick={() => handleTabChange("missions")}
              className="pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-white"
            >
              View opportunities <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          }
        />

        <OutcomeProgress stages={stages} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="flex h-auto w-full gap-1 overflow-x-auto rounded-[var(--pr-v2-radius-surface)] border border-white/10 bg-white/[0.02] p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="min-h-11 shrink-0 gap-2 rounded-[var(--pr-v2-radius-control)] px-3 text-xs text-[hsl(var(--pr-v2-text-2))] data-[state=active]:bg-[hsl(var(--pr-v2-active-role)/0.14)] data-[state=active]:text-[hsl(var(--pr-v2-text-1))]"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="border-t border-white/10 pt-5">
            <p className="mb-4 text-xs text-[hsl(var(--pr-v2-text-3))]">
              {tabs.find((tab) => tab.id === activeTab)?.hint}
            </p>
            <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="creator" /></TabsContent>
            <TabsContent value="missions" className="mt-0"><CreatorMissionsHub /></TabsContent>
            <TabsContent value="studio" className="mt-0"><CreatorStudioConsole /></TabsContent>
            <TabsContent value="attribution" className="mt-0"><CreatorAttributionMap /></TabsContent>
            <TabsContent value="earnings" className="mt-0"><CreatorEarningsVault /></TabsContent>
            <TabsContent value="reputation" className="mt-0"><CreatorReputationDeck /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default CreatorDashboardV2;