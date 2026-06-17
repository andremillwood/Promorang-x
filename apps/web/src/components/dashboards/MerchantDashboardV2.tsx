import { useMemo, useState } from "react";
import { 
  ArrowRight,
  MapPin, 
  Users, 
  Star, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  Store,
  Zap,
  BarChart3,
  CheckCircle2,
  QrCode,
  Package
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHero, DashboardNextStepsSection, DashboardQuickRoutesCard } from "@/components/dashboard/DashboardSurface";
import { useMerchantVenues } from "@/hooks/useVenues";
import { useMerchantEconomy } from "@/hooks/useStakeholderEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCatalogManager from "@/components/merchant/ProductCatalogManager";
import RedemptionValidator from "@/components/merchant/RedemptionValidator";
import SalesAnalyticsDashboard from "@/components/merchant/SalesAnalyticsDashboard";
import { CommercialProofLoop } from "@/components/commercial/CommercialProofLoop";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PublicMomentRow = Tables<"view_public_moment_directory">;

// ============================================================================
// MERCHANT DASHBOARD V2
// Venue-first design with progressive disclosure
// ============================================================================

const MerchantDashboardV2 = () => {
  useAuth();
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
  const ownedVenueIds = useMemo(() => new Set((venues || []).map((venue) => venue.id)), [venues]);
  const ownedVenueCities = useMemo(() => new Set((venues || []).map((venue) => venue.city).filter(Boolean)), [venues]);

  const venueMomentQuery = useQuery({
    queryKey: ["merchant-visible-moments", Array.from(ownedVenueIds).join(","), Array.from(ownedVenueCities).join(",")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("view_public_moment_directory")
        .select("*")
        .order("starts_at", { ascending: false, nullsFirst: false })
        .limit(48);

      if (error) throw error;
      return (data || []) as PublicMomentRow[];
    },
  });

  const venueRelatedMoments = useMemo(() => {
    const rows = venueMomentQuery.data || [];
    const matched = rows.filter((moment) =>
      (moment.venue_id && ownedVenueIds.has(moment.venue_id)) ||
      (moment.city && ownedVenueCities.has(moment.city)),
    );

    return (matched.length > 0 ? matched : rows).slice(0, 5);
  }, [venueMomentQuery.data, ownedVenueIds, ownedVenueCities]);

  return (
    <div className="space-y-6 pb-20">
      <DashboardHero
        badge="Venue Operations"
        title={isNewMerchant ? "Turn one venue into a trusted activation point" : "Run your venue as a verified activity hub"}
        description="Register the place, support moments or offers, validate arrivals and redemptions, then use proof to bring people back through the door."
        actions={[
          { label: "Add venue", href: "/dashboard/venues/add", icon: Store },
          { label: "Offers", href: "/dashboard/offers", icon: Package },
          { label: isEstablishedMerchant ? "Analytics" : "Products", onClick: () => setActiveTab(isEstablishedMerchant ? "analytics" : "products"), icon: BarChart3 },
        ]}
        stats={[
          { label: "Venues", value: (venues?.length || 0).toLocaleString(), helper: "Registered locations", icon: Store, accentClass: "text-emerald-300" },
          { label: "Weekly traffic", value: weeklyTraffic.toLocaleString(), helper: "Validated local activity", icon: Users, accentClass: "text-emerald-300" },
          { label: "Points earned", value: totalPoints.toLocaleString(), helper: "Returned from activity", icon: Coins, accentClass: "text-emerald-300" },
          { label: "Yield per visit", value: economy?.yieldPerVisitor?.toFixed(1) || "0", helper: "Average venue performance", icon: TrendingUp, accentClass: "text-emerald-300" },
        ]}
        isLoading={statsLoading || economyLoading}
        glowClassName="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,167,38,0.14),_transparent_34%)]"
      />

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
                    <Link to="/discover/venues">
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <DashboardNextStepsSection
            description="Keep venue operations clear: register the place, support the offer, then validate what happened there."
            ctaLabel="Open venues"
            ctaOnClick={() => setActiveTab("venues")}
            items={[
              {
                title: "Register location",
                description: "Add or update the place where activity happens.",
                cta: "Manage venues",
                href: "/dashboard/venues/add",
              },
              {
                title: "Validate activity",
                description: "Confirm check-ins, scans, and redemptions while the guest is present.",
                cta: "Open validation",
                onClick: () => setActiveTab("redemptions"),
              },
              {
                title: "Tune the offer",
                description: "Adjust products, perks, and visit rituals based on what people actually did.",
                cta: isEstablishedMerchant ? "Open analytics" : "Open products",
                onClick: () => setActiveTab(isEstablishedMerchant ? "analytics" : "products"),
              },
            ]}
          />

          <CommercialProofLoop
        eyebrow="Venue Proof Loop"
        title="Show the venue story as verified local movement"
        action={
          weeklyTraffic > 0
            ? `${weeklyTraffic} participant visits or proof-linked actions moved through your venues this week.`
            : "Turn one venue into the anchor for a moment, offer, or proof-linked visit."
        }
        verification={
          venues && venues.length > 0
            ? "Use venue registration, QR / check-in validation, and redemption confirmation as proof."
            : "Verification starts once the venue is registered and check-ins or redemptions can be validated."
        }
        outcome={
          totalPoints > 0
            ? `${totalPoints.toLocaleString()} points and repeat proof signals show measurable activity happened on-site.`
            : "Report visits, validated redemptions, repeat traffic, and proof completion as the operating outcome."
        }
        repeatability={
          isEstablishedMerchant
            ? "Use the same venue setup, validation, and redemption playbook across multiple locations."
            : "Once one venue loop works, repeat it with the same proof and redemption mechanics each week."
        }
          />

          <Card className="border-emerald-500/20">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">Market Graph</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold">See moments and pieces around your venue</h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Merchants should be able to see what already happened nearby, what is currently active, and where venue pieces can participate through Gems.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/explore/moments">Explore Moments</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/marketplace">Piece Market</Link>
                  </Button>
                </div>
              </div>

              {venueMomentQuery.isLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {venueRelatedMoments.map((moment) => (
                    <div key={moment.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate font-semibold">{moment.title}</h4>
                            {moment.venue_id && ownedVenueIds.has(moment.venue_id) ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">Your venue</Badge>
                            ) : (
                              <Badge variant="outline">Nearby signal</Badge>
                            )}
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {moment.description || moment.reward || "A moment that can inform venue activations and offer timing."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {moment.venue_name || moment.city || moment.location || "Location pending"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {(moment.participant_count || 0).toLocaleString()} participants
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/moments/${moment.slug || moment.id}`}>
                            Open
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

      {/* =====================================================================
          MY VENUES: Priority display
          ===================================================================== */}
          {!isNewMerchant && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold">My Venues</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep your active locations visible here; do the deeper editing inside the venue tools.
                  </p>
                </div>
                {venues && venues.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("venues")}>
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
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
        </div>

        <div className="space-y-6">
          <RoleActivationPanel
            eyebrow="Merchant Today"
            title={isNewMerchant ? "Make one place ready for real visits" : "Keep the door connected to verified demand"}
            description={
              isNewMerchant 
                ? "Register the place first. From there, moments, offers, creator missions, and rewards have somewhere real to land."
                : "Keep the loop simple: host or receive the moment, validate the arrival or redemption, then use proof to bring people back."
            }
            items={[
              {
                title: "Register venue",
                description: "Add the trusted place where visits, offers, and memories can happen.",
                status: venues && venues.length > 0 ? "done" : "current",
                href: "/dashboard/venues/add",
                ctaLabel: "Add",
              },
              {
                title: "Enable moments",
                description: "Give people a reason to come now: a drop, ritual, tasting, reward, or local gathering.",
                status: venues && venues.length > 0 ? "done" : "todo",
                href: "/create/moment",
                ctaLabel: "Create",
              },
              {
                title: "Validate proofs",
                description: "Confirm check-ins and redemptions so the visit counts for everyone involved.",
                status: weeklyTraffic > 0 ? "current" : "todo",
                ctaLabel: "Validate",
                onClick: () => setActiveTab("redemptions"),
              },
            ]}
          />

          <DashboardQuickRoutesCard
            description="Keep validation and venue tooling easy to reach without overwhelming the operating story."
            routes={[
              { label: "Add venue", href: "/dashboard/venues/add", icon: Store },
              { label: "Existing moments", href: "/explore/moments", icon: MapPin },
              { label: "Validate activity", onClick: () => setActiveTab("redemptions"), icon: QrCode },
              { label: isEstablishedMerchant ? "Open analytics" : "Manage products", onClick: () => setActiveTab(isEstablishedMerchant ? "analytics" : "products"), icon: Package },
              { label: "Piece market", href: "/marketplace", icon: Coins },
              { label: "Liquidity", href: "/liquidity", icon: TrendingUp },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboardV2;
