import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { translations } from "@/i18n/translations";
import CreatorDashboard from "./CreatorDashboardV2";
import HostDashboard from "./HostDashboardV2";
import MerchantDashboard from "./MerchantDashboardV2";
import BrandDashboard from "./BrandDashboardV2";
import AgencyDashboard from "./AgencyDashboard";
const state = vi.hoisted(() => ({ campaigns: [] as Array<{id:string;is_active:boolean;redemptions:number} > | undefined, error:false, retry:vi.fn() }));
vi.mock("@/i18n/I18nContext", () => ({ useI18n: () => ({ t: (key: keyof typeof translations.en) => translations.en[key] || key }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user:{id:"qa"}, profile:{display_name:"Test brand"}, organizations:[],agencyClients:[],roles:[] }) }));
vi.mock("@/hooks/useCampaigns", () => ({ useBrandCampaigns: () => ({ data:state.campaigns,isLoading:false,isError:state.error,refetch:state.retry }), useBrandStats: () => ({}) }));
vi.mock("@/hooks/useMoments", () => ({ useHostedMoments: () => ({data:[],isLoading:false}) }));
vi.mock("@/hooks/useVenues", () => ({ useMerchantVenues: () => ({data:[],isLoading:false}) }));
vi.mock("@/hooks/useAgencyClients", () => ({ useAgencyRelationships: () => ({data:{relationships:[]}}), useDeleteAgencyRelationship: () => ({}) }));
vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({data:[]}) }));
vi.mock("@/components/business/BusinessOutcomeEntry", () => ({ BusinessOutcomeEntry: () => <p>Business planning</p> }));
vi.mock("@/components/discovery/DiscoveryDemandInbox", () => ({ DiscoveryDemandInbox: () => <h2>Demand panel</h2> }));
vi.mock("@/components/creator/CreatorReleaseWorkspaceBridge", () => ({ default: ({mode}: {mode:string}) => <h2>Release {mode}</h2> }));
vi.mock("@/components/creator/CreatorAttributionMap", () => ({ default: () => <h2>Attribution panel</h2> }));
vi.mock("@/components/creator/CreatorEarningsVault", () => ({ default: () => <h2>Earnings panel</h2> }));
vi.mock("@/components/creator/CreatorReputationDeck", () => ({ default: () => <h2>Reputation panel</h2> }));
vi.mock("@/components/creator/CreatorProofDossier", () => ({ default: () => <h2>Proof panel</h2> }));
vi.mock("@/components/host/HostMomentsStagingConsole", () => ({ default: () => <h2>Events panel</h2> }));
vi.mock("@/components/host/HostDoorBoardLauncher", () => ({ default: () => <h2>Arrivals panel</h2> }));
vi.mock("@/components/host/HostProofReviewConsole", () => ({ default: () => <h2>Review panel</h2> }));
vi.mock("@/components/host/HostSponsorshipConsole", () => ({ default: () => <h2>Sponsors panel</h2> }));
vi.mock("@/components/host/HostImpactYieldConsole", () => ({ default: () => <h2>Impact panel</h2> }));
vi.mock("@/components/merchant/MerchantScannerStation", () => ({ default: () => <h2>Validation panel</h2> }));
vi.mock("@/components/merchant/MerchantStorefrontConsole", () => ({ default: () => <h2>Storefront panel</h2> }));
vi.mock("@/components/merchant/MerchantCommerceConsole", () => ({ MerchantCommerceConsole: () => <h2>Commerce panel</h2> }));
vi.mock("@/components/merchant/MerchantVenueStudio", () => ({ default: ({onOpenMoments}: {onOpenMoments: () => void}) => <><h2>Venues panel</h2><button onClick={onOpenMoments}>Create an event</button></> }));
vi.mock("@/components/merchant/MerchantYieldAnalytics", () => ({ default: () => <h2>Analytics panel</h2> }));
vi.mock("@/components/brand/BrandCampaignFlightDeck", () => ({ default: () => <h2>Campaign panel</h2> }));
vi.mock("@/components/brand/BrandOpportunityRadar", () => ({ default: () => <h2>Opportunities panel</h2> }));
vi.mock("@/components/brand/BrandCreatorBureau", () => ({ default: () => <h2>Creators panel</h2> }));
vi.mock("@/components/brand/BrandCorrelationMap", () => ({ default: () => <h2>Results panel</h2> }));
vi.mock("@/components/brand/BrandIntelligenceConsole", () => ({ default: () => <h2>Intelligence panel</h2> }));
vi.mock("@/components/agency/AgencyManagedResultPack", () => ({ AgencyManagedResultPack: () => <h2>Result pack</h2> }));
vi.mock("@/components/agency/QuickAddClient", () => ({ QuickAddClient: () => <button>Add client</button> }));
vi.mock("@/components/activation/RoleActivationPanel", () => ({ RoleActivationPanel: () => <h2>Activation panel</h2> }));
function Location() {const location = useLocation(); return <><output data-testid="url">{location.search}</output><output data-testid="path">{location.pathname}</output></>;}
beforeEach(()=>{state.campaigns=[{id:"test",is_active:true,redemptions:3}];state.error=false;state.retry.mockClear();});
describe("role workspace navigation",()=>{
  for(const [role,Component,count] of [["Creator",CreatorDashboard,7],["Host",HostDashboard,6],["Merchant",MerchantDashboard,6],["Brand",BrandDashboard,6]] as const){
    it(`${role} has one real tab list with connected panels and URL selection`,()=>{
      render(<MemoryRouter initialEntries={["/?view=studio&keep=1"]}><Component /><Location /></MemoryRouter>);
      const tabs=screen.getByRole("tablist",{name:`${role} workspace`});
      expect(screen.getAllByRole("tablist")).toHaveLength(1);
      expect(within(tabs).getAllByRole("tab")).toHaveLength(count);
      const demand=within(tabs).getAllByRole("tab")[0];fireEvent.mouseDown(demand, { button: 0, ctrlKey: false });
      expect(demand).toHaveAttribute("aria-selected","true");
      expect(document.getElementById(demand.getAttribute("aria-controls")!)).toHaveAttribute("role","tabpanel");
      expect(screen.getByRole("heading",{name:"Demand panel"})).toBeInTheDocument();
      expect(screen.getByTestId("url")).toHaveTextContent("view=studio&keep=1&tab=demand");
    });
  }
  it("opens event creation from merchant venue tools instead of reselecting the same tab", () => {
    render(<MemoryRouter initialEntries={["/?view=studio&tab=venues"]}><MerchantDashboard /><Location /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", {name: "Create an event"}));
    expect(screen.getByTestId("path")).toHaveTextContent("/create/moment");
  });
  it("opens demand from the first-time brand guide",()=>{
    state.campaigns=[];
    render(<MemoryRouter><BrandDashboard /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:"See what people are asking for"}));
    expect(screen.getByRole("heading",{name:"Demand panel"})).toBeInTheDocument();
  });
  it("offers retry instead of presenting failed campaigns as a new brand",()=>{
    state.campaigns=undefined;state.error=true;
    render(<MemoryRouter><BrandDashboard /></MemoryRouter>);
    expect(screen.queryByText(/First 50/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Try again"}));expect(state.retry).toHaveBeenCalledOnce();
  });
  it("retains agency section selection in the URL without fake tab semantics",()=>{
    render(<MemoryRouter initialEntries={["/?view=studio&keep=1"]}><AgencyDashboard /><Location /></MemoryRouter>);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    const nav=screen.getByRole("navigation",{name:translations.en["agencyDash.workspaceTitle"]});
    fireEvent.click(within(nav).getAllByRole("button")[2]);
    expect(screen.getByTestId("url")).toHaveTextContent("tab=impact");
    expect(document.getElementById("agency-impact")).not.toHaveClass("hidden");
    expect(screen.queryByRole("button",{name:"Choose client workspace"})).not.toBeInTheDocument();
  });
});
