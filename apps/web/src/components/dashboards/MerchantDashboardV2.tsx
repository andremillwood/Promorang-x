import { useState } from "react";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Plus, 
  Clock, 
  Star, 
  DollarSign, 
  Coins, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck, 
  Store,
  ChevronRight,
  Zap,
  BarChart3,
  CheckCircle2,
  QrCode,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantVenues, useMerchantStats } from "@/hooks/useVenues";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCatalogManager from "@/components/merchant/ProductCatalogManager";
import RedemptionValidator from "@/components/merchant/RedemptionValidator";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";

// ============================================================================
// MERCHANT DASHBOARD V2
// Venue-first design with progressive disclosure
// ============================================================================

const MerchantDashboardV2 = () => {
  const { user } = useAuth();
  const { data: venues, isLoading: venuesLoading } = useMerchantVenues();
  const { data: stats, isLoading: statsLoading } = useMerchantEconomy();
  const { data: economy, isLoading: economyLoading } = useMerchantEconomy();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "venues";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Calculate merchant maturity
  const isNewMerchant = !venues || venues.length === 0;
  const isActiveMerchant = venues && venues.length > 0 && (stats?.weeklyTraffic || 0) > 0;
  const isEstablishedMerchant = venues && venues.length >= 2 && (stats?.weeklyTraffic || 0) > 50;

  // Weekly stats
  const weeklyTraffic = stats?.weeklyTraffic || 0;
  const totalPoints = economy?.totalPointsEarned || 0;

  return (
    <div className="space-y-6 pb-20">
      {/* =====================================================================
          HEADER: Context-aware
          ===================================================================== */}
      {isNewMerchant ? (
        // Simple welcome for new merchants
        <section className="relative rounded-2xl bg-gradient-to-br from-emerald-500/5 via-background to-primary/5 p-6 border border-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Store className="w-3 h-3" />
                Your Venue
              </div>
              <h1 className="font-serif text-2xl font-bold mb-1">
                Welcome, <span className="italic text-emerald-600">{user?.user_metadata?.full_name?.split(" ")[0] || "Partner"}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Turn your venue into an anchor for community activity
              </p>
            </div>
            <Button asChild className="rounded-full bg-emerald-600 hover:bg-emerald-700">
              <Link to="/dashboard/venues/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Venue
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        // Full header for active merchants
        <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Your <span className="text-emerald-600 italic">Venue</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              See how your space is performing
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stats && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  {weeklyTraffic} this week
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  {totalPoints.toLocaleString()} points
                </span>
              </div>
            )}
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link to="/dashboard/venues/add">
                <Plus className="w-4 h-4 mr-2" />
                Add Venue
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* =====================================================================
          NEW MERCHANT: First Venue Guidance
          ===================================================================== */}
      {isNewMerchant && (
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Register Your First Venue</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The first merchant success is simple: register the venue, make sure a live moment 
                  can run there, then validate the first participant proof.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/venues/add">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Venue
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/discover">
                      <MapPin className="w-4 h-4 mr-2" />
                      See Venues
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          MERCHANT JOURNEY: Progress indicator
          ===================================================================== */}
      {!isNewMerchant && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-sm">Merchant Journey</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {isEstablishedMerchant ? "3/3" : isActiveMerchant ? "2/3" : "1/3"}
              </Badge>
            </div>
            <Progress 
              value={isEstablishedMerchant ? 100 : isActiveMerchant ? 66 : 33} 
              className="h-2 mb-3" 
            />
            <div className="grid grid-cols-3 gap-2">
              {[
                { 
                  label: "Add venue", 
                  done: venues && venues.length > 0,
                  icon: Store
                },
                { 
                  label: "Get visitors", 
                  done: weeklyTraffic > 0,
                  icon: Users
                },
                { 
                  label: "Validate proofs", 
                  done: isEstablishedMerchant,
                  icon: ShieldCheck
                },
              ].map((step, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col items-center p-3 rounded-xl text-center ${
                    step.done ? "bg-emerald-500/5" : "bg-muted/30"
                  }`}
                >
                  <step.icon className={`w-4 h-4 mb-1 ${step.done ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className={`text-xs ${step.done ? "text-emerald-600 font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                  {step.done && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          STATS: Only for active merchants
          ===================================================================== */}
      {!isNewMerchant && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statsLoading || economyLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            [
              { 
                label: "Points Earned", 
                value: totalPoints.toLocaleString(), 
                icon: Coins, 
                color: "text-amber-500" 
              },
              { 
                label: "Weekly Traffic", 
                value: weeklyTraffic.toString(), 
                icon: Users, 
                color: "text-emerald-500" 
              },
              { 
                label: "Venues", 
                value: venues?.length || 0, 
                icon: Store, 
                color: "text-primary" 
              },
              { 
                label: "Avg Per Visit", 
                value: economy?.yieldPerVisitor?.toFixed(1) || "0", 
                icon: TrendingUp, 
                color: "text-blue-500" 
              },
            ].map((stat, index) => (
              <Card key={index} className="hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* =====================================================================
          MY VENUES: Priority display
          ===================================================================== */}
      {!isNewMerchant && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold">My Venues</h2>
            {venues && venues.length > 2 && (
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("venues")}>
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {venuesLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : venues && venues.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Store className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No venues registered yet</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/dashboard/venues/add">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Venue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {venues.slice(0, 4).map((venue) => (
                <Card key={venue.id} className="group hover:shadow-soft transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image placeholder */}
                      <div className="w-24 h-24 bg-muted relative flex-shrink-0">
                        {venue.image_url ? (
                          <img
                            src={venue.image_url}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-primary/20 flex items-center justify-center">
                            <Store className="w-8 h-8 text-emerald-600/60" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4 min-w-0">
                        <h3 className="font-medium truncate group-hover:text-emerald-600 transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{venue.address || venue.location}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {venue.rating || "New"}
                          </span>
                          {venue.is_active && (
                            <Badge variant="outline" className="text-[10px] text-emerald-600">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =====================================================================
          MAIN TABS: Progressive disclosure
          ===================================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="venues" className="gap-2">
            <Store className="w-4 h-4" />
            Venues
          </TabsTrigger>
          {!isNewMerchant && (
            <TabsTrigger value="redemptions" className="gap-2">
              <QrCode className="w-4 h-4" />
              Check-ins
            </TabsTrigger>
          )}
          {!isNewMerchant && (
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
          )}
          {isEstablishedMerchant && (
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="venues" className="mt-0">
          {venuesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : venues && venues.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Store className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-medium mb-2">No venues yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first venue to start hosting moments
                </p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/dashboard/venues/add">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {venues.map((venue) => (
                <Card key={venue.id} className="hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{venue.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {venue.address || venue.location}
                        </p>
                      </div>
                      <Badge variant={venue.is_active ? "default" : "outline"}>
                        {venue.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {!isNewMerchant && (
          <TabsContent value="redemptions" className="mt-0">
            <RedemptionValidator />
          </TabsContent>
        )}

        {!isNewMerchant && (
          <TabsContent value="products" className="mt-0">
            <ProductCatalogManager />
          </TabsContent>
        )}

        {isEstablishedMerchant && (
          <TabsContent value="analytics" className="mt-0">
            <SalesAnalyticsDashboard />
          </TabsContent>
        )}
      </Tabs>

      {/* =====================================================================
          ROLE ACTIVATION: Always visible guidance
          ===================================================================== */}
      <RoleActivationPanel
        eyebrow="Merchant Today"
        title={isNewMerchant ? "Start your venue journey" : "Grow your impact"}
        description={
          isNewMerchant 
            ? "Register your first venue to begin anchoring community activity."
            : "Master the operational loop: register, enable moments, validate proofs."
        }
        items={[
          {
            title: "Register venue",
            description: "Add a trusted place for activity",
            status: venues && venues.length > 0 ? "done" : "current",
            href: "/dashboard/venues/add",
            ctaLabel: "Add",
          },
          {
            title: "Enable moments",
            description: "Make venue available for events",
            status: venues && venues.length > 0 ? "done" : "todo",
            href: "/create-moment",
            ctaLabel: "Create",
          },
          {
            title: "Validate proofs",
            description: "Approve check-ins for rewards",
            status: weeklyTraffic > 0 ? "current" : "todo",
            ctaLabel: "Validate",
            onClick: () => setActiveTab("redemptions"),
          },
        ]}
      />
    </div>
  );
};

export default MerchantDashboardV2;
