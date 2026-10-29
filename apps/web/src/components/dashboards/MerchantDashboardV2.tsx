import { useNavigate } from "react-router-dom";
import { RoleWorkspaceTabs } from "@/components/dashboard/RoleWorkspaceTabs";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { useRoleWorkspaceTab } from "@/hooks/useRoleWorkspaceTab";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { BarChart3, MapPin, QrCode, ShoppingBag, Store, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import MerchantScannerStation from "@/components/merchant/MerchantScannerStation";
import MerchantStorefrontConsole from "@/components/merchant/MerchantStorefrontConsole";
import { MerchantCommerceConsole } from "@/components/merchant/MerchantCommerceConsole";
import MerchantVenueStudio from "@/components/merchant/MerchantVenueStudio";
import MerchantYieldAnalytics from "@/components/merchant/MerchantYieldAnalytics";
import { BusinessOutcomeEntry } from "@/components/business/BusinessOutcomeEntry";
import coffeeCode from "@/assets/moments/coffee-code.jpg";

export function MerchantDashboardV2() {
  const { t: webT } = useWebI18n();
  const navigate = useNavigate();
  const { activeTab, setActiveTab: handleTabChange, searchParams } = useRoleWorkspaceTab("storefront", ["demand", "storefront", "redemptions", "commerce", "venues", "analytics"]);


  const tabs = [
    { id: "demand", label: "Customer demand", hint: "What people are asking for", icon: Vote },
    { id: "storefront", label: "Offers & products", hint: "What customers can actually act on", icon: Store },
    { id: "redemptions", label: "Verify actions", hint: "Claims and redemptions", icon: QrCode },
    { id: "commerce", label: webT("merchantDash.orders"), hint: "Payment, receipts and fulfillment", icon: ShoppingBag },
    { id: "venues", label: webT("findOrAsk.resultPlaces"), hint: "Where customers show up", icon: MapPin },
    { id: "analytics", label: webT("lens.agency.activity"), hint: "What the evidence says", icon: BarChart3 },
  ];

  return (
    <div data-role-workspace="merchant" className="dark min-w-0 space-y-6 pb-16 text-white">
      <DashboardHero badge="Merchant workspace" title="Manage your offers and orders." description="Keep products, customer actions, payments and fulfillment in view." imageSrc={coffeeCode} actions={[{ label: "Verify a customer action", onClick: () => handleTabChange("redemptions"), icon: QrCode }]} />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <RoleWorkspaceTabs label="Merchant workspace" items={tabs} />
        <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="merchant" sceneId={searchParams.get("scene_id") || undefined} /></TabsContent>
        <TabsContent value="storefront" className="mt-0"><MerchantStorefrontConsole onOpenScanner={() => handleTabChange("redemptions")} /></TabsContent>
        <TabsContent value="redemptions" className="mt-0"><MerchantScannerStation /></TabsContent>
        <TabsContent value="commerce" className="mt-0"><MerchantCommerceConsole onOpenProducts={() => handleTabChange("storefront")} onOpenValidation={() => handleTabChange("redemptions")} /></TabsContent>
        <TabsContent value="venues" className="mt-0"><MerchantVenueStudio onOpenMoments={() => navigate("/create/moment")} /></TabsContent>
        <TabsContent value="analytics" className="mt-0"><MerchantYieldAnalytics /></TabsContent>
      </Tabs>
      <details className="rounded-xl border border-white/10 p-4"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">Plan a business outcome</summary><div className="mt-4"><BusinessOutcomeEntry role="merchant" /></div></details>
    </div>
  );
}

export default MerchantDashboardV2;
