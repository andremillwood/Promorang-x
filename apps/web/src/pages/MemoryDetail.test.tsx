import {render,screen,waitFor} from "@testing-library/react";
import {MemoryRouter,Routes,Route} from "react-router-dom";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import MemoryDetail from "./MemoryDetail";
vi.mock("@/contexts/AuthContext",()=>({useAuth:()=>({user:{id:"member"},session:{access_token:"local-test-only"}})}));
vi.mock("@/hooks/useRetainedMomentArtwork",()=>({useRetainedMomentArtwork:()=>[{id:"actual-moment",image_url:"/actual.jpg"}]}));
vi.mock("@/components/SEO",()=>({default:()=>null}));
function show(){const client=new QueryClient({defaultOptions:{queries:{retry:false}}});return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/memories/piece"]}><Routes><Route path="/memories/:id" element={<MemoryDetail/>}/></Routes></MemoryRouter></QueryClientProvider>)}
beforeEach(()=>{vi.stubGlobal("fetch",vi.fn())});afterEach(()=>vi.unstubAllGlobals());
describe("Piece provenance",()=>{
 it("shows only recorded history and does not turn a Piece into verified attendance",async()=>{
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({memory:{id:"piece",title:"First night",moment_id:"actual-moment",issued_at:"2026-10-25",metadata:{},perk:null}})));show();await screen.findByRole("heading",{name:"First night"});expect(screen.getByText("Issued to your Vault")).toBeInTheDocument();expect(screen.queryByText("Participation verified")).not.toBeInTheDocument();expect(screen.getByRole("link",{name:/Revisit the Moment/})).toHaveAttribute("href","/moments/actual-moment");expect(document.querySelector('img[src="/actual.jpg"]')).not.toBeNull();expect(screen.getByText(/No access has been attached/)).toBeInTheDocument();
 });
 it("labels expired attached access without presenting a live reward",async()=>{
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({memory:{id:"piece",title:"First night",perk:{benefit_value:"Coffee",expires_at:"2020-01-01"}}})));show();await screen.findByText("Coffee");expect(screen.getByText(/Expired ·/)).toBeInTheDocument();expect(screen.getByRole("link",{name:/Open my Card/})).toHaveAttribute("href","/card");
 });
 it("offers recovery on a failed personal memory request",async()=>{
  vi.mocked(fetch).mockResolvedValue(new Response("{}",{status:503}));show();await waitFor(()=>expect(screen.getByRole("alert")).toHaveTextContent("Your Piece couldn’t load."));expect(screen.getByRole("button",{name:"Try again"})).toBeEnabled();
 });
});
