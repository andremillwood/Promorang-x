import { useState } from "react";
import { MapPin, Users, Calendar, ArrowUpDown, Plus, Clock, Star, Package, DollarSign, Coins, TrendingUp, CreditCard, ExternalLink, ShieldCheck, Share2, RefreshCw, AlertCircle, Smartphone, BarChart3, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantVenues, useMerchantStats } from "@/hooks/useVenues";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCatalogManager from "@/components/merchant/ProductCatalogManager";
import RedemptionValidator from "@/components/merchant/RedemptionValidator";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";

const MerchantDashboard = () => {
  const { user } = useAuth();
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const { data: stats, isLoading: statsLoading } = useMerchantStats();
  const { data: economy, isLoading: economyLoading } = useMerchantEconomy();
  const [activeTab, setActiveTab] = useState("venues");

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
            <Button variant="ghost" size="sm">Manage All</Button>
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
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Manage
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
            <Button variant="default">
              Promote Your Venue
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
        <TabsContent value="billing" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Direct Payments</h3>
                    <p className="text-muted-foreground text-sm">Sell products directly to participants via Stripe.</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
                    Stripe Connect
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border mb-8 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="font-bold mb-2">Connect your Stripe account</h4>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    To start accepting credit card payments and receive payouts, you need to link your Stripe account.
                  </p>
                  <Button className="bg-[#635BFF] hover:bg-[#5851EA] text-white gap-2">
                    Connect with Stripe <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Platform Fee</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Per direct transaction</p>
                      </div>
                    </div>
                    <span className="font-bold">5.0%</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Available for Payout</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Estimated arrival: --</p>
                      </div>
                    </div>
                    <span className="font-bold">$0.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Seller Security
                </h4>
                <div className="space-y-4 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Encrypted:</strong> All transactions are processed through Stripe's 256-bit encrypted gateway.
                  </p>
                  <p>
                    <strong className="text-foreground">Payouts:</strong> Standard 2-day rolling payout schedule once active.
                  </p>
                  <p>
                    <strong className="text-foreground">Disputes:</strong> Managed directly via your Stripe Dashboard.
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                <h4 className="font-bold text-sm mb-4">Payout History</h4>
                <p className="text-[10px] text-muted-foreground italic text-center py-4">
                  No payout history yet.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">E-commerce Integrations</h3>
                <p className="text-muted-foreground text-sm">Sync your existing products from Shopify or WooCommerce.</p>
              </div>
              <Badge variant="outline" className="gap-1 animate-pulse text-primary border-primary/20 bg-primary/5">
                <RefreshCw className="w-3 h-3" /> Auto-sync Active
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Shopify */}
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#96bf48]/10 flex items-center justify-center">
                    <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify" className="w-8 h-8" />
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    Connect Store
                  </Button>
                </div>
                <h4 className="font-bold mb-2">Shopify</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Import products, collections, and inventory counts automatically.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-muted" /> Not Connected
                </div>
              </div>

              {/* WooCommerce */}
              <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#96588a]/10 flex items-center justify-center">
                    <img src="https://cdn.worldvectorlogo.com/logos/woocommerce.svg" alt="WooCommerce" className="w-8 h-8" />
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    Link API Key
                  </Button>
                </div>
                <h4 className="font-bold mb-2">WooCommerce</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Sync your WordPress store using REST API and webhooks.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-muted" /> Not Connected
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <p className="font-bold text-primary mb-1">What happens when I connect?</p>
                We will pull your active products into the <strong className="text-foreground">Promorang Marketplace</strong>.
                Orders placed on Promorang will be synced back to your store as "External Sales" so your inventory stays accurate.
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-2xl p-8 border border-border/40">
            <div className="max-w-md mx-auto text-center py-6">
              <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h4 className="font-bold text-muted-foreground mb-2">No active syncs</h4>
              <p className="text-xs text-muted-foreground">Select a platform above to start importing your products.</p>
            </div>
          </div>

          {/* POS Integrations */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">Point of Sale (POS) Hub</h3>
                <p className="text-muted-foreground text-sm">Bridge digital participation with in-store sales attribution.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                <Smartphone className="w-3 h-3" /> Attribution Ready
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: "Square", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Square_app_logo.png", color: "bg-black" },
                { name: "QuickBooks", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/QuickBooks_logo.svg", color: "bg-green-600" },
                { name: "Aloha (NCR)", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a3/NCR_Corporation_logo.svg", color: "bg-red-600" },
                { name: "NCB Jamaica", logo: "https://www.jncb.com/getmedia/5f1b2b3b-3b3b-4b3b-8b3b-3b3b3b3b3b3b/NCB-Logo.png", color: "bg-blue-800" },
                { name: "Toast", logo: "https://pos.toasttab.com/hubfs/toast-logo-orange.svg", color: "bg-orange-500" },
                { name: "Clover", logo: "https://www.clover.com/content/dam/clover/en_us/images/brand/logo.svg", color: "bg-emerald-500" }
              ].map((pos) => (
                <div key={pos.name} className="p-4 rounded-xl border border-border hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="h-6 mb-3 flex items-center overflow-hidden">
                    <img src={pos.logo} alt={pos.name} className="h-full object-contain filter grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />
                  </div>
                  <Button variant="secondary" size="sm" className="w-full text-[10px] h-8">Authorize {pos.name}</Button>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-4 h-4 text-primary" />
                <h4 className="font-bold text-sm">How Attribution Works in Jamaica:</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="font-bold text-primary text-[10px] uppercase tracking-wider">1. Check-In</p>
                  <p className="text-[11px] text-muted-foreground">User joins your moment via Promorang in-app.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-primary text-[10px] uppercase tracking-wider">2. POS Match</p>
                  <p className="text-[11px] text-muted-foreground">We match the transaction timestamp from your NCR/QuickBooks/Square system.</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-primary text-[10px] uppercase tracking-wider">3. Brand ROI</p>
                  <p className="text-[11px] text-muted-foreground">We push verified ROI data to your Brand sponsors as hard proof.</p>
                </div>
              </div>
            </div>
          </div>
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
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <Package className="w-5 h-5" />
          <span className="text-sm">Products</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
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
