import { useState } from "react";
import { MapPin, Users, Calendar, ArrowUpDown, Plus, Clock, Star, Package, DollarSign, Coins, TrendingUp, CreditCard, ExternalLink, ShieldCheck, Share2, RefreshCw, AlertCircle, Smartphone, BarChart3, QrCode, Store, Building2 } from "lucide-react";
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Venue Dashboard 🏪
          </h1>
          <p className="text-muted-foreground">
            Manage your venues and welcome moments
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/venues/add">
            <Plus className="w-4 h-4 mr-2" />
            Add Venue
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading || economyLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          [
            { label: "Points Earned Here", value: economy?.totalPointsEarned?.toLocaleString() || "0", icon: Coins, color: "text-amber-500" },
            { label: "Venue Yield", value: economy?.yieldPerVisitor?.toFixed(1) || "0", icon: TrendingUp, color: "text-primary" },
            { label: "Weekly Visitors", value: stats?.weeklyTraffic || 0, icon: Users, color: "text-blue-500" },
            { label: "Weekly Growth", value: `${stats?.growth || 0}%`, icon: ArrowUpDown, color: "text-emerald-500" },
          ].map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-5 border border-border">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="venues" className="gap-2">
            <MapPin className="w-4 h-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-2">
            <QrCode className="w-4 h-4" />
            Redemptions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Share2 className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Your Venues
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAllVenues(!showAllVenues)}>
              {showAllVenues ? "Show Less" : "Manage All"}
            </Button>
          </div>

          {venuesLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : venues && venues.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No venues registered yet</p>
              <Button variant="hero" asChild>
                <Link to="/dashboard/venues/add">Register Your First Venue</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {venues?.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-card rounded-xl p-6 border border-border hover:shadow-card transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {venue.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>

                  {venue.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={venue.image_url}
                        alt={venue.name}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-xs text-muted-foreground">Active Moments</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-xs text-muted-foreground">Weekly Visitors</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/dashboard?tab=venues`}>View Details</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to={`/dashboard/venues/add`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-warm rounded-2xl p-6 border border-border">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
              Want to host more moments?
            </h3>
            <p className="text-muted-foreground mb-4">
              Make your venue discoverable to hosts and increase foot traffic.
            </p>
            <Button variant="default" asChild>
              <Link to="/for-merchants">Promote Your Venue</Link>
            </Button>
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
          <span className="text-sm">Traffic</span>
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
