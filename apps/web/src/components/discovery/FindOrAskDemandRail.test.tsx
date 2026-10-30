import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";
import {beforeEach,describe,expect,it,vi} from "vitest";
import {I18nProvider} from "@/i18n/I18nContext";
import {FindOrAskDemandRail} from "./FindOrAskDemandRail";
const state=vi.hoisted(()=>({data:[] as Array<Record<string,unknown>>,error:false,refetch:vi.fn(),support:vi.fn(),outcomes:[] as Array<Record<string,unknown>>}));
vi.mock("@/contexts/AuthContext",()=>({useAuth:()=>({user:{id:"member"},activeRole:"participant"})}));
vi.mock("@/hooks/useFindOrAsk",()=>({
 useFindOrAskDiscoveries:()=>({data:state.data,isError:state.error,isLoading:false,isFetching:false,refetch:state.refetch}),
 useSupportFindOrAskDemand:()=>({mutateAsync:state.support,isPending:false,isError:false}),
 useFindOrAskOutcomes:()=>({data:state.outcomes}),
}));
vi.mock("@/components/discovery/FindOrAskStakeholderResponse",()=>({FindOrAskStakeholderResponse:()=>null}));
vi.mock("@/lib/marketing-attribution",()=>({trackGrowthEvent:vi.fn()}));
function show(){return render(<I18nProvider><MemoryRouter><FindOrAskDemandRail city="Kingston" showEmpty /></MemoryRouter></I18nProvider>)}
beforeEach(()=>{vi.clearAllMocks();state.data=[];state.outcomes=[];state.error=false;state.support.mockResolvedValue(128)});
describe("participant Wants",()=>{
 it("recovers an unavailable demand source without presenting an empty market",()=>{
  state.error=true;show();expect(screen.getByText("Wants couldn’t load.")).toBeInTheDocument();fireEvent.click(screen.getByRole("button",{name:"Try again"}));expect(state.refetch).toHaveBeenCalledOnce();
 });
 it("supports a real demand and keeps an answered Moment separate from the threshold",async()=>{
  state.data=[{id:"want",question:"More outdoor music",semantic_kind:"demand",support_count:127,demand_target:200,created_at:"2026-10-01"}];
  state.outcomes=[{id:"pending",verification_status:"pending",canonical_object_type:"moment",canonical_object_id:"pending-event"},{id:"verified",verification_status:"verified",canonical_object_type:"moment",canonical_object_id:"actual-event",source_label:"Published music night"}];
  show();expect(screen.getByRole("link",{name:/Published music night/})).toHaveAttribute("href","/moments/actual-event");expect(document.querySelector('a[href="/moments/pending-event"]')).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:/I want this too/i}));await waitFor(()=>expect(state.support).toHaveBeenCalledWith("want"));await waitFor(()=>expect(screen.getByRole("button",{name:/^Added$/i})).toBeDisabled());
 });
 it("does not claim support when the mutation fails",async()=>{
  state.data=[{id:"want",question:"More outdoor music",semantic_kind:"demand",support_count:2,created_at:"2026-10-01"}];state.support.mockRejectedValue(new Error("offline"));show();const action=screen.getByRole("button",{name:/I want this too/i});fireEvent.click(action);await waitFor(()=>expect(state.support).toHaveBeenCalledOnce());expect(action).not.toBeDisabled();
 });
 it("keeps progress within the published target while showing the actual count",()=>{
  state.data=[{id:"want",question:"More outdoor music",semantic_kind:"demand",support_count:327,demand_target:200,created_at:"2026-10-01"}];show();expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow","200");expect(screen.getByText(/327 people want this/)).toBeInTheDocument();
 });
});
