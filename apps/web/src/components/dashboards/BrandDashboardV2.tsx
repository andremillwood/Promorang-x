import type { ReactNode } from "react";
import { RoleWorkspaceTabs } from "@/components/dashboard/RoleWorkspaceTabs";
import { DashboardHero } from "@/components/dashboard/DashboardSurface";
import { useRoleWorkspaceTab } from "@/hooks/useRoleWorkspaceTab";
import { useI18n as useWebI18n } from "@/i18n/I18nContext";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Circle,
  Coins,
  Link2,
  Megaphone,
  PackageCheck,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Vote,
} from "lucide-react";
import { DiscoveryDemandInbox } from "@/components/discovery/DiscoveryDemandInbox";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns } from "@/hooks/useCampaigns";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Modular Brand Consoles
import BrandCampaignFlightDeck from "@/components/brand/BrandCampaignFlightDeck";
import BrandOpportunityRadar from "@/components/brand/BrandOpportunityRadar";
import BrandCreatorBureau from "@/components/brand/BrandCreatorBureau";
import BrandCorrelationMap from "@/components/brand/BrandCorrelationMap";
import BrandIntelligenceConsole from "@/components/brand/BrandIntelligenceConsole";
import { BusinessOutcomeEntry } from "@/components/business/BusinessOutcomeEntry";

