import { useState } from "react";
import { MapPin, Users, Calendar, ArrowUpDown, Plus, Clock, Star, Package, DollarSign, Coins, TrendingUp, CreditCard, ExternalLink, ShieldCheck, Share2, RefreshCw, AlertCircle, Smartphone, BarChart3, QrCode, Store, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantVenues, useMerchantStats } from "@/hooks/useVenues";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCatalogManager from "@/components/merchant/ProductCatalogManager";
import RedemptionValidator from "@/components/merchant/RedemptionValidator";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";
import IntegrationsPanel from "@/components/merchant/IntegrationsPanel";
import ManualPayoutSettings from "@/components/payouts/ManualPayoutSettings";

const MerchantDashboard = () => {
  const { user } = useAuth();
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const { data: stats, isLoading: statsLoading } = useMerchantStats();
  const { data: economy, isLoading: economyLoading } = useMerchantEconomy();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "venues";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showAllVenues, setShowAllVenues] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex items-start justify-between bg-charcoal p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Store className="w-3.5 h-3.5" />
            Your Venue
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 italic">
            Your <span className="text-emerald-500">Venue.</span>
          </h1>
          <p className="text-white/60 font-serif italic">
            See how your space is performing and who's visiting.
          </p>
        </div>
        <Button variant="hero" size="lg" className="rounded-2xl shadow-glow" asChild>
          <Link to="/dashboard/venues/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Venue
          </Link>
        </Button>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statsLoading || economyLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))
        ) : (
          [
            { label: "Points Earned Here", value: economy?.totalPointsEarned?.toLocaleString() || "0", icon: Coins, color: "text-amber-500" },
            { label: "Avg. Per Visit", value: economy?.yieldPerVisitor?.toFixed(1) || "0", icon: TrendingUp, color: "text-primary" },
            { label: "Weekly Check-ins", value: stats?.weeklyTraffic || 0, icon: ShieldCheck, color: "text-emerald-500" },
            { label: "Weekly Growth", value: `${stats?.growth || 0}%`, icon: Zap, color: "text-primary" },
          ].map((stat, index) => (
            <div key={index} className="bg-card rounded-[2rem] p-6 border border-border/50 shadow-soft group hover:border-emerald-500/30 transition-all">
              <div className={`h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/50 rounded-2xl">
          <TabsTrigger value="venues" className="gap-2 rounded-xl py-2.5">
            <MapPin className="w-4 h-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-2 rounded-xl py-2.5 text-emerald-600 font-bold">
            <ShieldCheck className="w-4 h-4" />
            Check-ins
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2 rounded-xl py-2.5">
            <Package className="w-4 h-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 rounded-xl py-2.5">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 rounded-xl py-2.5">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2 rounded-xl py-2.5">
            <Share2 className="w-4 h-4" />
            Social
          </TabsTrigger>
        </TabsList>

        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-bold text-foreground italic">
              Your <span className="text-primary italic">Venues</span>
            </h2>
            <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]" onClick={() => setShowAllVenues(!showAllVenues)}>
              {showAllVenues ? "Compress" : "Manage All"} <ArrowUpDown className="w-3 h-3" />
            </Button>
          </div>

          {venuesLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-3xl" />
              ))}
            </div>
          ) : venues && venues.length === 0 ? (
            <div className="bg-muted/30 rounded-[2.5rem] p-16 border border-dashed border-border text-center">
              <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <p className="text-foreground font-bold text-xl mb-2 italic">No venues yet</p>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Add your space so community hosts can book it for moments.</p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard/venues/add">Add Your First Venue</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {venues?.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-card rounded-[2.5rem] p-8 border border-border/50 hover:shadow-soft-xl transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-foreground mb-1 italic">{venue.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-primary" /> {venue.address}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full uppercase font-black text-[9px] tracking-widest">
                        Partner Venue
                    </Badge>
                  </div>

                  {venue.image_url && (
                    <div className="mb-6 rounded-[1.5rem] overflow-hidden aspect-video border border-border/30">
                      <img
                        src={venue.image_url}
                        alt={venue.name}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/20">
                      <p className="text-3xl font-bold text-foreground font-serif">0</p>
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Active Moments</p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/20">
                      <p className="text-3xl font-bold text-foreground font-serif">0</p>
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Weekly Check-ins</p>
                    </div>
                  </div>

                  <div className="flex gap-3 relative z-10">
                    <Button variant="outline" size="lg" className="flex-1 rounded-[1.25rem] font-bold uppercase tracking-widest text-[10px]" asChild>
                      <Link to={`/dashboard?tab=venues`}>Details</Link>
                    </Button>
                    <Button variant="hero" size="lg" className="flex-1 rounded-[1.25rem] font-bold uppercase tracking-widest text-[10px]" asChild>
                      <Link to={`/dashboard/venues/add`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Educational Insight */}
          <div className="bg-charcoal rounded-[2.5rem] p-10 text-white relative overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-bold text-white mb-4 italic">
                Get More <span className="text-primary italic">Visits.</span>
              </h3>
              <p className="text-white/60 mb-8 max-w-xl leading-relaxed">
                Venues that greet guests in person and use the simple PIN check-in see 40% more 
                repeat visitors. Make sure your staff knows how easy it is.
              </p>
              <Button variant="warm" size="lg" className="rounded-2xl font-black uppercase tracking-widest text-[10px]" asChild>
                <Link to="/for-merchants">Learn More</Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="mt-6">
          <ProductCatalogManager />
        </TabsContent>

        {/* Redemptions Tab */}
        <TabsContent value="redemptions" className="mt-6">
          <RedemptionValidator />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <SalesAnalyticsDashboard />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <ManualPayoutSettings />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsPanel />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/dashboard/venues/add">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Add Venue</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("products")}>
          <Package className="w-5 h-5" />
          <span className="text-sm">Products</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab("analytics")}>
          <Users className="w-5 h-5" />
          <span className="text-sm">Visitors</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/dashboard/settings">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MerchantDashboard;
