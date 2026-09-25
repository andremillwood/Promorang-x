import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, BarChart3, MapPin, QrCode, ShoppingBag, Store, Vote } from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useMerchantVenues } from "@/hooks/useVenues";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MerchantScannerStation from "@/components/merchant/MerchantScannerStation";
import MerchantStorefrontConsole from "@/components/merchant/MerchantStorefrontConsole";
import { MerchantCommerceConsole } from "@/components/merchant/MerchantCommerceConsole";
import MerchantVenueStudio from "@/components/merchant/MerchantVenueStudio";
import MerchantYieldAnalytics from "@/components/merchant/MerchantYieldAnalytics";
import { BusinessOutcomeEntry } from "@/components/business/BusinessOutcomeEntry";
import coffeeCode from "@/assets/moments/coffee-code.jpg";

export function MerchantDashboardV2() {
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "storefront";
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

  const venueCount = venues?.length || 0;
  const tabs = [
    { id: "demand", label: "Customer demand", hint: "What people are asking for", icon: Vote, action: "Listen" },
    { id: "storefront", label: "Offers & products", hint: "What customers can actually act on", icon: Store, action: "Supply" },
    { id: "redemptions", label: "Verify actions", hint: "Claims and redemptions", icon: QrCode, action: "Validate" },
    { id: "commerce", label: "Orders", hint: "Payment, receipts and fulfillment", icon: ShoppingBag, action: "Operate" },
    { id: "venues", label: "Places", hint: "Where customers show up", icon: MapPin, action: venuesLoading ? "Checking" : `${venueCount} ${venueCount === 1 ? "place" : "places"}` },
    { id: "analytics", label: "Results", hint: "What the evidence says", icon: BarChart3, action: "Review" },
  ];
  const active = tabs.find((tab) => tab.id === activeTab) || tabs[1];

  return (
    <div className="space-y-8 pb-16 text-white animate-in fade-in-50 duration-300">
      <BusinessOutcomeEntry role="merchant" />
      <section className="group relative min-h-[420px] overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
        <img src={coffeeCode} alt="" className="absolute inset-0 h-full w-full object-cover opacity-42 transition duration-700 group-hover:scale-[1.015]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.97)_0%,rgba(0,0,0,.84)_52%,rgba(0,0,0,.36)_100%),linear-gradient(0deg,rgba(0,0,0,.94),transparent_62%)]" />
        <div className="relative z-10 flex min-h-[420px] max-w-[760px] flex-col justify-between p-6 sm:p-9 lg:p-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#ff7a35]">Merchant workspace · demand → supply → validation → return</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Demand can inform what you put up. It never becomes a sale until a distinct offer, customer action, payment and fulfillment record exist.</p>
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

      <section aria-labelledby="merchant-work-rail">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-white/35">Merchant operating rail</p><h2 id="merchant-work-rail" className="mt-2 font-serif text-3xl font-bold tracking-[-.04em]">What is in play.</h2></div>
          <p className="hidden max-w-[280px] text-xs leading-5 text-white/35 sm:block">Demand, supply, validation and fulfillment stay separate.</p>
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
          <TabsTrigger value="demand">Demand</TabsTrigger><TabsTrigger value="storefront">Offers</TabsTrigger><TabsTrigger value="redemptions">Verification</TabsTrigger><TabsTrigger value="commerce">Orders</TabsTrigger><TabsTrigger value="venues">Places</TabsTrigger><TabsTrigger value="analytics">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="merchant" sceneId={searchParams.get("scene_id") || undefined} /></TabsContent>
        <TabsContent value="storefront" className="mt-0"><MerchantStorefrontConsole onOpenProducts={() => handleTabChange("storefront")} onOpenScanner={() => handleTabChange("redemptions")} /></TabsContent>
        <TabsContent value="redemptions" className="mt-0"><MerchantScannerStation /></TabsContent>
        <TabsContent value="commerce" className="mt-0"><MerchantCommerceConsole onOpenProducts={() => handleTabChange("storefront")} onOpenValidation={() => handleTabChange("redemptions")} /></TabsContent>
        <TabsContent value="venues" className="mt-0"><MerchantVenueStudio onOpenMoments={() => handleTabChange("venues")} /></TabsContent>
        <TabsContent value="analytics" className="mt-0"><MerchantYieldAnalytics /></TabsContent>
      </Tabs>
    </div>
  );
}

export default MerchantDashboardV2;