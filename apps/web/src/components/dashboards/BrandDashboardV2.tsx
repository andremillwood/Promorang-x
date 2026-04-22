import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Gift, 
  Plus, 
  Eye, 
  Building2, 
  Sparkles, 
  Handshake, 
  Award, 
  Star, 
  DollarSign, 
  Coins, 
  Key, 
  TrendingUp, 
  ShoppingCart,
  ChevronRight,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, useBrandStats } from "@/hooks/useCampaigns";
import { useBrandBounties } from "@/hooks/useBounties";
import { useBrandEconomy } from "@/hooks/useStakeholderEconomy";
import { RoleActivationPanel } from "@/components/activation/RoleActivationPanel";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandSponsorshipTab } from "@/components/brand/BrandSponsorshipTab";
import { FlashCampaignCompiler } from "@/components/campaigns/FlashCampaignCompiler";
import { BrandEstimator } from "@/components/brand/BrandEstimator";
import { IntelligenceBureau } from "@/components/brand/IntelligenceBureau";

// ============================================================================
// BRAND DASHBOARD V2
// Campaign-first design with progressive disclosure
// ============================================================================

const BrandDashboardV2 = () => {
  const { user } = useAuth();
  const { data: campaigns, isLoading: campaignsLoading } = useBrandCampaigns();
  const { data: stats, isLoading: statsLoading } = useBrandStats();
  const { data: economy, isLoading: economyLoading } = useBrandEconomy();
  const { data: bounties } = useBrandBounties();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "campaigns";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isFlashCompilerOpen, setIsFlashCompilerOpen] = useState(false);

  // Calculate brand maturity
  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];
  const isNewBrand = !campaigns || campaigns.length === 0;
  const isActiveBrand = campaigns && campaigns.length > 0 && campaigns.length < 3;
  const isEstablishedBrand = campaigns && campaigns.length >= 3;

  // Calculate total impact
  const totalImpressions = campaigns?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 0;
  const totalRedemptions = campaigns?.reduce((sum, c) => sum + (c.redemptions || 0), 0) || 0;

  return (
    <div className="space-y-6 pb-20">
      {/* =====================================================================
          HEADER: Context-aware
          ===================================================================== */}
      {isNewBrand ? (
        // Simple welcome for new brands
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 border border-primary/10 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
                <Building2 className="w-3 h-3" />
                Brand Hub
              </div>
              <h1 className="font-serif text-2xl font-bold mb-1">
                Welcome, <span className="italic text-primary">{user?.user_metadata?.full_name?.split(" ")[0] || "Partner"}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Launch campaigns that connect with real people in real places
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button 
                variant="outline" 
                onClick={() => setIsFlashCompilerOpen(!isFlashCompilerOpen)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Launch
              </Button>
              <Button asChild>
                <Link to="/dashboard/campaigns/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        // Full header for active brands
        <section className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              Brand <span className="text-primary italic">Events</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              See how your campaigns connect with real people
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            {stats && (
              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Target className="w-4 h-4 text-primary" />
                  {activeCampaigns.length} active
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <Users className="w-4 h-4 text-accent" />
                  {totalImpressions.toLocaleString()} reached
                </span>
              </div>
            )}
            <Button onClick={() => setIsFlashCompilerOpen(!isFlashCompilerOpen)}>
              <Zap className="w-4 h-4 mr-2" />
              Quick Launch
            </Button>
          </div>
        </section>
      )}

      {/* =====================================================================
          FLASH COMPILER: Collapsible quick create
          ===================================================================== */}
      {isFlashCompilerOpen && (
        <div className="animate-in slide-in-from-top-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Flash Launchpad</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsFlashCompilerOpen(false)}>
              Close
            </Button>
          </div>
          <FlashCampaignCompiler onSuccess={() => setIsFlashCompilerOpen(false)} />
        </div>
      )}

      {/* =====================================================================
          NEW BRAND: First Campaign Guidance
          ===================================================================== */}
      {isNewBrand && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Launch Your First Campaign</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start with a single activation: create the campaign, connect it to creators or venues, 
                  then review real-world impact.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/dashboard/campaigns/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("planner")}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Plan First
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          BRAND JOURNEY: Progress indicator
          ===================================================================== */}
      {!isNewBrand && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">Brand Journey</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {isEstablishedBrand ? "3/3" : isActiveBrand ? "2/3" : "1/3"}
              </Badge>
            </div>
            <Progress 
              value={isEstablishedBrand ? 100 : isActiveBrand ? 66 : 33} 
              className="h-2 mb-3" 
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { 
                  label: "First campaign", 
                  done: campaigns && campaigns.length > 0,
                  icon: Target
                },
                { 
                  label: "Get participants", 
                  done: totalImpressions > 0,
                  icon: Users
                },
                { 
                  label: "3+ campaigns", 
                  done: isEstablishedBrand,
                  icon: Award
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
          STATS: Only for active brands
          ===================================================================== */}
      {!isNewBrand && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {statsLoading || economyLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            [
              { 
                label: "Points Given", 
                value: economy?.totalPointsDistributed?.toLocaleString() || "0", 
                icon: Coins, 
                color: "text-amber-500" 
              },
              { 
                label: "Participants", 
                value: totalImpressions.toLocaleString(), 
                icon: Users, 
                color: "text-blue-500" 
              },
              { 
                label: "Redemptions", 
                value: totalRedemptions.toLocaleString(), 
                icon: Gift, 
                color: "text-accent" 
              },
              { 
                label: "Active Campaigns", 
                value: activeCampaigns.length, 
                icon: Target, 
                color: "text-primary" 
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
          ACTIVE CAMPAIGNS: Priority display
          ===================================================================== */}
      {!isNewBrand && (
        <section>
          <div className="flex min-w-0 flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-xl font-bold">
              {activeCampaigns.length > 0 ? "Active Campaigns" : "Your Campaigns"}
            </h2>
            {campaigns && campaigns.length > 3 && (
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("campaigns")}>
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {campaignsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : campaigns && campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No campaigns yet</p>
                <Button asChild>
                  <Link to="/dashboard/campaigns/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(activeCampaigns.length > 0 ? activeCampaigns : campaigns.slice(0, 3)).map((campaign) => (
                <Card key={campaign.id} className="group hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                            {campaign.title}
                          </h3>
                          <Badge 
                            variant={campaign.is_active ? "default" : "outline"}
                            className="text-[10px] flex-shrink-0"
                          >
                            {campaign.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {campaign.description}
                          </p>
                        )}
                        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex min-w-0 items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {campaign.impressions.toLocaleString()} views
                          </span>
                          <span className="flex min-w-0 items-center gap-1">
                            <Gift className="w-3 h-3" />
                            {campaign.redemptions.toLocaleString()} redemptions
                          </span>
                          {campaign.impressions > 0 && (
                            <span className="text-emerald-500">
                              {((campaign.redemptions / campaign.impressions) * 100).toFixed(1)}% rate
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="self-start sm:self-center" asChild>
                        <Link to={`/dashboard/campaigns/${campaign.id}`}>
                          Manage
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
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
          <TabsTrigger value="campaigns" className="gap-2">
            <Building2 className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="planner" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Planner
          </TabsTrigger>
          {!isNewBrand && (
            <TabsTrigger value="sponsorships" className="gap-2">
              <Handshake className="w-4 h-4" />
              Sponsors
            </TabsTrigger>
          )}
          {isEstablishedBrand && (
            <TabsTrigger value="insights" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Insights
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="campaigns" className="mt-0">
          {campaignsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : campaigns && campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-medium mb-2">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first campaign to start connecting with participants
                </p>
                <Button asChild>
                  <Link to="/dashboard/campaigns/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-soft transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="font-medium">{campaign.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.impressions.toLocaleString()} impressions • {campaign.redemptions.toLocaleString()} redemptions
                        </p>
                      </div>
                      <Badge variant={campaign.is_active ? "default" : "outline"}>
                        {campaign.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planner" className="mt-0">
          <BrandEstimator />
        </TabsContent>

        {!isNewBrand && (
          <TabsContent value="sponsorships" className="mt-0">
            <BrandSponsorshipTab />
          </TabsContent>
        )}

        {isEstablishedBrand && (
          <TabsContent value="insights" className="mt-0">
            <IntelligenceBureau />
          </TabsContent>
        )}
      </Tabs>

      {/* =====================================================================
          ROLE ACTIVATION: Always visible guidance
          ===================================================================== */}
      <RoleActivationPanel
        eyebrow="Brand Today"
        title={isNewBrand ? "Start your brand journey" : "Grow your impact"}
        description={
          isNewBrand 
            ? "Create your first campaign to begin connecting with real people."
            : "Launch one campaign you can actually attribute before scaling."
        }
        items={[
          {
            title: "Create campaign",
            description: "Launch with clear outcome and reward path",
            status: campaigns && campaigns.length > 0 ? "done" : "current",
            href: "/dashboard/campaigns/create",
            ctaLabel: "Create",
          },
          {
            title: "Connect creators",
            description: "Attach operators and distribution",
            status: activeTab === "sponsorships" ? "current" : "todo",
            ctaLabel: "Sponsors",
            onClick: () => setActiveTab("sponsorships"),
          },
          {
            title: "View impact",
            description: "Confirm joins, check-ins, and sales",
            status: totalRedemptions > 0 ? "done" : "todo",
            ctaLabel: "Impact",
            onClick: () => setActiveTab("insights"),
          },
        ]}
      />
    </div>
  );
};

export default BrandDashboardV2;
