import { useState } from "react";
import { BarChart3, Users, Gift, Plus, Eye, Building2, Sparkles, Handshake, Award, Star, DollarSign, Coins, Key, TrendingUp, ShoppingCart, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, useBrandStats } from "@/hooks/useCampaigns";
import { useBrandBounties } from "@/hooks/useBounties";
import { useBrandEconomy } from "@/hooks/useStakeholderEconomy";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandSponsorshipTab } from "@/components/brand/BrandSponsorshipTab";
import { AmbassadorManagement } from "@/components/brand/AmbassadorManagement";
import { LoyaltyProgramTab } from "@/components/brand/LoyaltyProgramTab";
import { BrandFundingTab } from "@/components/brand/BrandFundingTab";
import BudgetManager from "@/components/brand/BudgetManager";

const BrandDashboard = () => {
  const { user } = useAuth();
  const { data: campaigns, isLoading: campaignsLoading } = useBrandCampaigns();
  const { data: stats, isLoading: statsLoading } = useBrandStats();
  const { data: economy, isLoading: economyLoading } = useBrandEconomy();
  const { data: bounties, isLoading: bountiesLoading } = useBrandBounties();
  const [activeTab, setActiveTab] = useState("overview");

  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Brand Events <span className="text-primary italic">Overview</span>
          </h1>
          <p className="text-muted-foreground font-serif italic">
            Command your brand's presence and track every meaningful engagement.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/campaigns/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
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
            { label: "Points Distributed", value: economy?.totalPointsDistributed?.toLocaleString() || "0", icon: Coins, color: "text-amber-500" },
            { label: "Direct ROI", value: stats?.attributedSales ? `$${stats.attributedSales.toLocaleString()}` : "$0", icon: TrendingUp, color: "text-emerald-500" },
            { label: "Direct Claims", value: stats?.totalRedemptions?.toLocaleString() || "0", icon: Gift, color: "text-accent" },
            { label: "Active Events", value: stats?.activeCampaigns || 0, icon: BarChart3, color: "text-primary" },
          ].map((stat, index) => (
            <div key={index} className="group relative bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-background/50 border border-border/40 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground/70 mt-1">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="attribution" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">ROI</span>
          </TabsTrigger>
          <TabsTrigger value="sponsorships" className="gap-2">
            <span className="hidden sm:inline">Sponsorships</span>
          </TabsTrigger>
          <TabsTrigger value="funding" className="gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Funding</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Loyalty</span>
          </TabsTrigger>
          <TabsTrigger value="ambassadors" className="gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Ambassadors</span>
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Your Campaigns
            </h2>
            {campaigns && campaigns.length > 0 && (
              <Button variant="ghost" size="sm">View All</Button>
            )}
          </div>

          {campaignsLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : campaigns && campaigns.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No campaigns created yet</p>
              <Button variant="hero" asChild>
                <Link to="/dashboard/campaigns/create">Create Your First Campaign</Link>
              </Button>
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden shadow-soft-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Participants</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Redemptions</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rate</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns?.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{campaign.title}</p>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.is_active
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                          }`}>
                          {campaign.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-foreground">{campaign.impressions.toLocaleString()}</td>
                      <td className="p-4 text-foreground">{campaign.redemptions.toLocaleString()}</td>
                      <td className="p-4">
                        {campaign.impressions > 0 ? (
                          <span className="text-emerald-500 font-medium">
                            {((campaign.redemptions / campaign.impressions) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CTA */}
          <div className="bg-charcoal rounded-2xl p-8 text-cream">
            <div className="max-w-2xl">
              <h3 className="font-serif text-2xl font-bold mb-2">Ready to launch your next campaign?</h3>
              <p className="text-cream/70 mb-6">
                Connect with real people at real moments. Create experiences that resonate.
              </p>
              <Button variant="hero" asChild>
                <Link to="/dashboard/campaigns/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Attribution / ROI Tab */}
        <TabsContent value="attribution" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl p-8 border border-border shadow-soft">
                <h3 className="text-xl font-bold mb-6">Real-World Sales Attribution</h3>

                <div className="space-y-8">
                  {/* Attribution Chart Placeholder */}
                  <div className="h-64 rounded-xl bg-muted/30 flex items-center justify-center p-8 text-center">
                    <div>
                      <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4 opacity-50" />
                      <h4 className="font-bold mb-1">POS Data Sync Enabled</h4>
                      <p className="text-sm text-muted-foreground">Linking physical swipes at venues to your moment participants.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-muted/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Average Basket Size</p>
                      <p className="text-2xl font-bold">$42.50</p>
                      <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +12% vs organic
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-muted/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Visit-to-Purchase</p>
                      <p className="text-2xl font-bold">68%</p>
                      <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> Very High
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Basket Analysis
                </h4>
                <div className="space-y-3">
                  {[
                    { name: "Organic Cotton Tee", share: 45 },
                    { name: "Matcha Latte", share: 32 },
                    { name: "Artist Book", share: 18 }
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.share}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${item.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 italic">
                  *Based on Square and Toast POS data at 12 venues.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sponsorships" className="mt-6">
          <BrandSponsorshipTab />
        </TabsContent>

        {/* Funding Tab */}
        <TabsContent value="funding" className="space-y-6 mt-6">
          <BudgetManager organizationId={user?.user_metadata?.organization_id || ''} />
        </TabsContent>

        {/* Loyalty Program Tab */}
        <TabsContent value="loyalty" className="mt-6">
          <LoyaltyProgramTab />
        </TabsContent>

        {/* Ambassadors Tab */}
        <TabsContent value="ambassadors" className="mt-6">
          <AmbassadorManagement />
        </TabsContent>

        {/* Bounties Tab */}
        <TabsContent value="bounties" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Moment Bounties
            </h2>
            {bounties && bounties.length > 0 && (
              <Button variant="hero" size="sm" asChild>
                <Link to="/dashboard/bounties/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bounty
                </Link>
              </Button>
            )}
          </div>

          {bountiesLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : bounties && bounties.length === 0 ? (
            <div className="bg-card rounded-xl p-12 border border-border text-center shadow-sm">
              <Sparkles className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Request a Custom Moment</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Need a specific experience for your brand? Post a bounty and let our community of hosts compete to bring your vision to life.
              </p>
              <Button variant="hero" asChild>
                <Link to="/dashboard/bounties/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Bounty
                </Link>
              </Button>
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden shadow-soft-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bounty</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payout</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bounties?.map((bounty) => (
                    <tr key={bounty.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{bounty.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{bounty.requirements}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm capitalize text-muted-foreground">{bounty.target_category}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-primary">${bounty.payout_amount}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bounty.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' :
                          bounty.status === 'assigned' ? 'bg-blue-500/10 text-blue-500' :
                            bounty.status === 'submitted' ? 'bg-orange-500/10 text-orange-500' :
                              'bg-muted text-muted-foreground'
                          }`}>
                          {bounty.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">Manage</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandDashboard;
