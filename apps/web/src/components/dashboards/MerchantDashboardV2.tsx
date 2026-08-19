import { useEffect, useMemo, useState } from "react";
import { 
  ArrowRight,
  MapPin, 
  Users, 
  Star, 
  Coins, 
  TrendingUp, 
  Store,
  Zap,
  BarChart3,
  QrCode,
  Package,
  Plus,
  ExternalLink,
  ShoppingBag
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { DashboardWorkspaceNav } from "@/components/dashboard/DashboardWorkspaceNav";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import ExperienceAttachmentManager from "@/components/merchant/ExperienceAttachmentManager";
import { MerchantCommerceConsole } from "@/components/merchant/MerchantCommerceConsole";
import { StudioJourneyStory } from "@/components/dashboard/StudioJourneyStory";
import { StoryGamificationRail } from "@/components/StoryGamificationRail";
import { RightUtilityRail } from "@/components/RightUtilityRail";
import { SpinWheelModal } from "@/components/SpinWheelModal";
import { TeamSlashModal } from "@/components/TeamSlashModal";
import { DailyRewardsModal } from "@/components/DailyRewardsModal";

type PublicMomentRow = Tables<"view_public_moment_directory">;

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
  const defaultTab = searchParams.get("tab") || "storefront";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab) setActiveTab(requestedTab);
  }, [searchParams]);

  // Calculate merchant maturity
  const isNewMerchant = !venues || venues.length === 0;
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

  const [wheelOpen, setWheelOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);

  const venueRelatedMoments = useMemo(() => {
    const rows = venueMomentQuery.data || [];
    const matched = rows.filter((moment) =>
      (moment.venue_id && ownedVenueIds.has(moment.venue_id)) ||
      (moment.city && ownedVenueCities.has(moment.city)),
    );

    return (matched.length > 0 ? matched : rows).slice(0, 5);
  }, [venueMomentQuery.data, ownedVenueIds, ownedVenueCities]);

  return (
    <div className="space-y-8 pb-20 xl:space-y-10">
      {/* Top Story & Action Rail */}
      <StoryGamificationRail
        onOpenWheel={() => setWheelOpen(true)}
        onOpenStreak={() => setStreakOpen(true)}
      />
      <DashboardHero
        badge="Venue studio"
        title={isNewMerchant ? "Make your venue a place people want to return to" : "Keep your venue connected to the Scenes around it"}
        description="Welcome Moments, creators, and offers; recognize arrivals and redemptions; then give people a reason to come back through the door."
        actions={[
          isNewMerchant
            ? { label: "Add your first venue", href: "/dashboard/venues/add", icon: Store }
            : { label: "Open orders and arrivals", onClick: () => setActiveTab("commerce"), icon: ShoppingBag },
          { label: "View storefront", href: user?.id ? `/storefront/${user.id}` : "/shop", icon: ExternalLink },
          { label: "Add product", onClick: () => setActiveTab("products"), icon: Package },
          { label: "Add venue", href: "/dashboard/venues/add", icon: Store },
        ]}
        stats={[
          { label: "Venues", value: (venues?.length || 0).toLocaleString(), helper: "Registered locations", icon: Store, accentClass: "text-emerald-300" },
          { label: "Verified arrivals", value: weeklyTraffic.toLocaleString(), helper: "Last seven days", icon: Users, accentClass: "text-emerald-300" },
          { label: "Open orders", value: (stats?.openOrders || 0).toLocaleString(), helper: "Need merchant attention", icon: ShoppingBag, accentClass: "text-amber-300" },
          { label: "Repeat visitors", value: (stats?.repeatVisitors || 0).toLocaleString(), helper: "People who came back", icon: TrendingUp, accentClass: "text-emerald-300" },
        ]}
        isLoading={statsLoading || economyLoading}
        glowClassName="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,167,38,0.14),_transparent_34%)]"
      />

      <DashboardWorkspaceNav
        eyebrow="Inside your venue studio"
        title="Welcome people well, then understand why they returned"
        activeValue={activeTab}
        onValueChange={setActiveTab}
        items={[
          { value: "storefront", label: "Storefront", icon: Store },
          { value: "products", label: "Products & inventory", icon: Package },
          { value: "commerce", label: "Orders", icon: ShoppingBag },
          { value: "redemptions", label: "Redemptions", icon: QrCode },
          { value: "venues", label: "Venues", icon: Store },
          { value: "analytics", label: "Analytics", icon: BarChart3 },
        ]}
      />

      {/* =====================================================================
          NEW MERCHANT: First Venue Guidance
          ===================================================================== */}
      {isNewMerchant && (
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-xl font-black tracking-[-0.03em]">Put your first venue on the Scene</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The first merchant success is simple: register the place, welcome a live Moment, then recognize the first person who arrives through Promorang.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard/venues/add">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Venue
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

      {!isNewMerchant && (
        <StudioJourneyStory
          guidanceId="merchant-dashboard:venue-story"
          eyebrow="Life around your venue"
          title="See when a place becomes part of people’s cultural routine"
          introduction="The venue story begins with arrivals, but the useful signal is whether people engage, return, and connect the place to a living Scene."
          signalLabel="Arrivals this week"
          signalValue={weeklyTraffic.toLocaleString()}
          beats={[
            { label: `${venues?.length || 0} ${(venues?.length || 0) === 1 ? "place is" : "places are"} visible`, detail: "Your venue presence gives Moments and Scenes somewhere real to gather.", icon: Store, tone: "complete" },
            { label: weeklyTraffic > 0 ? "People are arriving through Promorang" : "Create the first reason to arrive", detail: weeklyTraffic > 0 ? `${weeklyTraffic.toLocaleString()} visits or customer actions were recorded this week.` : "Connect an offer or Moment to the quieter part of your week.", icon: Users, tone: weeklyTraffic > 0 ? "complete" : "current" },
            { label: isEstablishedMerchant ? "Invite the next return" : "Recognize the first meaningful arrival", detail: isEstablishedMerchant ? "Use what happened to welcome people back with relevance." : "Make the welcome and proof simple enough for the room.", icon: ArrowRight, tone: "current" },
          ]}
        />
      )}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="min-w-0 space-y-6">
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
                cta: "Open console",
                onClick: () => setActiveTab("commerce"),
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
        title="See how the venue is becoming part of people's lives"
        action={
          weeklyTraffic > 0
            ? `${weeklyTraffic} visits or Promorang-connected actions moved through your venues this week.`
            : "Turn one venue into the anchor for a moment, offer, or proof-linked visit."
        }
        verification={
          venues && venues.length > 0
            ? "Use venue registration, QR check-in, and redemption confirmation to understand who arrived and what brought them."
            : "Verification starts once the venue is registered and check-ins or redemptions can be validated."
        }
        outcome={
          totalPoints > 0
            ? `${totalPoints.toLocaleString()} points and repeat visits show that people acted on-site and found a reason to return.`
            : "Report visits, redemptions, return traffic, and what people chose to do as the operating outcome."
        }
        repeatability={
          isEstablishedMerchant
            ? "Use the same venue setup, validation, and redemption playbook across multiple locations."
            : "Once one venue loop works, repeat the Moment, invitation, and return offer each week."
        }
          />

          <Card className="border-emerald-500/20">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-600">Market Graph</p>
                  <h3 className="mt-2 font-sans text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">See moments and pieces around your venue</h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Merchants should be able to see what already happened nearby, what is currently active, and where venue pieces can participate through Gems.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/discover">Explore Moments</Link>
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
                  <h2 className="text-2xl font-black tracking-[-0.04em]">My Venues</h2>
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
                    Add Venue
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
          <Tabs id="role-workspace" value={activeTab} onValueChange={setActiveTab} className="scroll-mt-28">
        <TabsList className="sr-only">
          <TabsTrigger value="storefront">Storefront</TabsTrigger>
          <TabsTrigger value="commerce" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Commerce
          </TabsTrigger>
          <TabsTrigger value="venues" className="gap-2">
            <Store className="w-4 h-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-2"><QrCode className="w-4 h-4" />Redemptions</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="w-4 h-4" />Products & inventory</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="w-4 h-4" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="storefront" className="mt-0">
          <Card className="overflow-hidden border-emerald-500/20">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr] lg:p-8">
              <div>
                <Badge className="bg-emerald-600">Your public shop</Badge>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">Manage what customers see—and what happens next.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Your storefront brings products, services, offers, and venue-linked experiences together. You can publish your catalog before adding a physical venue.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link to={user?.id ? `/storefront/${user.id}` : "/shop"} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" />View public storefront
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("products")}>
                    <Plus className="mr-2 h-4 w-4" />Add product or service
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl bg-emerald-950 p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">Store checklist</p>
                <div className="mt-4 space-y-3 text-sm">
                  <button onClick={() => setActiveTab("products")} className="flex w-full items-center justify-between rounded-xl bg-white/10 p-3 text-left hover:bg-white/15"><span>Products, pricing & stock</span><ArrowRight className="h-4 w-4" /></button>
                  <button onClick={() => setActiveTab("commerce")} className="flex w-full items-center justify-between rounded-xl bg-white/10 p-3 text-left hover:bg-white/15"><span>Orders & reservations</span><ArrowRight className="h-4 w-4" /></button>
                  <button onClick={() => setActiveTab("venues")} className="flex w-full items-center justify-between rounded-xl bg-white/10 p-3 text-left hover:bg-white/15"><span>Locations & fulfillment</span><ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commerce" className="mt-0">
          <MerchantCommerceConsole
            onOpenProducts={() => setActiveTab("products")}
            onOpenValidation={() => setActiveTab("redemptions")}
          />
        </TabsContent>

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
            <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
              <div className="flex flex-col gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
                <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Places you care for</p><h2 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.04em]">Your venues</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Keep each place ready for Moments, arrivals, offers, and the next reason to return.</p></div>
                <Button asChild className="rounded-full"><Link to="/dashboard/venues/add"><Plus className="mr-2 h-4 w-4" />Add Venue</Link></Button>
              </div>
              <div>
              {venues.map((venue) => (
                <div key={venue.id} className="group flex flex-col gap-4 border-b border-border/60 p-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background/60 text-primary"><Store className="h-5 w-5" /></span><div>
                        <h4 className="font-serif text-2xl font-semibold transition-colors group-hover:text-primary">{venue.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground"><MapPin className="mr-1.5 inline h-3.5 w-3.5" />{venue.address || venue.location || "Location to be completed"}</p>
                      </div></div>
                      <Badge variant={venue.is_active ? "default" : "outline"}>
                        {venue.is_active ? "Welcoming activity" : "Not currently visible"}
                      </Badge>
                </div>
              ))}
              </div>
            </section>
          )}
        </TabsContent>

        <TabsContent value="redemptions" className="mt-0">
          <RedemptionValidator />
        </TabsContent>

        <TabsContent value="products" className="mt-0">
          <ExperienceAttachmentManager />
          <div className="h-5" />
          <ProductCatalogManager />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <SalesAnalyticsDashboard />
        </TabsContent>
          </Tabs>

          <RoleActivationPanel
            eyebrow="Merchant Today"
            title={isNewMerchant ? "Make one place ready for real visits" : "Keep the door connected to people who want to return"}
            description={
              isNewMerchant 
                ? "Register the place first. From there, moments, offers, creator missions, and rewards have somewhere real to land."
                : "Keep the loop simple: host or receive the Moment, recognize the arrival or redemption, then give people a reason to come back."
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
                title: "Recognize arrivals",
                description: "Confirm check-ins and redemptions so the visit counts for everyone involved.",
                status: weeklyTraffic > 0 ? "current" : "todo",
                ctaLabel: "Validate",
                onClick: () => setActiveTab("redemptions"),
              },
            ]}
          />

          <DashboardQuickRoutesCard
            description="Keep scanning and venue tools easy to reach while the larger story stays focused on Moments, people, and return visits."
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

        {/* Right Utility Sidebar (Desktop) */}
        <RightUtilityRail
          onOpenSlashModal={() => setSlashOpen(true)}
          onOpenStreakModal={() => setStreakOpen(true)}
        />
      </div>

      {/* Gamification Modals */}
      <SpinWheelModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} />
      <TeamSlashModal isOpen={slashOpen} onClose={() => setSlashOpen(false)} />
      <DailyRewardsModal isOpen={streakOpen} onClose={() => setStreakOpen(false)} />
    </div>
  );
};

export default MerchantDashboardV2;
