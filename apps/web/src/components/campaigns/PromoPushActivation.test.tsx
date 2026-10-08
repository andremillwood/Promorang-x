import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const rpc=vi.hoisted(()=>vi.fn());
vi.mock("@/contexts/AuthContext",()=>({useAuth:()=>({session:{access_token:"test"}})}));
vi.mock("@/integrations/supabase/client",()=>({supabase:{rpc}}));
import { PromoPushActivation } from "./PromoPushActivation";
import type { PromoPushCampaign } from "@/hooks/usePromoPush";
const campaign={id:"draft",push_mode:"geo",status:"draft",funding_status:"unfunded",pricing:{quote_id:"quote",total_gems:50,expires_at:"2099-01-01"}} as PromoPushCampaign;
const mount=(c=campaign)=>render(<MemoryRouter><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><PromoPushActivation campaign={c}/></QueryClientProvider></MemoryRouter>);
afterEach(()=>{cleanup();vi.restoreAllMocks();});beforeEach(()=>rpc.mockReset());
it("requires approval and passes only campaign and quote IDs to funding",async()=>{
 rpc.mockResolvedValue({data:{},error:null});mount();
 expect(rpc).not.toHaveBeenCalled();expect(screen.queryByRole("button",{name:"Launch PromoPush"})).toBeNull();
 fireEvent.click(screen.getByRole("button",{name:/Approve quote/}));
 await waitFor(()=>expect(rpc).toHaveBeenCalledWith("fund_promopush",{p_campaign_id:"draft",p_quote_id:"quote"}));
 expect(screen.queryByText(/Gems secured/)).toBeNull(); // RPC completion alone isn't campaign state.
});
it("reports insufficient funds and leaves retry available",async()=>{
 rpc.mockResolvedValue({error:new Error("Insufficient Gem balance")});mount();fireEvent.click(screen.getByRole("button",{name:/Approve quote/}));
 expect(await screen.findByRole("alert")).toHaveTextContent("Insufficient");
 expect(screen.getByRole("button",{name:/Approve quote/})).not.toBeDisabled();
});
it("blocks expired quotes and permits cancellation",async()=>{
 rpc.mockResolvedValue({error:null});mount({...campaign,pricing:{...campaign.pricing,expires_at:"2000-01-01"}});
 expect(screen.queryByRole("button",{name:/Approve quote/})).toBeNull();fireEvent.click(screen.getByRole("button",{name:"Cancel draft"}));
 await waitFor(()=>expect(rpc).toHaveBeenCalledWith("cancel_promopush",{p_campaign_id:"draft"}));
});
it("does not infer a live campaign from a launch response",async()=>{
 const fetcher=vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response(JSON.stringify({campaign:{status:"active"}}),{status:200}));
 mount({...campaign,funding_status:"secured",funding_available_gems:50});fireEvent.click(screen.getByRole("button",{name:"Launch PromoPush"}));
 await waitFor(()=>expect(fetcher).toHaveBeenCalled());expect(screen.queryByText("Live — confirmed by the server.")).toBeNull();
});
