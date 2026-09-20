import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Handshake, Radio, ShieldCheck, BarChart3, Vote, Plus } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useHostedMoments } from "@/hooks/useMoments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import HostMomentsStagingConsole from "@/components/host/HostMomentsStagingConsole";
import HostDoorBoardLauncher from "@/components/host/HostDoorBoardLauncher";
import HostProofReviewConsole from "@/components/host/HostProofReviewConsole";
import HostSponsorshipConsole from "@/components/host/HostSponsorshipConsole";
import HostImpactYieldConsole from "@/components/host/HostImpactYieldConsole";
import { CommerceResponsibilityMap } from "@/components/business/CommerceResponsibilityMap";

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
    { id: "demand", label: "Audience demand", hint: "What people want to do", icon: Vote, count: "Listen" },
    {
      id: "moments",
      label: "Moments",
      hint: "Create and manage experiences",
      icon: Calendar,
      count: momentsLoading ? "Checking" : `${momentCount} ${momentCount === 1 ? "Moment" : "Moments"}`,
    },
    { id: "pulse", label: "Live arrivals", hint: "Open the Door Board", icon: Radio, count: "Operate" },
    { id: "review", label: "Proof review", hint: "Verify participation", icon: ShieldCheck, count: "Review" },
    { id: "sponsorships", label: "Sponsors", hint: "Brand support for Moments", icon: Handshake, count: "Manage" },
    { id: "impact", label: "Results", hint: "Attendance and return", icon: BarChart3, count: "Learn" },
  ];

  return (
    <div className="space-y-6 pb-16 text-white animate-in fade-in-50 duration-300">
      <CommerceResponsibilityMap highlight="host" compact />
      <section className="rounded-3xl border border-amber-500/20 bg-amber-950/15 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Host tools</p>
            <h2 className="mt-2 text-2xl font-black text-white">Fill it. Run it. Prove who came.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              Build a Moment, bring the right people in, operate arrivals from the real Door Board, verify participation, then use the evidence to improve the next one.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-amber-400 font-black text-black hover:bg-amber-300">
            <Link to="/create/moment">
              <Plus className="mr-2 h-4 w-4" />
              Create a Moment
            </Link>
          </Button>
        </div>
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
                  ? "border-amber-400 bg-amber-950/35 ring-1 ring-amber-400/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-2xl p-2 ${isActive ? "bg-amber-400 text-black" : "bg-white/5 text-amber-400"}`}>
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
          <TabsTrigger value="moments">Moments</TabsTrigger>
          <TabsTrigger value="pulse">Live arrivals</TabsTrigger>
          <TabsTrigger value="review">Proof review</TabsTrigger>
          <TabsTrigger value="sponsorships">Sponsors</TabsTrigger>
          <TabsTrigger value="impact">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="host" /></TabsContent>
        <TabsContent value="moments" className="mt-0"><HostMomentsStagingConsole /></TabsContent>
        <TabsContent value="pulse" className="mt-0"><HostDoorBoardLauncher /></TabsContent>
        <TabsContent value="review" className="mt-0"><HostProofReviewConsole /></TabsContent>
        <TabsContent value="sponsorships" className="mt-0"><HostSponsorshipConsole /></TabsContent>
        <TabsContent value="impact" className="mt-0"><HostImpactYieldConsole /></TabsContent>
      </Tabs>
    </div>
  );
}

export default HostDashboardV2;
