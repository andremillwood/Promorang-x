import { useSearchParams } from "react-router-dom";
import { BarChart3, MapPin, QrCode, ShoppingBag, Store, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useMerchantVenues } from "@/hooks/useVenues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MerchantScannerStation from "@/components/merchant/MerchantScannerStation";
import MerchantStorefrontConsole from "@/components/merchant/MerchantStorefrontConsole";
import MerchantOrdersHub from "@/components/merchant/MerchantOrdersHub";
import MerchantVenueStudio from "@/components/merchant/MerchantVenueStudio";
import MerchantYieldAnalytics from "@/components/merchant/MerchantYieldAnalytics";

const MERCHANT_TABS = new Set(["demand", "storefront", "redemptions", "commerce", "venues", "analytics"]);

export function MerchantDashboardV2() {
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = requestedTab && MERCHANT_TABS.has(requestedTab) ? requestedTab : "storefront";

  const handleTabChange = (value: string) => {
    if (!MERCHANT_TABS.has(value)) return;
    const next = new URLSearchParams(searchParams);
    next.set("view", "studio");
    next.set("tab", value);
    setSearchParams(next);
  };

  const venueCount = venues?.length || 0;
  const tabs = [
    { id: "demand", label: "Customer demand", hint: "What people are asking for", icon: Vote, count: "Listen" },
    { id: "storefront", label: "Offers & products", hint: "What customers can act on", icon: Store, count: "Manage" },
    { id: "redemptions", label: "Verify actions", hint: "Claims and redemptions", icon: QrCode, count: "Verify" },
    { id: "commerce", label: "Orders", hint: "Paid orders and fulfillment", icon: ShoppingBag, count: "Review" },
    {
      id: "venues",
      label: "Places",
      hint: "Where customers show up",
      icon: MapPin,
      count: venuesLoading ? "Checking" : `${venueCount} ${venueCount === 1 ? "place" : "places"}`,
    },
    { id: "analytics", label: "Results", hint: "What the evidence says", icon: BarChart3, count: "Review" },
  ];

  return (
    <div className="space-y-6 pb-16 text-white animate-in fade-in-50 duration-300">
      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-950/15 p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Merchant tools</p>
        <h2 className="mt-2 text-2xl font-black text-white">Operate the customer path.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
          Use these tools after choosing the current job above. Publish something worth acting on, verify what customers actually do, then use the result to decide what to repeat or improve.
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
                  ? "border-emerald-500 bg-emerald-950/35 ring-1 ring-emerald-500/40"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-2xl p-2 ${isActive ? "bg-emerald-500 text-black" : "bg-white/5 text-emerald-400"}`}>
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
          <TabsTrigger value="storefront">Offers</TabsTrigger>
          <TabsTrigger value="redemptions">Verification</TabsTrigger>
          <TabsTrigger value="commerce">Orders</TabsTrigger>
          <TabsTrigger value="venues">Places</TabsTrigger>
          <TabsTrigger value="analytics">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="mt-0">
          <DiscoveryDemandInbox role="merchant" />
        </TabsContent>
        <TabsContent value="storefront" className="mt-0">
          <MerchantStorefrontConsole
            onOpenProducts={() => handleTabChange("storefront")}
            onOpenScanner={() => handleTabChange("redemptions")}
          />
        </TabsContent>
        <TabsContent value="redemptions" className="mt-0">
          <MerchantScannerStation />
        </TabsContent>
        <TabsContent value="commerce" className="mt-0">
          <MerchantOrdersHub onOpenScanner={() => handleTabChange("redemptions")} />
        </TabsContent>
        <TabsContent value="venues" className="mt-0">
          <MerchantVenueStudio onOpenMoments={() => handleTabChange("venues")} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-0">
          <MerchantYieldAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MerchantDashboardV2;
