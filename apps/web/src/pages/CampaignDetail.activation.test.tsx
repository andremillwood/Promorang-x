import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
const state=vi.hoisted(()=>({rpc:vi.fn(),campaign:{id:"owned",title:"Merchant plan",is_active:false,brand_id:"merchant",compiler_metadata:{}} as unknown,user:{id:"merchant"} as unknown,loading:false}));
vi.mock("@/contexts/AuthContext",()=>({useAuth:()=>({user:state.user,loading:state.loading,activeRole:"merchant",activeOrgId:"different-org"})}));
vi.mock("@/hooks/useCampaigns",()=>({useCampaign:()=>({data:state.campaign,isLoading:false})}));
vi.mock("@/hooks/useProofOutcome",()=>({useCampaignProofOutcome:()=>({})}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc:state.rpc}}));
vi.mock("@/i18n/I18nContext",()=>({useI18n:()=>({t:(key:string)=>key})}));
vi.mock("@/components/campaigns/PromoPilotExecutionPanel",()=>({PromoPilotExecutionPanel:()=>null}));
vi.mock("@/components/campaigns/DemandFlightPath",()=>({DemandFlightPath:()=>null}));
vi.mock("@/components/proof/ProofOutcomeRail",()=>({ProofOutcomeRail:()=>null}));
import CampaignDetail from "./CampaignDetail";
afterEach(cleanup);
const mount=()=>render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={["/dashboard/campaigns/owned"]}><Routes><Route path="/dashboard/campaigns/:id" element={<CampaignDetail/>}/><Route path="/dashboard/proposals/:id" element={<p>Activation next step</p>}/><Route path="/auth" element={<p>Sign in</p>}/></Routes></MemoryRouter></QueryClientProvider>);
it("shows owned detail for a merchant in a different selected workspace and continues through the server RPC",async()=>{
 state.rpc.mockResolvedValue({data:"proposal",error:null});mount();expect(screen.getByText("Merchant plan")).toBeInTheDocument();
 fireEvent.click(screen.getByRole("button",{name:/continueShaping/}));
 await waitFor(()=>expect(state.rpc).toHaveBeenCalledWith("open_campaign_activation",{p_campaign_id:"owned"}));
 expect(await screen.findByText("Activation next step")).toBeInTheDocument();
});
it("shows a missing/unauthorized campaign without an activation action",()=>{
 state.campaign=null;mount();expect(screen.getByText("This activation is not in your workspace.")).toBeInTheDocument();expect(screen.queryByRole("button",{name:/continueShaping/})).toBeNull();
});