export function BrandDashboardV2() {
  const { t: webT } = useWebI18n();
  const { user, organizations, activeOrgId, profile, agencyClients } = useAuth();
  const { data: campaigns, isLoading: campaignsLoading, isError: campaignsError, isFetching: campaignsFetching, refetch: retryCampaigns } = useBrandCampaigns();
  const { activeTab, setActiveTab: handleTabChange, searchParams } = useRoleWorkspaceTab("campaigns", ["demand", "campaigns", "opportunities", "creators", "correlation", "insights"]);

  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const managingAgency = organizations.find((org) => org.type === "agency");
  const isManagedClient = agencyClients.some((client) => client.id === activeOrgId);
  const activeBrandName =
    activeOrg?.name || profile?.display_name || user?.user_metadata?.full_name || "Brand Partner";

  const activeCampaigns = campaigns?.filter((c) => c.is_active) || [];
  const totalRedemptions = campaigns?.reduce((sum, c) => sum + (c.redemptions || 0), 0) || 0;
  const isNewBrandWorkspace = !campaignsLoading && (campaigns?.length || 0) === 0;

  if (campaignsError && !campaigns) {
    return <section className="rounded-sm  p-6" role="status"><h1 className="font-sans text-2xl font-semibold">{activeBrandName}</h1><p className="mt-3 text-sm text-white/70">Campaigns are unavailable. Try loading this workspace again.</p><Button className="mt-4" disabled={campaignsFetching} onClick={() => void retryCampaigns()}>{webT(campaignsFetching ? "common.tryingAgain" : "common.tryAgain")}</Button></section>;
  }

  let starterGuide: ReactNode = null;
  if (isNewBrandWorkspace) {
    const pilotTitle = `First 50 for ${activeBrandName}`;
    const pilotOutcome = "Create one small measurable demand test, move 50 real people to act, and use the recorded result to decide what should scale.";

    starterGuide = (
      <div className="min-w-0 space-y-6 pb-16 text-white">
        <p className="text-sm text-white/65">Suggested pilot target: 50 attributable customer actions.</p>
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="rounded-sm  bg-card/70 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Recommended first activation</p>
                <h2 className="mt-2 text-xl font-black sm:text-2xl">{pilotTitle}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{pilotOutcome}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: webT("home.act01Title"),
                  copy: "Decide the single customer behavior this test should create.",
                },
                {
                  step: "02",
                  title: "Give a reason to act",
                  copy: "Use an approved offer, sample, access, useful content, or other incentive that makes the action worthwhile.",
                },
                {
                  step: "03",
                  title: webT("commercial.capture.proof.347"),
                  copy: "Track attributable claims, visits, redemptions, purchases, reviews, or referrals so the client can see what happened.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-sm  bg-black/25 p-4">
                  <span className="text-[10px] font-black text-primary">{item.step}</span>
                  <h3 className="mt-2 text-sm font-black">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/50">{item.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-sm font-black">
                <Link to="/create/campaign">
                  Create the pilot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="rounded-sm" onClick={() => handleTabChange("demand")}>
                See what people are asking for
              </Button>
            </div>
          </div>

          <div className="rounded-sm  bg-card/70 p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Before launch</p>
            <h2 className="mt-2 text-xl font-black">What needs to be confirmed before launch</h2>
            <div className="mt-5 space-y-3">
              {[
                "Confirm the product, service, or offer being promoted",
                "Approved product details, pack sizes and current pricing where relevant",
                "Approved images or creative assets",
                "The incentive or customer reason to act",
                "Where the customer action happens: online, retail, event, QR, WhatsApp, or another channel",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-sm  bg-black/20 p-3">
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-5 text-white/65">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-white/40">You can prepare the campaign before every asset is supplied. Do not invent prices, product claims, or promotions on the client’s behalf.</p>
          </div>
        </section>

        <details className="rounded-sm  bg-card/70 p-5 sm:p-6">
          <summary className="min-h-11 cursor-pointer text-sm font-semibold">How to review your first result</summary>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">The reason to use Promorang</p>
              <h2 className="mt-2 text-xl font-black">From activity to a client decision</h2>
            </div>
            <span className="text-xs font-bold text-white/45">Start small → prove movement → scale only what works</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              { icon: Sparkles, title: webT("drops.launch"), copy: "Put one clear customer action into market." },
              { icon: Users, title: "Move people", copy: "Get the first 50 attributable participants." },
              { icon: PackageCheck, title: webT("activity.prove"), copy: "Show what people actually did, not only what they saw." },
              { icon: TrendingUp, title: webT("how.memberStep1Badge"), copy: "Use the result to stop, adjust, or scale the next activation." },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-sm  bg-black/20 p-4">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-black">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/50">{copy}</p>
              </div>
            ))}
          </div>
        </details>
      </div>
    );
  }

  return (
    <div data-role-workspace="brand" className="dark min-w-0 space-y-6 pb-16 text-white">
      <DashboardHero badge={isManagedClient ? `Managed by ${managingAgency?.name || "your agency"}` : "Brand workspace"} title={activeBrandName} description="Launch campaigns, review customer actions and manage your budget." actions={isNewBrandWorkspace ? [] : [{ label: "New activation", href: "/create/campaign", icon: Plus }, { label: "Budget", href: "/wallet", icon: Coins }]} stats={[{label: "Active campaigns", value: String(activeCampaigns.length), helper: "Currently active", icon: Megaphone}, {label: "Recorded redemptions", value: String(totalRedemptions), helper: "Across your campaigns", icon: Coins}]} isLoading={campaignsLoading} />

      <div className="grid gap-6">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <RoleWorkspaceTabs label="Brand workspace" items={[
          { id: "demand", label: "Demand signals", icon: Vote, hint: "What people are asking for" },
          { id: "campaigns", label: webT("adminDash.activations"), icon: Megaphone, hint: "Campaigns and budget" },
          { id: "opportunities", label: webT("people.opportunities"), icon: Target, hint: "Places and moments to activate" },
          { id: "creators", label: webT("how.brandStep3Badge"), icon: Users, hint: "Creator and partner work" },
          { id: "correlation", label: webT("promoPushLandingPage.step3Title"), icon: Link2, hint: "Attributed customer action" },
          { id: "insights", label: "Economics", icon: Coins, hint: "Budget and outcomes" },
        ]} />
            <TabsContent value="demand" className="mt-0"><DiscoveryDemandInbox role="brand" sceneId={searchParams.get("scene_id") || undefined} /></TabsContent>
            <TabsContent value="campaigns" className="mt-0">{starterGuide || <BrandCampaignFlightDeck />}</TabsContent>
            <TabsContent value="opportunities" className="mt-0"><BrandOpportunityRadar /></TabsContent>
            <TabsContent value="creators" className="mt-0"><BrandCreatorBureau /></TabsContent>
            <TabsContent value="correlation" className="mt-0"><BrandCorrelationMap /></TabsContent>
            <TabsContent value="insights" className="mt-0"><BrandIntelligenceConsole /></TabsContent>
          </Tabs>
        </div>
      </div>
      <details className="rounded-sm  p-4"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">Plan a business outcome</summary><div className="mt-4"><BusinessOutcomeEntry role="brand" /></div></details>
    </div>
  );
}

export default BrandDashboardV2;
