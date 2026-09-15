import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Handshake, Radio, ShieldCheck, BarChart3, Vote, Plus, ArrowRight } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useHostedMoments } from "@/hooks/useMoments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NextMove,
  OutcomeProgress,
  PageLead,
} from "@/components/promorang-v2";

import HostMomentsStagingConsole from "@/components/host/HostMomentsStagingConsole";
import HostLivePulseConsole from "@/components/host/HostLivePulseConsole";
import HostProofReviewConsole from "@/components/host/HostProofReviewConsole";
import HostSponsorshipConsole from "@/components/host/HostSponsorshipConsole";
import HostImpactYieldConsole from "@/components/host/HostImpactYieldConsole";

export function HostDashboardV2() {
  const { data: hostedMoments, isLoading: momentsLoading } = useHostedMoments();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "moments";
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

  const momentCount = hostedMoments?.length || 0;
  const tabs = [
    { id: "moments", label: "Moments", hint: "Create and manage experiences", icon: Calendar },
    { id: "pulse", label: "Live arrivals", hint: "Operate what is happening now", icon: Radio },
    { id: "review", label: "Proof review", hint: "Verify participation", icon: ShieldCheck },
    { id: "impact", label: "Results", hint: "Attendance and return", icon: BarChart3 },
    { id: "demand", label: "Audience demand", hint: "What people want to do", icon: Vote },
    { id: "sponsorships", label: "Partners", hint: "Brand support after proof", icon: Handshake },
  ];

  const stages = [
    { id: "create", label: "Create Moment", status: momentCount > 0 ? "complete" as const : "current" as const },
    { id: "fill", label: "Fill it", status: momentCount > 0 ? "current" as const : "upcoming" as const },
    { id: "operate", label: "Run it", status: "upcoming" as const },
    { id: "verify", label: "Verify attendance", status: "upcoming" as const },
    { id: "return", label: "Bring people back", status: "upcoming" as const },
    { id: "partner", label: "Prove value to partners", status: "upcoming" as const },
  ];

  return (
    <div className="pr-v2-role-accent pr-v2-canvas rounded-[var(--pr-v2-radius-module)] pb-16" data-role="host">
      <div className="pr-v2-page space-y-8 py-2 sm:py-4">
        <PageLead
          eyebrow="Host · Home"
          title="Fill it. Run it. Prove who came."
          description="The Host workspace should follow the Moment lifecycle rather than present every operations tool with equal weight."
          action={
            <Link
              to="/create/moment"
              className="pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Create Moment
            </Link>
          }
        />

        <NextMove
          title={momentCount > 0 ? "Open the Moment that needs you now." : "Create your first Moment."}
          description={momentCount > 0
            ? "A hosted Moment exists, so the next safe assumption is to return to your Moment list. PROMORANG will not claim attendance, fill rate or repeat behavior until those facts are actually available."
            : "Start with one real experience. Audience, arrival, proof and partner tools become useful only after there is a Moment to operate."}
          reason={momentsLoading ? "Checking your hosted Moments…" : `${momentCount} hosted ${momentCount === 1 ? "Moment" : "Moments"} found.`}
          action={
            momentCount > 0 ? (
              <button
                type="button"
                onClick={() => handleTabChange("moments")}
                className="pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black"
              >
                Open Moments <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                to="/create/moment"
                className="pr-v2-focusable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-active-role))] px-5 text-sm font-bold text-black"
              >
                Create Moment <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )
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
            <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="host" /></TabsContent>
            <TabsContent value="moments" className="mt-0"><HostMomentsStagingConsole /></TabsContent>
            <TabsContent value="pulse" className="mt-0"><HostLivePulseConsole /></TabsContent>
            <TabsContent value="review" className="mt-0"><HostProofReviewConsole /></TabsContent>
            <TabsContent value="sponsorships" className="mt-0"><HostSponsorshipConsole /></TabsContent>
            <TabsContent value="impact" className="mt-0"><HostImpactYieldConsole /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default HostDashboardV2;