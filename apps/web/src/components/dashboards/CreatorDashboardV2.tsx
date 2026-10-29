import { RoleWorkspaceTabs } from "@/components/dashboard/RoleWorkspaceTabs";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { useRoleWorkspaceTab } from "@/hooks/useRoleWorkspaceTab";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { Award, Coins, FileCheck2, Film, Link2, Target, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import CreatorReleaseWorkspaceBridge from "@/components/creator/CreatorReleaseWorkspaceBridge";
import CreatorAttributionMap from "@/components/creator/CreatorAttributionMap";
import CreatorEarningsVault from "@/components/creator/CreatorEarningsVault";
import CreatorReputationDeck from "@/components/creator/CreatorReputationDeck";
import CreatorProofDossier from "@/components/creator/CreatorProofDossier";
import openMic from "@/assets/moments/open-mic.jpg";

export function CreatorDashboardV2() {
  const { t: webT } = useWebI18n();
  const { activeTab, setActiveTab: handleTabChange } = useRoleWorkspaceTab("missions", ["demand", "missions", "studio", "proof", "attribution", "earnings", "reputation"]);


  const tabs = [
    { id: "demand", label: "Audience demand", hint: "What people are asking for", icon: Vote },
    { id: "missions", label: webT("people.opportunities"), hint: "Real release work", icon: Target },
    { id: "studio", label: "Create & submit", hint: "Publish through the release workspace", icon: Film },
    { id: "proof", label: "Proof dossier", hint: "Release → attribution → value", icon: FileCheck2 },
    { id: "attribution", label: "Attributed actions", hint: "What your work caused", icon: Link2 },
    { id: "earnings", label: webT("promoPushCreatorPage.statEarnings"), hint: "Approved and settled value", icon: Coins },
    { id: "reputation", label: webT("hosts.reputation"), hint: "What your proven work unlocks", icon: Award },
  ];

  return (
    <div data-role-workspace="creator" className="dark min-w-0 space-y-6 pb-16 text-white">
      <DashboardHero badge="Creator workspace" title="Publish work. Track what it moves." description="Manage releases, submit proof and review attributed actions and earnings." imageSrc={openMic} actions={[{ label: "Create & submit", onClick: () => handleTabChange("studio"), icon: Film }]} />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <RoleWorkspaceTabs label="Creator workspace" items={tabs} />
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
