import { RoleWorkspaceTabs } from "@/components/dashboard/RoleWorkspaceTabs";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { useRoleWorkspaceTab } from "@/hooks/useRoleWorkspaceTab";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { Calendar, Handshake, Radio, ShieldCheck, BarChart3, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useHostedMoments } from "@/hooks/useMoments";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import HostMomentsStagingConsole from "@/components/host/HostMomentsStagingConsole";
import HostDoorBoardLauncher from "@/components/host/HostDoorBoardLauncher";
import HostProofReviewConsole from "@/components/host/HostProofReviewConsole";
import HostSponsorshipConsole from "@/components/host/HostSponsorshipConsole";
import HostImpactYieldConsole from "@/components/host/HostImpactYieldConsole";

export function HostDashboardV2() {
  const { t: webT } = useWebI18n();
  const { data: hostedMoments, isLoading: momentsLoading, isError: momentsError } = useHostedMoments();
  const { activeTab, setActiveTab: handleTabChange } = useRoleWorkspaceTab("moments", ["demand", "moments", "pulse", "review", "sponsorships", "impact"]);


  const momentCount = hostedMoments?.length || 0;
  const tabs = [
    { id: "demand", label: "Audience demand", hint: "What people want to do", icon: Vote, count: "Listen" },
    {
      id: "moments",
      label: webT("findOrAsk.moments"),
      hint: "Create and manage experiences",
      icon: Calendar,
      count: momentsLoading ? "Checking" : `${momentCount} ${momentCount === 1 ? "Moment" : "Moments"}`,
    },
    { id: "pulse", label: "Live arrivals", hint: "Open the Door Board", icon: Radio, count: "Operate" },
    { id: "review", label: webT("hostDash.proofReview"), hint: "Verify participation", icon: ShieldCheck, count: "Review" },
    { id: "sponsorships", label: webT("pricing.lineSponsorsPayer"), hint: "Brand support for Moments", icon: Handshake, count: "Manage" },
    { id: "impact", label: webT("lens.agency.activity"), hint: "Attendance and return", icon: BarChart3, count: "Learn" },
  ];

  return (
    <div data-role-workspace="host" className="dark min-w-0 space-y-6 pb-16 text-white">
      <DashboardHero badge="Host workspace" title="Manage your next event." description="Create experiences, operate arrivals and review participation." actions={[]} />
      <p className="text-sm text-white/65" role="status">{momentsLoading ? webT("common.loading") : momentsError ? "Event count unavailable" : `${momentCount} ${momentCount === 1 ? "Moment" : "Moments"}`}</p>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <RoleWorkspaceTabs label="Host workspace" items={tabs} />
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
